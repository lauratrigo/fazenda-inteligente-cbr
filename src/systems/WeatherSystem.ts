import type { Weather } from "../types";

export class WeatherSystem {
  private currentWeather: Weather;

  constructor(initialWeather: Weather = "ensolarado") {
    this.currentWeather = initialWeather;
  }

  get weather(): Weather {
    return this.currentWeather;
  }

  set weather(value: Weather) {
    this.currentWeather = value;
  }

  rollNextWeather(): Weather {
    const roll = Math.random();

    if (roll < 0.38) return "ensolarado";
    if (roll < 0.56) return "chuvoso";
    if (roll < 0.8) return "nublado";
    return "seco";
  }

  advance(): Weather {
    this.currentWeather = this.rollNextWeather();
    return this.currentWeather;
  }
}
