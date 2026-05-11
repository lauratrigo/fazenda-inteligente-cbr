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

  syncDayProgress(progress: number): void {
    const normalized = ((progress % 1) + 1) % 1;
    const isNight = normalized >= 0.5;
    const arc = isNight ? (normalized - 0.5) * 2 : normalized * 2;
    const x = -6 + arc * 112;
    const y = 166 - Math.sin(arc * Math.PI) * 108;
    const sunOpacity = isNight ? 0 : this.weatherOpacity("sun");
    const moonOpacity = isNight ? this.weatherOpacity("moon") : 0;
    const palette = this.paletteFor(normalized, this.current ?? "ensolarado");

    document.body.style.setProperty("--sun-x", `${x.toFixed(2)}%`);
    document.body.style.setProperty("--sun-y", `${y.toFixed(2)}px`);
    document.body.style.setProperty("--moon-x", `${x.toFixed(2)}%`);
    document.body.style.setProperty("--moon-y", `${y.toFixed(2)}px`);
    document.body.style.setProperty("--sun-opacity", sunOpacity.toFixed(2));
    document.body.style.setProperty("--moon-opacity", moonOpacity.toFixed(2));
    document.body.style.setProperty("--sky-top", palette.top);
    document.body.style.setProperty("--sky-mid", palette.mid);
    document.body.style.setProperty("--sky-ground", palette.ground);
    document.body.style.setProperty("--sky-glow", palette.glow);
    document.body.style.setProperty("--sky-glow-x", `${x.toFixed(2)}%`);
    document.body.style.setProperty("--sky-glow-y", `${y.toFixed(2)}px`);
    document.body.classList.toggle("is-auto-night", isNight);
  }

  playNightCycle(): void {
    document.body.classList.add("is-night");
    window.setTimeout(() => document.body.classList.remove("is-night"), 1300);
  }

  resetToMorning(weather: Weather): void {
    document.body.classList.remove("is-night", "is-auto-night");
    this.current = undefined;
    this.sync(weather);
    this.syncDayProgress(0.08);
  }

  private weatherOpacity(kind: "sun" | "moon"): number {
    if (this.current === "chuvoso") return kind === "sun" ? 0.14 : 0.28;
    if (this.current === "nublado") return kind === "sun" ? 0.24 : 0.44;
    if (this.current === "seco") return kind === "sun" ? 1 : 0.72;
    return kind === "sun" ? 0.94 : 0.88;
  }

  private paletteFor(progress: number, weather: Weather): { top: string; mid: string; ground: string; glow: string } {
    const isNight = progress >= 0.5;
    const arc = isNight ? (progress - 0.5) * 2 : progress * 2;
    const height = Math.sin(arc * Math.PI);
    const horizon = 1 - height;

    if (isNight) {
      const nightWeather = weather === "chuvoso"
        ? ["#071323", "#142437", "#1b332e", "rgba(145, 179, 222, 0.24)"]
        : weather === "nublado"
          ? ["#0d1a2b", "#1d3142", "#213d34", "rgba(196, 215, 232, 0.3)"]
          : weather === "seco"
            ? ["#141830", "#332c3f", "#3d4630", "rgba(244, 204, 88, 0.24)"]
            : ["#08162c", "#172b47", "#1d3a32", "rgba(238, 248, 255, 0.38)"];

      return {
        top: this.blend(nightWeather[0], "#1f3554", height * 0.28),
        mid: this.blend(nightWeather[1], "#2c435a", height * 0.2),
        ground: this.blend(nightWeather[2], "#335444", height * 0.16),
        glow: nightWeather[3],
      };
    }

    const weatherTint = weather === "chuvoso"
      ? ["#607f94", "#b8cbd0", "#5f925d"]
      : weather === "nublado"
        ? ["#9bb3bb", "#e2e6dc", "#71aa66"]
        : weather === "seco"
          ? ["#d8b96d", "#f1d49a", "#96b86d"]
          : ["#7fd1f0", "#fff2b8", "#8ccf70"];

    const duskTop = weather === "seco" ? "#d69b58" : "#efad6a";
    const duskMid = weather === "seco" ? "#edc184" : "#ffd191";
    const top = this.blend(weatherTint[0], duskTop, horizon * 0.58);
    const mid = this.blend(weatherTint[1], duskMid, horizon * 0.5);
    const ground = this.blend(weatherTint[2], "#7ca565", horizon * 0.18);

    return {
      top,
      mid,
      ground,
      glow: weather === "seco" ? "rgba(255, 207, 92, 0.8)" : "rgba(255, 229, 132, 0.82)",
    };
  }

  private blend(from: string, to: string, amount: number): string {
    const clamp = Math.max(0, Math.min(1, amount));
    const a = this.hexToRgb(from);
    const b = this.hexToRgb(to);
    const channel = (start: number, end: number) => Math.round(start + (end - start) * clamp);
    return `rgb(${channel(a[0], b[0])}, ${channel(a[1], b[1])}, ${channel(a[2], b[2])})`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace("#", "");
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  }
}
