import Phaser from "phaser";
import { tileSize, toolLabels } from "../data/gameData";
import { Player } from "../entities/Player";
import { Assistant } from "../entities/Assistant";
import { CBRSystem } from "../systems/CBRSystem";
import { CropSystem } from "../systems/CropSystem";
import { DayNightSystem } from "../systems/DayNightSystem";
import { FarmMap } from "../systems/FarmMap";
import { InventorySystem } from "../systems/InventorySystem";
import { PlayerSystem } from "../systems/PlayerSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { WeatherSystem } from "../systems/WeatherSystem";
import { UISystem } from "../ui/UISystem";
import type { CBRCurrentCase, CropPlotState, GameSaveState, PendingLearningCase, ToolId, Vector2Like } from "../types";
import { CropPlot } from "../entities/CropPlot";

interface TargetPlotInfo {
  tile: Vector2Like;
  plot: CropPlotState;
}

type DebugWindow = Window & {
  fazendinhaGame?: FarmScene;
};

export class FarmScene extends Phaser.Scene {
  map!: FarmMap;
  crops!: CropSystem;
  inventory!: InventorySystem;
  weather!: WeatherSystem;
  dayNight!: DayNightSystem;
  cbr!: CBRSystem;
  ui!: UISystem;
  player!: Player;
  playerSystem!: PlayerSystem;
  pendingCases: PendingLearningCase[] = [];

  private mapGraphics!: Phaser.GameObjects.Graphics;
  private cropGraphics!: Phaser.GameObjects.Graphics;
  private overlayGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super("FarmScene");
  }

  create(): void {
    const saved = SaveSystem.loadGame();

    this.map = new FarmMap();
    this.inventory = new InventorySystem(saved?.inventory);
    this.weather = new WeatherSystem(saved?.weather ?? "ensolarado");
    this.dayNight = new DayNightSystem(saved?.day ?? 1);
    this.cbr = new CBRSystem();
    this.pendingCases = saved?.pendingCases ?? [];
    this.crops = new CropSystem(this.map.plantingTiles, saved?.crops);

    this.mapGraphics = this.add.graphics().setDepth(0);
    this.cropGraphics = this.add.graphics().setDepth(2);
    this.overlayGraphics = this.add.graphics().setDepth(4);

    this.map.render(this.mapGraphics);
    this.crops.render(this.cropGraphics, this.map.tileSize);

    new Assistant(this, this.map.assistantTile, this.map.tileSize).setDepth(3);
    this.player = new Player(this, 9.5 * tileSize, 8.5 * tileSize, saved?.player).setDepth(5) as Player;

    this.playerSystem = new PlayerSystem(this, this.player, this.map, {
      onUseTool: () => this.useTool(),
      onAskAssistant: () => this.askAssistant(),
      onNextDay: () => this.nextDay(),
      onSelectTool: (tool) => this.selectTool(tool),
    });
    this.playerSystem.createInput();

    this.ui = new UISystem({
      onAskAssistant: () => this.askAssistant(),
      onNextDay: () => this.nextDay(),
      onSave: () => this.saveGame(true),
      onReset: () => this.resetGame(),
      onSelectTool: (tool) => this.selectTool(tool),
    });
    this.ui.showAssistantWaiting();
    this.syncUI();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    (window as DebugWindow).fazendinhaGame = this;
  }

  override update(_time: number, delta: number): void {
    this.playerSystem.update(delta / 1000);
    this.renderOverlay();
  }

  selectTool(tool: ToolId): void {
    this.inventory.setTool(tool);
    this.syncUI();
    this.ui.showMessage(`Ferramenta atual: ${toolLabels[tool]}.`);
  }

  useTool(): void {
    const target = this.getTargetPlotInfo();

    if (!target) {
      this.ui.showMessage("Fique sobre ou de frente para um canteiro para usar a ferramenta.");
      return;
    }

    const beforePlot = CropPlot.clone(target.plot);
    const caseData = this.cbr.createCaseFromPlot(target.plot, this.weather.weather);
    const result = this.crops.applyTool(target.plot, this.inventory.currentTool, this.inventory);

    this.ui.showMessage(result.message);

    if (result.ok) {
      this.pendingCases.push({
        plotId: target.plot.id,
        caseData,
        beforePlot,
        action: result.action,
        actionImmediateResult: result.result,
      });
      this.renderCrops();
      this.saveGame(false);
    }

    this.syncUI();
  }

  askAssistant(): void {
    const target = this.getTargetPlotInfo();

    if (!target) {
      this.ui.showNoPlot();
      this.ui.showMessage("O assistente precisa de um canteiro perto de você.");
      return;
    }

    const currentCase: CBRCurrentCase = this.cbr.createCaseFromPlot(target.plot, this.weather.weather);
    const analysis = this.cbr.analyze(currentCase);
    this.ui.showAnalysis(analysis);
    this.ui.showMessage(`Assistente CBR sugeriu: ${analysis.recommendedAction}.`);
  }

  nextDay(): void {
    const summary = this.dayNight.advanceDay(this.crops, this.weather, this.cbr, this.pendingCases);
    this.pendingCases = [];
    this.renderCrops();
    this.saveGame(false);
    this.syncUI();

    let message = `Dia ${this.dayNight.currentDay}: clima ${this.weather.weather}. ${summary.grown} planta(s) cresceram.`;
    if (summary.problems > 0) {
      message += ` ${summary.problems} canteiro(s) precisam de cuidado.`;
    }
    this.ui.showMessage(message, true);

    if (summary.retained > 0 && summary.lastResult) {
      this.ui.showRetain(this.cbr.getLearnedCases().length, summary.lastResult);
    }
  }

  saveGame(notify: boolean): void {
    SaveSystem.saveGame(this.serialize());

    if (notify) {
      this.ui.showMessage("Jogo salvo no navegador.");
    }
  }

  resetGame(): void {
    if (!window.confirm("Resetar progresso, inventário e casos aprendidos?")) {
      return;
    }

    SaveSystem.clearAll();
    this.scene.restart();
  }

  getTargetPlotInfo(): TargetPlotInfo | null {
    const tile = this.playerSystem.getInteractionTile();

    if (!this.map.isPlantingTile(tile.x, tile.y)) {
      return null;
    }

    const plot = this.crops.getPlotByTile(tile.x, tile.y);
    return plot ? { tile, plot } : null;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const tile = this.map.pixelToTile(pointer.worldX, pointer.worldY);
    const assistant = this.map.assistantTile;

    if (Math.abs(tile.x - assistant.x) <= 1 && Math.abs(tile.y - assistant.y) <= 1) {
      this.askAssistant();
    }
  }

  private renderCrops(): void {
    this.crops.render(this.cropGraphics, this.map.tileSize);
  }

  private renderOverlay(): void {
    this.overlayGraphics.clear();
    const target = this.getTargetPlotInfo();

    if (target) {
      this.map.drawTileHighlight(this.overlayGraphics, target.tile);
    }
  }

  private syncUI(): void {
    this.ui.sync(this.dayNight.currentDay, this.weather.weather, this.inventory.data);
  }

  private serialize(): GameSaveState {
    return {
      version: 2,
      day: this.dayNight.currentDay,
      weather: this.weather.weather,
      inventory: this.inventory.serialize(),
      player: this.player.serialize(),
      crops: this.crops.serialize(),
      pendingCases: this.pendingCases,
    };
  }
}
