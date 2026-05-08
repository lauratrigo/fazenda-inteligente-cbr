import Phaser from "phaser";
import type { Vector2Like } from "../types";

export class Assistant extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, tile: Vector2Like, tileSize: number) {
    super(scene, tile.x * tileSize + tileSize / 2, tile.y * tileSize + tileSize / 2);

    const post = scene.add.rectangle(0, 6, 4, 22, 0x7c4a25, 1);
    const head = scene.add.rectangle(0, -6, 20, 16, 0xf4cc58, 1);
    const leftEye = scene.add.rectangle(-6, -8, 4, 4, 0x4f3520, 1);
    const rightEye = scene.add.rectangle(6, -8, 4, 4, 0x4f3520, 1);
    const mouth = scene.add.rectangle(0, 0, 10, 3, 0x4f3520, 1);
    const lens = scene.add.rectangle(10, -14, 8, 8, 0x5fa8d3, 1);
    const shine = scene.add.rectangle(10, -14, 3, 3, 0xfff7dc, 1);

    this.add([post, head, leftEye, rightEye, mouth, lens, shine]);
    scene.add.existing(this);
  }
}
