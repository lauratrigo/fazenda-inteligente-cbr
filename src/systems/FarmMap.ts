import Phaser from "phaser";
import { mapHeight, mapWidth, tileSize } from "../data/gameData";
import type { TileType, Vector2Like } from "../types";

const blockedTiles = new Set<TileType>(["fence", "house", "tree"]);

export class FarmMap {
  readonly width = mapWidth;
  readonly height = mapHeight;
  readonly tileSize = tileSize;
  readonly assistantTile = { x: 18, y: 9 };
  readonly plantingTiles: Vector2Like[] = [];

  private readonly tiles: TileType[][] = [];

  constructor() {
    const trees = new Set(["18,2", "20,3", "3,12", "5,14", "19,14", "21,13", "12,2"]);

    for (let y = 0; y < this.height; y += 1) {
      const row: TileType[] = [];

      for (let x = 0; x < this.width; x += 1) {
        let type: TileType = "grass";

        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          type = "fence";
        }

        if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
          type = "house";
        }

        if ((x >= 6 && x <= 8 && y === 5) || (x === 8 && y >= 5 && y <= 8)) {
          type = "path";
        }

        if (x >= 9 && x <= 16 && y >= 8 && y <= 13) {
          type = "plot";
          this.plantingTiles.push({ x, y });
        }

        if (trees.has(`${x},${y}`)) {
          type = "tree";
        }

        row.push(type);
      }

      this.tiles.push(row);
    }
  }

  key(x: number, y: number): string {
    return `${x},${y}`;
  }

  getTile(x: number, y: number): TileType {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return "fence";
    }

    return this.tiles[y][x];
  }

  isBlockedTile(x: number, y: number): boolean {
    return blockedTiles.has(this.getTile(x, y));
  }

  isPlantingTile(x: number, y: number): boolean {
    return this.getTile(x, y) === "plot";
  }

  pixelToTile(x: number, y: number): Vector2Like {
    return {
      x: Math.floor(x / this.tileSize),
      y: Math.floor(y / this.tileSize),
    };
  }

  isBlockedRect(left: number, top: number, width: number, height: number): boolean {
    const points = [
      this.pixelToTile(left, top),
      this.pixelToTile(left + width, top),
      this.pixelToTile(left, top + height),
      this.pixelToTile(left + width, top + height),
    ];

    return points.some((point) => this.isBlockedTile(point.x, point.y));
  }

  render(graphics: Phaser.GameObjects.Graphics): void {
    graphics.clear();

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.drawTile(graphics, x, y, this.getTile(x, y));
      }
    }

    this.drawHouse(graphics);
    this.drawTrees(graphics);
    this.drawAssistant(graphics);
  }

  drawTileHighlight(graphics: Phaser.GameObjects.Graphics, tile: Vector2Like, color = 0xfff7dc): void {
    graphics.lineStyle(3, color, 1);
    graphics.strokeRect(tile.x * this.tileSize + 2, tile.y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
  }

  private drawTile(graphics: Phaser.GameObjects.Graphics, x: number, y: number, type: TileType): void {
    const px = x * this.tileSize;
    const py = y * this.tileSize;

    if (type === "grass" || type === "house" || type === "tree") {
      graphics.fillStyle((x + y) % 2 === 0 ? 0x70b85d : 0x69ae57, 1);
      graphics.fillRect(px, py, this.tileSize, this.tileSize);
      this.drawGrassDetails(graphics, x, y);
    }

    if (type === "path") {
      graphics.fillStyle(0xc99a5a, 1);
      graphics.fillRect(px, py, this.tileSize, this.tileSize);
      graphics.fillStyle(0x704525, 0.18);
      graphics.fillRect(px + 3, py + 23, 20, 3);
      graphics.fillRect(px + 15, py + 8, 12, 3);
    }

    if (type === "plot") {
      graphics.fillStyle(0x8e5b31, 1);
      graphics.fillRect(px, py, this.tileSize, this.tileSize);
      graphics.fillStyle(0x754521, 1);
      graphics.fillRect(px + 3, py + 5, this.tileSize - 6, 3);
      graphics.fillRect(px + 3, py + 15, this.tileSize - 6, 3);
      graphics.fillRect(px + 3, py + 25, this.tileSize - 6, 3);
    }

    if (type === "fence") {
      graphics.fillStyle(0x70b85d, 1);
      graphics.fillRect(px, py, this.tileSize, this.tileSize);
      graphics.fillStyle(0x8d5627, 1);
      graphics.fillRect(px + 4, py + 8, this.tileSize - 8, 6);
      graphics.fillRect(px + 4, py + 20, this.tileSize - 8, 6);
      graphics.fillStyle(0x6f3f1e, 1);
      graphics.fillRect(px + 8, py + 4, 6, 25);
      graphics.fillRect(px + 22, py + 4, 6, 25);
    }
  }

  private drawGrassDetails(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    const seed = (x * 37 + y * 19) % 17;
    graphics.fillStyle(seed % 2 === 0 ? 0x347c30 : 0xffffff, seed % 2 === 0 ? 0.25 : 0.08);
    graphics.fillRect(x * this.tileSize + 7 + seed, y * this.tileSize + 8, 3, 9);
    graphics.fillRect(x * this.tileSize + 19, y * this.tileSize + 17 + (seed % 4), 3, 7);
  }

  private drawHouse(graphics: Phaser.GameObjects.Graphics): void {
    const x = 2 * this.tileSize;
    const y = 2 * this.tileSize;
    graphics.fillStyle(0x8b4a2b, 1);
    graphics.fillRect(x + 4, y + 24, 4 * this.tileSize - 8, 3 * this.tileSize + 4);
    graphics.fillStyle(0xd45c3d, 1);
    graphics.fillTriangle(x - 5, y + 30, x + 2 * this.tileSize, y - 4, x + 4 * this.tileSize + 5, y + 30);
    graphics.fillStyle(0xffe7a3, 1);
    graphics.fillRect(x + 18, y + 50, 24, 20);
    graphics.fillRect(x + 80, y + 50, 24, 20);
    graphics.fillStyle(0x52311d, 1);
    graphics.fillRect(x + 52, y + 75, 24, 45);
  }

  private drawTrees(graphics: Phaser.GameObjects.Graphics): void {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.getTile(x, y) !== "tree") continue;
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        graphics.fillStyle(0x6f3f1e, 1);
        graphics.fillRect(px + 13, py + 17, 8, 15);
        graphics.fillStyle(0x2f7c3b, 1);
        graphics.fillRect(px + 6, py + 5, 20, 18);
        graphics.fillStyle(0x3f9a49, 1);
        graphics.fillRect(px + 2, py + 11, 28, 14);
        graphics.fillStyle(0x23632f, 1);
        graphics.fillRect(px + 9, py + 2, 15, 8);
      }
    }
  }

  private drawAssistant(graphics: Phaser.GameObjects.Graphics): void {
    const px = this.assistantTile.x * this.tileSize;
    const py = this.assistantTile.y * this.tileSize;
    graphics.fillStyle(0x000000, 0.16);
    graphics.fillRect(px + 6, py + 25, 22, 5);
    graphics.fillStyle(0x7c4a25, 1);
    graphics.fillRect(px + 15, py + 10, 4, 20);
    graphics.fillStyle(0xf4cc58, 1);
    graphics.fillRect(px + 7, py + 6, 20, 16);
    graphics.fillStyle(0x4f3520, 1);
    graphics.fillRect(px + 9, py + 10, 4, 4);
    graphics.fillRect(px + 21, py + 10, 4, 4);
    graphics.fillRect(px + 12, py + 18, 10, 3);
    graphics.fillStyle(0x5fa8d3, 1);
    graphics.fillRect(px + 22, py + 2, 8, 8);
    graphics.fillStyle(0xfff7dc, 1);
    graphics.fillRect(px + 24, py + 4, 4, 4);
  }
}
