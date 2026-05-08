import type { CropPlotState, CropVisualStage, Growth, Health, Moisture, PestLevel, Soil, Vector2Like } from "../types";

export class CropPlot {
  static create(tile: Vector2Like): CropPlotState {
    return {
      id: `${tile.x},${tile.y}`,
      x: tile.x,
      y: tile.y,
      stage: "empty",
      previousStage: "seed",
      age: 0,
      soil: "normal",
      moisture: "baixa",
      pests: "nenhuma",
      growth: "semente",
      health: "saudavel",
      daysDry: 0,
    };
  }

  static reset(plot: CropPlotState): CropPlotState {
    return CropPlot.create({ x: plot.x, y: plot.y });
  }

  static clone(plot: CropPlotState): CropPlotState {
    return JSON.parse(JSON.stringify(plot)) as CropPlotState;
  }
}

export const cropStageOrder: CropVisualStage[] = ["seed", "sprout", "middle", "adult", "ready"];

export const defaultCropValues: {
  soil: Soil;
  moisture: Moisture;
  pests: PestLevel;
  growth: Growth;
  health: Health;
} = {
  soil: "normal",
  moisture: "baixa",
  pests: "nenhuma",
  growth: "semente",
  health: "saudavel",
};
