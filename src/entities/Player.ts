import Phaser from "phaser";
import type { Direction, PlayerSaveState } from "../types";

export class Player extends Phaser.GameObjects.Container {
  readonly bodyWidth = 18;
  readonly bodyHeight = 24;
  speed = 120;
  facing: Direction = "down";
  moving = false;

  private readonly face: Phaser.GameObjects.Rectangle[] = [];
  private readonly hat: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, saved?: PlayerSaveState) {
    super(scene, saved?.x ?? x, saved?.y ?? y);
    this.facing = saved?.facing ?? "down";

    const shadow = scene.add.rectangle(0, 14, 22, 6, 0x000000, 0.2);
    const shirt = scene.add.rectangle(0, 5, 16, 18, 0x4d6fb3, 1);
    const head = scene.add.rectangle(0, -12, 14, 12, 0xf1b77a, 1);
    this.hat = scene.add.rectangle(0, -21, 20, 7, 0x7a4a24, 1);
    const hatTop = scene.add.rectangle(0, -26, 14, 5, 0x7a4a24, 1);
    const leftFoot = scene.add.rectangle(-5, 17, 6, 6, 0x263027, 1);
    const rightFoot = scene.add.rectangle(5, 17, 6, 6, 0x263027, 1);
    this.face = [scene.add.rectangle(-4, -14, 3, 3, 0x263027, 1), scene.add.rectangle(4, -14, 3, 3, 0x263027, 1)];

    this.add([shadow, shirt, head, this.hat, hatTop, leftFoot, rightFoot, ...this.face]);
    this.setSize(this.bodyWidth, this.bodyHeight);
    scene.add.existing(this);
  }

  setFacing(direction: Direction): void {
    this.facing = direction;
    const showFace = direction !== "up";
    this.face.forEach((part) => part.setVisible(showFace));
    this.hat.setY(direction === "up" ? -23 : -21);
  }

  serialize(): PlayerSaveState {
    return {
      x: this.x,
      y: this.y,
      facing: this.facing,
    };
  }
}
