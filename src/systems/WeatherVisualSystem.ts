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
    const day = weather === "chuvoso"
      ? ["#607f94", "#b8cbd0", "#5f925d"]
      : weather === "nublado"
        ? ["#9bb3bb", "#e2e6dc", "#71aa66"]
        : weather === "seco"
          ? ["#d8b96d", "#f1d49a", "#96b86d"]
          : ["#7fd1f0", "#fff2b8", "#8ccf70"];
    const dawn = weather === "chuvoso"
      ? ["#516a82", "#b2b9aa", "#557d58"]
      : weather === "seco"
        ? ["#d99961", "#f0c68c", "#8ea45f"]
        : ["#82b9d8", "#ffd99b", "#82b96b"];
    const dusk = weather === "chuvoso"
      ? ["#45566f", "#8f8e86", "#4c6f55"]
      : weather === "seco"
        ? ["#c8784f", "#e7ad72", "#7f8f55"]
        : ["#d77e65", "#ffd191", "#7ca565"];
    const night = weather === "chuvoso"
      ? ["#071323", "#142437", "#1b332e"]
      : weather === "nublado"
        ? ["#0d1a2b", "#1d3142", "#213d34"]
        : weather === "seco"
          ? ["#141830", "#332c3f", "#3d4630"]
          : ["#08162c", "#172b47", "#1d3a32"];

    if (progress < 0.12) {
      return this.paletteBlend(dawn, day, this.smooth(progress / 0.12), "rgba(255, 220, 150, 0.64)");
    }

    if (progress < 0.38) {
      return { top: day[0], mid: day[1], ground: day[2], glow: weather === "seco" ? "rgba(255, 207, 92, 0.8)" : "rgba(255, 229, 132, 0.82)" };
    }

    if (progress < 0.5) {
      return this.paletteBlend(day, dusk, this.smooth((progress - 0.38) / 0.12), "rgba(255, 166, 92, 0.76)");
    }

    if (progress < 0.62) {
      return this.paletteBlend(dusk, night, this.smooth((progress - 0.5) / 0.12), weather === "chuvoso" ? "rgba(145, 179, 222, 0.2)" : "rgba(180, 202, 232, 0.3)");
    }

    if (progress < 0.88) {
      return { top: night[0], mid: night[1], ground: night[2], glow: weather === "seco" ? "rgba(244, 204, 88, 0.22)" : "rgba(238, 248, 255, 0.34)" };
    }

    return this.paletteBlend(night, dawn, this.smooth((progress - 0.88) / 0.12), "rgba(255, 221, 170, 0.5)");
  }

  private paletteBlend(from: string[], to: string[], amount: number, glow: string): { top: string; mid: string; ground: string; glow: string } {
    return {
      top: this.blend(from[0], to[0], amount),
      mid: this.blend(from[1], to[1], amount),
      ground: this.blend(from[2], to[2], amount),
      glow,
    };
  }

  private smooth(value: number): number {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
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
