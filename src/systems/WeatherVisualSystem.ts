import type { Weather } from "../types";

const weatherClasses: Weather[] = ["ensolarado", "chuvoso", "seco", "nublado"];

export class WeatherVisualSystem {
  private current?: Weather;

  sync(weather: Weather): void {
    if (this.current === weather) return;
    this.current = weather;
    document.body.dataset.weather = weather;
    weatherClasses.forEach((name) => document.body.classList.toggle(`weather-${name}`, name === weather));
  }

  playNightCycle(): void {
    document.body.classList.add("is-night");
    window.setTimeout(() => document.body.classList.remove("is-night"), 1300);
  }
}
