import { fishTypeOrder, fishTypes } from "../data/fishTypes";
import type { FishingOutcome, FishingPhase, Vector2Like, Weather } from "../types";
import { InventorySystem } from "./InventorySystem";

interface FishingState {
  phase: FishingPhase;
  bobberTile?: Vector2Like;
  startedAt: number;
  hookedAt: number;
  expiresAt: number;
  cooldownUntil: number;
  fishId?: FishingOutcome["fishId"];
}

export class FishingSystem {
  private state: FishingState = {
    phase: "idle",
    startedAt: 0,
    hookedAt: 0,
    expiresAt: 0,
    cooldownUntil: 0,
  };

  constructor(private readonly inventory: InventorySystem) {}

  get phase(): FishingPhase {
    return this.state.phase;
  }

  get bobberTile(): Vector2Like | undefined {
    return this.state.bobberTile;
  }

  use(weather: Weather, time: number, bobberTile: Vector2Like): FishingOutcome {
    this.update(time);

    if (time < this.state.cooldownUntil) {
      return { ok: false, phase: "cooldown", message: "Aguarde a linha acalmar antes de lançar de novo.", bobberTile: this.state.bobberTile };
    }

    if (this.state.phase === "idle" || this.state.phase === "failed" || this.state.phase === "captured" || this.state.phase === "cooldown") {
      this.startCast(weather, time, bobberTile);
      return { ok: false, phase: "casting", message: "Linha lançada. Espere a boia tremer antes de puxar.", bobberTile };
    }

    if (this.state.phase === "casting" || this.state.phase === "waiting" || this.state.phase === "approaching") {
      return { ok: false, phase: this.state.phase, message: "Espere o peixe fisgar. Puxe só quando a boia tremer.", bobberTile: this.state.bobberTile };
    }

    if (this.state.phase === "hooked") {
      const reaction = time - this.state.hookedAt;
      if (reaction <= 1550) {
        const fishId = this.state.fishId ?? this.pickFish(weather);
        const fish = fishTypes[fishId];
        this.inventory.addFish(fishId);
        this.state = {
          phase: "captured",
          startedAt: time,
          hookedAt: 0,
          expiresAt: 0,
          cooldownUntil: time + 1800,
          bobberTile: this.state.bobberTile,
          fishId,
        };
        return {
          ok: true,
          phase: "captured",
          message: `${fish.name} capturado! Venda na loja para ganhar moedas.`,
          fishId,
          value: fish.basePrice,
          rarity: fish.rarity,
          bobberTile: this.state.bobberTile,
        };
      }

      this.state = {
        phase: "failed",
        startedAt: time,
        hookedAt: 0,
        expiresAt: 0,
        cooldownUntil: time + 1600,
        bobberTile: this.state.bobberTile,
      };
      return { ok: false, phase: "failed", message: "Você puxou tarde demais. O peixe fugiu.", bobberTile: this.state.bobberTile };
    }

    return { ok: false, phase: this.state.phase, message: "Espere um instante antes de pescar de novo.", bobberTile: this.state.bobberTile };
  }

  update(time: number): FishingPhase {
    if (this.state.phase === "idle") return "idle";

    if (this.state.phase === "casting" && time - this.state.startedAt > 650) {
      this.state.phase = "waiting";
    }

    if (this.state.phase === "waiting" && time > this.state.hookedAt - 850) {
      this.state.phase = "approaching";
    }

    if (this.state.phase === "approaching" && time >= this.state.hookedAt) {
      this.state.phase = "hooked";
    }

    if (this.state.phase === "hooked" && time > this.state.expiresAt) {
      this.state = {
        phase: "failed",
        startedAt: time,
        hookedAt: 0,
        expiresAt: 0,
        cooldownUntil: time + 1600,
        bobberTile: this.state.bobberTile,
      };
    }

    if ((this.state.phase === "captured" || this.state.phase === "failed" || this.state.phase === "cooldown") && time >= this.state.cooldownUntil) {
      this.state = {
        phase: "idle",
        startedAt: time,
        hookedAt: 0,
        expiresAt: 0,
        cooldownUntil: 0,
      };
    }

    return this.state.phase;
  }

  private startCast(weather: Weather, time: number, bobberTile: Vector2Like): void {
    const waitBase = weather === "chuvoso" ? 1450 : weather === "seco" ? 2600 : 1900;
    const wait = waitBase + Math.floor(Math.random() * 1400);
    this.state = {
      phase: "casting",
      bobberTile,
      startedAt: time,
      hookedAt: time + wait,
      expiresAt: time + wait + 1550,
      cooldownUntil: 0,
      fishId: this.pickFish(weather),
    };
  }

  private pickFish(weather: Weather) {
    const weighted = fishTypeOrder.flatMap((id) => {
      const fish = fishTypes[id];
      const weatherBonus = fish.preferredWeather.includes(weather) ? 3 : 0;
      const rarityWeight = fish.rarity === "raro" ? 1 : fish.rarity === "incomum" ? 3 : 7;
      return Array.from({ length: rarityWeight + weatherBonus }, () => id);
    });

    return weighted[Math.floor(Math.random() * weighted.length)];
  }
}
