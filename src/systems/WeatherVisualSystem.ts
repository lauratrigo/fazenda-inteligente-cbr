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

    const sunArc = Math.min(1, progress / 0.72);
    const moonArc = progress < 0.62 ? 0 : Math.min(1, (progress - 0.62) / 0.38);
    const sunX = 10 + sunArc * 78;
    const sunY = 136 - Math.sin(sunArc * Math.PI) * 72;
    const moonX = 88 - moonArc * 72;
    const moonY = 132 - Math.sin(moonArc * Math.PI) * 64;

    document.body.style.setProperty("--sun-x", `${Math.round(sunX)}%`);
    document.body.style.setProperty("--sun-y", `${Math.round(sunY)}px`);
    document.body.style.setProperty("--moon-x", `${Math.round(moonX)}%`);
    document.body.style.setProperty("--moon-y", `${Math.round(moonY)}px`);
    document.body.classList.toggle("is-auto-night", progress >= 0.72);
  }

  playNightCycle(): void {
    document.body.classList.add("is-night");
    window.setTimeout(() => document.body.classList.remove("is-night"), 1300);
  }
}
