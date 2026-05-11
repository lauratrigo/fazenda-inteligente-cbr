import type { CBRSystem } from "./CBRSystem";
import type { CropSystem } from "./CropSystem";
import type { WeatherSystem } from "./WeatherSystem";
import type { DaySummary, PendingLearningCase } from "../types";

export class DayNightSystem {
  constructor(private day: number) {}

  get currentDay(): number {
    return this.day;
  }

  set currentDay(value: number) {
    this.day = value;
  }

  advanceDay(crops: CropSystem, weather: WeatherSystem, cbr: CBRSystem, pendingCases: PendingLearningCase[]): DaySummary {
    this.day += 1;
    weather.advance();
    const summary = crops.advanceDay(weather.weather, this.day);
    let lastResult = summary.lastResult;

    pendingCases.forEach((pending) => {
      const afterPlot = crops.getPlotById(pending.plotId) ?? pending.beforePlot;
      const result = crops.evaluateResult(pending.beforePlot, afterPlot, pending.actionImmediateResult);
      cbr.retain(pending.caseData, pending.action, result);
      summary.retained += 1;
      lastResult = result;
    });

    summary.lastResult = lastResult;
    return summary;
  }
}
