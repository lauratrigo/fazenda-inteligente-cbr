import Phaser from "phaser";
import type { Vector2Like } from "../types";

export class Assistant extends Phaser.GameObjects.Container {
  private readonly lens: Phaser.GameObjects.Rectangle;
  private readonly head: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, tile: Vector2Like, tileSize: number) {
    super(scene, tile.x * tileSize + tileSize / 2, tile.y * tileSize + tileSize / 2);

    const shadow = scene.add.rectangle(0, 20, 30, 7, 0x000000, 0.16);
    const post = scene.add.rectangle(0, 8, 4, 26, 0x7c4a25, 1);
    const arms = scene.add.rectangle(0, -2, 32, 4, 0x7c4a25, 1);
    const strawLeft = scene.add.rectangle(-20, -1, 8, 3, 0xf4cc58, 1);
    const strawRight = scene.add.rectangle(20, -1, 8, 3, 0xf4cc58, 1);
    const shirt = scene.add.rectangle(0, 5, 20, 18, 0x4d6fb3, 1);
    const patch = scene.add.rectangle(5, 7, 7, 5, 0xd96b75, 1);
    const hatBrim = scene.add.rectangle(0, -18, 30, 5, 0xc99a5a, 1);
    const hatTop = scene.add.rectangle(0, -23, 18, 8, 0xd8b06b, 1);
    this.head = scene.add.rectangle(0, -8, 22, 17, 0xf4cc58, 1);
    const leftEye = scene.add.rectangle(-6, -8, 4, 4, 0x4f3520, 1);
    const rightEye = scene.add.rectangle(6, -8, 4, 4, 0x4f3520, 1);
    const mouth = scene.add.rectangle(0, 0, 10, 3, 0x4f3520, 1);
    this.lens = scene.add.rectangle(13, -15, 9, 9, 0x5fa8d3, 1);
    const shine = scene.add.rectangle(12, -15, 3, 3, 0xfff7dc, 1);
    const cbrBadge = scene.add.text(-1, 6, "CBR", {
      color: "#fff7dc",
      fontFamily: "Arial",
      fontSize: "6px",
      fontStyle: "900",
    }).setOrigin(0.5);

    this.add([shadow, post, arms, strawLeft, strawRight, shirt, patch, hatBrim, hatTop, this.head, leftEye, rightEye, mouth, this.lens, shine, cbrBadge]);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this,
      y: this.y - 2,
      angle: 1.2,
      duration: 1150,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    scene.tweens.add({
      targets: this.lens,
      alpha: 0.55,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  pulse(): void {
    this.scene.tweens.add({
      targets: this.head,
      scaleX: 1.18,
      scaleY: 1.12,
      duration: 140,
      yoyo: true,
      repeat: 1,
    });
  }
}
