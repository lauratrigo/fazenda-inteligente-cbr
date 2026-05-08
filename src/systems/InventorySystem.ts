import type { InventoryState, ToolId } from "../types";

export class InventorySystem {
  private state: InventoryState;

  constructor(saved?: InventoryState) {
    this.state = saved ?? {
      seeds: 10,
      harvests: 0,
      coins: 0,
      currentTool: "hoe",
    };
  }

  get data(): InventoryState {
    return this.state;
  }

  get currentTool(): ToolId {
    return this.state.currentTool;
  }

  setTool(tool: ToolId): void {
    this.state.currentTool = tool;
  }

  consumeSeed(): boolean {
    if (this.state.seeds <= 0) {
      return false;
    }

    this.state.seeds -= 1;
    return true;
  }

  addHarvest(): void {
    this.state.harvests += 1;
    this.state.coins += 20;

    if (Math.random() < 0.5) {
      this.state.seeds += 1;
    }
  }

  serialize(): InventoryState {
    return { ...this.state };
  }
}
