import Phaser from "phaser";
import type { Vector2Like, Weather } from "../types";

export class WaterSystem {
  static readonly center = { x: 32, y: 23 };
  static readonly radius = { x: 7.5, y: 4.4 };

  static isLakeTile(x: number, y: number): boolean {
    const dx = (x - this.center.x) / this.radius.x;
    const dy = (y - this.center.y) / this.radius.y;
    return dx * dx + dy * dy <= 1;
  }

  static isNearWater(tile: Vector2Like): boolean {
    for (let y = tile.y - 1; y <= tile.y + 1; y += 1) {
      for (let x = tile.x - 1; x <= tile.x + 1; x += 1) {
        if (this.isLakeTile(x, y)) return true;
      }
    }
    return false;
  }

  static nearestWaterTile(tile: Vector2Like): Vector2Like | null {
    let best: Vector2Like | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let y = tile.y - 3; y <= tile.y + 3; y += 1) {
      for (let x = tile.x - 3; x <= tile.x + 3; x += 1) {
        if (!this.isLakeTile(x, y)) continue;
        const distance = Math.abs(tile.x - x) + Math.abs(tile.y - y);
        if (distance < bestDistance) {
          best = { x, y };
          bestDistance = distance;
        }
      }
    }

    return best;
  }

  static drawWaterTile(graphics: Phaser.GameObjects.Graphics, x: number, y: number, tileSize: number, time: number, weather: Weather): void {
    const px = x * tileSize;
    const py = y * tileSize;
    const pulse = Math.sin(time / 520 + x * 0.7 + y * 0.3) * 0.08;
    const wave = Math.sin(time / 360 + x * 0.9) * 3;
    const color = weather === "chuvoso" ? 0x4a8db2 : weather === "seco" ? 0x4f9fc2 : 0x5fa8d3;

    graphics.fillStyle(0x2f6e8d, 1);
    graphics.fillRect(px, py, tileSize, tileSize);
    graphics.fillStyle(color, 0.92 + pulse);
    graphics.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
    graphics.fillStyle(0xb8efff, 0.22 + pulse);
    graphics.fillRect(px + 4 + wave, py + 8 + ((x + y) % 3), 16, 2);
    graphics.fillRect(px + 12 - wave * 0.6, py + 21, 13, 2);

    if ((x * 17 + y * 9 + Math.floor(time / 520)) % 19 === 0) {
      graphics.fillStyle(0xeef8ff, 0.45);
      graphics.fillCircle(px + 8 + ((x + y) % 15), py + 8 + ((x * y) % 17), 2);
      graphics.fillCircle(px + 15, py + 19, 1.5);
    }

    if ((x * 5 + y * 11 + Math.floor(time / 900)) % 37 === 0) {
      graphics.fillStyle(0x2f6e8d, 0.24);
      graphics.fillEllipse(px + 14 + wave, py + 17, 22, 6);
    }

    if ((x * 13 + y * 7) % 11 === 0) {
      graphics.fillStyle(0x8fd460, 0.8);
      graphics.fillEllipse(px + 12 + Math.sin(time / 700 + x) * 1.5, py + 12, 14, 7);
      graphics.fillStyle(0xfff7dc, 0.8);
      graphics.fillRect(px + 12, py + 9, 2, 2);
    }
  }
}
