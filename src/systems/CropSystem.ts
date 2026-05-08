import Phaser from "phaser";
import type { ActionResult, CBRAction, CBRResult, CropPlotState, DaySummary, Moisture, PestLevel, ToolId, Vector2Like, Weather } from "../types";
import { CropPlot } from "../entities/CropPlot";
import { InventorySystem } from "./InventorySystem";

const toolActions: Record<ToolId, CBRAction> = {
  hoe: "preparar_solo",
  seed: "plantar",
  water: "regar",
  fertilizer: "adubar",
  pesticide: "tratar_pragas",
  harvest: "colher",
};

export class CropSystem {
  private plots: Record<string, CropPlotState>;

  constructor(plantingTiles: Vector2Like[], savedPlots?: Record<string, CropPlotState>) {
    this.plots = savedPlots ?? this.createPlots(plantingTiles);
  }

  get allPlots(): Record<string, CropPlotState> {
    return this.plots;
  }

  getPlotByTile(x: number, y: number): CropPlotState | null {
    return this.plots[`${x},${y}`] ?? null;
  }

  getPlotById(id: string): CropPlotState | null {
    return this.plots[id] ?? null;
  }

  applyTool(plot: CropPlotState | null, tool: ToolId, inventory: InventorySystem): ActionResult {
    const action = toolActions[tool];

    if (!plot) {
      return { ok: false, action, message: "Você precisa estar perto de um canteiro." };
    }

    if (tool === "hoe") {
      if (plot.stage !== "empty") {
        return { ok: false, action, message: "Esse canteiro já está preparado ou ocupado." };
      }

      plot.stage = "prepared";
      plot.soil = "normal";
      plot.moisture = "media";
      plot.health = "saudavel";
      return { ok: true, action, message: "Solo preparado. Agora plante uma semente." };
    }

    if (tool === "seed") {
      if (plot.stage !== "prepared") {
        return { ok: false, action, message: "Prepare o solo com a enxada antes de plantar." };
      }

      if (!inventory.consumeSeed()) {
        return { ok: false, action, message: "Você está sem sementes." };
      }

      plot.stage = "seed";
      plot.previousStage = "seed";
      plot.growth = "semente";
      plot.age = 0;
      plot.health = "saudavel";
      plot.pests = "nenhuma";
      return { ok: true, action, message: "Semente plantada." };
    }

    if (tool === "water") {
      if (plot.stage === "empty") {
        return { ok: false, action, message: "Não há nada para regar nesse canteiro." };
      }

      if (plot.moisture === "alta" && plot.soil !== "pobre") {
        plot.soil = "encharcado";
      }

      plot.moisture = "alta";
      if (plot.soil === "seco") plot.soil = "normal";
      if (plot.health === "murcha") plot.health = "saudavel";
      plot.daysDry = 0;
      return { ok: true, action, message: "Canteiro regado." };
    }

    if (tool === "fertilizer") {
      if (plot.stage === "empty") {
        return { ok: false, action, message: "Prepare ou plante algo antes de usar adubo." };
      }

      plot.soil = "normal";
      if (plot.health === "amarelada") plot.health = "saudavel";
      this.recoverIfCared(plot);
      return { ok: true, action, message: "Adubo aplicado. O solo ficou mais nutritivo." };
    }

    if (tool === "pesticide") {
      if (!this.isCropStage(plot)) {
        return { ok: false, action, message: "Só faz sentido tratar pragas em uma planta." };
      }

      plot.pests = this.improvePests(plot.pests);
      if (plot.health === "com_manchas" && plot.pests !== "alta") plot.health = "saudavel";
      this.recoverIfCared(plot);
      return { ok: true, action, message: "Pragas controladas." };
    }

    if (tool === "harvest") {
      if (plot.stage !== "ready") {
        return { ok: false, action, message: "Essa planta ainda não está pronta para colher." };
      }

      inventory.addHarvest();
      this.plots[plot.id] = CropPlot.reset(plot);
      return { ok: true, action, message: "Colheita vendida por 20 moedas.", result: "colheu" };
    }

    return { ok: false, action, message: "Ferramenta desconhecida." };
  }

  advanceDay(weather: Weather): DaySummary {
    const summary: DaySummary = { grown: 0, problems: 0, retained: 0 };

    Object.values(this.plots).forEach((plot) => {
      if (plot.stage === "empty") return;

      this.applyWeather(plot, weather);

      if (this.isCropStage(plot) && plot.age > 1 && Math.random() < 0.1) {
        plot.pests = this.worsenPests(plot.pests);
      }

      if (this.isCropStage(plot) && plot.age > 1 && Math.random() < 0.06) {
        plot.soil = "pobre";
      }

      this.maybeCreateProblem(plot);
      this.recoverIfCared(plot);

      if (this.canGrow(plot)) {
        this.grow(plot);
        summary.grown += 1;
      }

      if (plot.stage === "problem") {
        summary.problems += 1;
      }
    });

    return summary;
  }

  evaluateResult(beforePlot: CropPlotState, afterPlot: CropPlotState, immediateResult?: CBRResult): CBRResult {
    if (immediateResult === "colheu") return "colheu";

    const difference = this.plotScore(afterPlot) - this.plotScore(beforePlot);
    if (difference >= 12) return "melhorou";
    if (difference > 0) return "melhorou_parcialmente";
    if (difference === 0) return "sem_efeito";
    return "piorou";
  }

  render(graphics: Phaser.GameObjects.Graphics, tileSize: number): void {
    graphics.clear();
    Object.values(this.plots).forEach((plot) => this.drawPlot(graphics, plot, tileSize));
  }

  serialize(): Record<string, CropPlotState> {
    return JSON.parse(JSON.stringify(this.plots)) as Record<string, CropPlotState>;
  }

  private createPlots(plantingTiles: Vector2Like[]): Record<string, CropPlotState> {
    return Object.fromEntries(plantingTiles.map((tile) => [`${tile.x},${tile.y}`, CropPlot.create(tile)]));
  }

  private applyWeather(plot: CropPlotState, weather: Weather): void {
    if (plot.stage === "empty") return;

    if (weather === "chuvoso") {
      if (plot.moisture === "alta" && plot.soil !== "pobre") plot.soil = "encharcado";
      plot.moisture = "alta";
      plot.daysDry = 0;
    }

    if (weather === "seco") {
      plot.moisture = this.lowerMoisture(this.lowerMoisture(plot.moisture));
      if (plot.moisture === "baixa" && plot.soil !== "pobre") plot.soil = "seco";
    }

    if (weather === "ensolarado") {
      plot.moisture = this.lowerMoisture(plot.moisture);
      if (plot.moisture === "baixa" && Math.random() < 0.35 && plot.soil !== "pobre") plot.soil = "seco";
    }
  }

  private maybeCreateProblem(plot: CropPlotState): void {
    if (!this.isCropStage(plot) || plot.stage === "ready") return;

    if (plot.moisture === "baixa") {
      plot.daysDry += 1;
      plot.health = "murcha";
    }

    if (plot.soil === "pobre") plot.health = "amarelada";
    if (plot.pests === "media" || plot.pests === "alta") plot.health = "com_manchas";

    if (plot.health !== "saudavel" || plot.pests === "alta") {
      if (plot.stage !== "problem") plot.previousStage = plot.stage;
      plot.stage = "problem";
    }
  }

  private recoverIfCared(plot: CropPlotState): void {
    if (plot.stage !== "problem") return;

    if (plot.moisture !== "baixa" && plot.soil !== "pobre" && plot.soil !== "seco" && plot.pests !== "alta") {
      plot.health = "saudavel";
      plot.stage = plot.previousStage;
    }
  }

  private canGrow(plot: CropPlotState): boolean {
    return this.isCropStage(plot) && plot.stage !== "ready" && plot.stage !== "problem" && plot.moisture !== "baixa" && plot.soil !== "seco" && plot.soil !== "encharcado" && plot.soil !== "pobre" && plot.pests !== "alta" && plot.health === "saudavel";
  }

  private grow(plot: CropPlotState): void {
    if (plot.stage === "seed") {
      plot.stage = "sprout";
      plot.growth = "broto";
    } else if (plot.stage === "sprout") {
      plot.stage = "middle";
      plot.growth = "medio";
    } else if (plot.stage === "middle") {
      plot.stage = "adult";
      plot.growth = "adulto";
    } else if (plot.stage === "adult") {
      plot.stage = "ready";
      plot.growth = "adulto";
    }

    plot.age += 1;
  }

  private isCropStage(plot: CropPlotState): boolean {
    return plot.stage !== "empty" && plot.stage !== "prepared";
  }

  private improvePests(current: PestLevel): PestLevel {
    if (current === "alta") return "media";
    if (current === "media") return "baixa";
    return "nenhuma";
  }

  private worsenPests(current: PestLevel): PestLevel {
    if (current === "nenhuma") return "baixa";
    if (current === "baixa") return "media";
    return "alta";
  }

  private lowerMoisture(current: Moisture): Moisture {
    if (current === "alta") return "media";
    if (current === "media") return "baixa";
    return "baixa";
  }

  private plotScore(plot: CropPlotState): number {
    const stageScore = { empty: 0, prepared: 8, seed: 16, sprout: 28, middle: 42, adult: 58, problem: 22, ready: 75 }[plot.stage];
    const moistureScore = { baixa: -10, media: 8, alta: 10 }[plot.moisture];
    const soilScore = { seco: -12, normal: 10, encharcado: -10, pobre: -8 }[plot.soil];
    const pestScore = { nenhuma: 10, baixa: 4, media: -6, alta: -16 }[plot.pests];
    const healthScore = { saudavel: 16, amarelada: -5, murcha: -8, com_manchas: -10 }[plot.health];
    return stageScore + moistureScore + soilScore + pestScore + healthScore;
  }

  private drawPlot(graphics: Phaser.GameObjects.Graphics, plot: CropPlotState, tileSize: number): void {
    const px = plot.x * tileSize;
    const py = plot.y * tileSize;
    const cx = px + tileSize / 2;
    const cy = py + tileSize / 2;

    if (plot.stage === "empty") return;

    if (plot.stage === "prepared") {
      graphics.fillStyle(0xfff7dc, 0.25);
      graphics.fillRect(px + 7, py + 7, tileSize - 14, 3);
      graphics.fillRect(px + 7, py + 17, tileSize - 14, 3);
      return;
    }

    if (plot.stage === "seed") {
      graphics.fillStyle(0xf4cc58, 1);
      graphics.fillRect(cx - 3, cy - 2, 6, 5);
      return;
    }

    if (plot.stage === "sprout") {
      graphics.fillStyle(0x2f7c3b, 1);
      graphics.fillRect(cx - 2, cy - 8, 4, 14);
      graphics.fillRect(cx - 9, cy - 5, 8, 5);
      graphics.fillRect(cx + 1, cy - 4, 8, 5);
      return;
    }

    if (plot.stage === "middle") {
      graphics.fillStyle(0x2f7c3b, 1);
      graphics.fillRect(cx - 3, cy - 14, 6, 22);
      graphics.fillStyle(0x55a64c, 1);
      graphics.fillRect(cx - 13, cy - 10, 12, 7);
      graphics.fillRect(cx + 1, cy - 7, 12, 7);
      graphics.fillRect(cx - 9, cy + 1, 18, 6);
      return;
    }

    if (plot.stage === "adult") {
      graphics.fillStyle(0x2f7c3b, 1);
      graphics.fillRect(cx - 4, cy - 18, 8, 28);
      graphics.fillStyle(0x61b85a, 1);
      graphics.fillRect(cx - 15, cy - 13, 13, 8);
      graphics.fillRect(cx + 2, cy - 13, 13, 8);
      graphics.fillStyle(0xf4cc58, 1);
      graphics.fillRect(cx - 5, cy - 18, 10, 11);
      return;
    }

    if (plot.stage === "problem") {
      graphics.fillStyle(plot.health === "amarelada" ? 0xd8c755 : 0x7ca753, 1);
      graphics.fillRect(cx - 3, cy - 11, 6, 20);
      graphics.fillRect(cx - 14, cy - 5, 12, 6);
      graphics.fillRect(cx + 2, cy - 3, 12, 6);
      graphics.fillStyle(0x9d4030, 1);
      graphics.fillRect(cx - 9, cy - 10, 4, 4);
      graphics.fillRect(cx + 7, cy - 2, 4, 4);
      return;
    }

    if (plot.stage === "ready") {
      graphics.fillStyle(0x2f7c3b, 1);
      graphics.fillRect(cx - 4, cy - 18, 8, 28);
      graphics.fillStyle(0xffd45a, 1);
      graphics.fillRect(cx - 11, cy - 16, 8, 18);
      graphics.fillRect(cx + 3, cy - 16, 8, 18);
      graphics.fillRect(cx - 4, cy - 21, 8, 18);
    }
  }
}
