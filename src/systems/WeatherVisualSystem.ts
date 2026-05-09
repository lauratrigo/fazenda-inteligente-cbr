import type { Weather } from "../types";

const weatherClasses: Weather[] = ["ensolarado", "chuvoso", "seco", "nublado"];

export class WeatherVisualSystem {
  private current?: Weather;
  private lastProgressBucket = -1;

  sync(weather: Weather): void {
    if (this.current === weather) return;
    this.current = weather;
    document.body.dataset.weather = weather;
    weatherClasses.forEach((name) => document.body.classList.toggle(`weather-${name}`, name === weather));
  }

  syncDayProgress(progress: number): void {
    const bucket = Math.floor(progress * 100);
    if (bucket === this.lastProgressBucket) return;
    this.lastProgressBucket = bucket;

    const sunX = 12 + Math.sin(progress * Math.PI) * 76;
    const sunY = 70 - Math.sin(progress * Math.PI) * 58;
    const moonX = 88 - Math.sin(progress * Math.PI) * 68;
    const moonY = progress > 0.5 ? 72 - Math.sin((progress - 0.5) * Math.PI) * 54 : 70;

    document.body.style.setProperty("--sun-x", `${Math.round(sunX)}%`);
    document.body.style.setProperty("--sun-y", `${Math.round(sunY)}px`);
    document.body.style.setProperty("--moon-x", `${Math.round(moonX)}%`);
    document.body.style.setProperty("--moon-y", `${Math.round(moonY)}px`);
    document.body.classList.toggle("is-auto-night", progress > 0.74 || progress < 0.08);
  }

  playNightCycle(): void {
    document.body.classList.add("is-night");
    window.setTimeout(() => document.body.classList.remove("is-night"), 1300);
  }
}
