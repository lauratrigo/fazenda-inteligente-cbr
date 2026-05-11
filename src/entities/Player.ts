import Phaser from "phaser";
import { ToolVisualSystem } from "../systems/ToolVisualSystem";
import type { CharacterCustomization, Direction, PlayerSaveState, ToolId } from "../types";

export class Player extends Phaser.GameObjects.Container {
  readonly bodyWidth = 18;
  readonly bodyHeight = 24;
  speed = 130;
  facing: Direction = "down";
  moving = false;

  private readonly face: Phaser.GameObjects.Rectangle[] = [];
  private readonly shadow: Phaser.GameObjects.Rectangle;
  private readonly shirt: Phaser.GameObjects.Rectangle;
  private readonly leftSleeve: Phaser.GameObjects.Rectangle;
  private readonly rightSleeve: Phaser.GameObjects.Rectangle;
  private readonly lowerOutfit: Phaser.GameObjects.Rectangle;
  private readonly scarf: Phaser.GameObjects.Rectangle;
  private readonly head: Phaser.GameObjects.Rectangle;
  private readonly hair: Phaser.GameObjects.Rectangle;
  private readonly hairAccent: Phaser.GameObjects.Rectangle;
  private readonly hat: Phaser.GameObjects.Rectangle;
  private readonly ponytail: Phaser.GameObjects.Rectangle;
  private readonly outfitDetail: Phaser.GameObjects.Rectangle;
  private readonly mouth: Phaser.GameObjects.Rectangle;
  private readonly leftFoot: Phaser.GameObjects.Rectangle;
  private readonly rightFoot: Phaser.GameObjects.Rectangle;
  private readonly toolGraphics: Phaser.GameObjects.Graphics;
  private currentTool: ToolId = "hoe";
  private swingUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, saved?: PlayerSaveState, customization?: CharacterCustomization) {
    super(scene, saved?.x ?? x, saved?.y ?? y);
    this.facing = saved?.facing ?? "down";

    const skin = customization?.skinColor ? Phaser.Display.Color.HexStringToColor(customization.skinColor).color : 0xf1b77a;
    const hairColor = customization?.hairColor ? Phaser.Display.Color.HexStringToColor(customization.hairColor).color : 0x7a4a24;
    const outfit = customization?.outfitColor ? Phaser.Display.Color.HexStringToColor(customization.outfitColor).color : 0x4d6fb3;

    this.shadow = scene.add.rectangle(0, 15, 24, 7, 0x000000, 0.2);
    this.leftFoot = scene.add.rectangle(-5, 17, 6, 6, 0x263027, 1);
    this.rightFoot = scene.add.rectangle(5, 17, 6, 6, 0x263027, 1);
    const outfitStyle = customization?.outfitStyle ?? "avental";
    const hairStyle = customization?.style ?? "curto";
    const bodyWidth = outfitStyle === "casaco" ? 20 : outfitStyle === "jardineira" || outfitStyle === "fazenda" ? 18 : 16;
    const lowerWidth = outfitStyle === "vestido" ? 22 : outfitStyle === "macacao" ? 18 : 14;
    const lowerColor = outfitStyle === "macacao" || outfitStyle === "jardineira" ? 0x2f6e8d : Phaser.Display.Color.ValueToColor(outfit).darken(18).color;
    this.shirt = scene.add.rectangle(0, 5, bodyWidth, 18, outfit, 1);
    this.leftSleeve = scene.add.rectangle(-11, 5, 5, outfitStyle === "alca" ? 8 : 13, outfit, 1);
    this.rightSleeve = scene.add.rectangle(11, 5, 5, outfitStyle === "alca" ? 8 : 13, outfit, 1);
    this.lowerOutfit = scene.add.rectangle(0, 15, lowerWidth, outfitStyle === "vestido" ? 11 : 8, lowerColor, 1);
    this.scarf = scene.add.rectangle(0, -2, outfitStyle === "alca" ? 11 : 18, 4, outfitStyle === "fazenda" ? 0xfff7dc : 0xf4cc58, 1);
    this.head = scene.add.rectangle(0, -12, 14, 12, skin, 1);
    this.hair = scene.add.rectangle(0, -19, this.hairWidth(hairStyle), this.hairHeight(hairStyle), hairColor, 1);
    this.ponytail = scene.add.rectangle(this.ponytailX(hairStyle), -8, this.ponytailWidth(hairStyle), this.ponytailHeight(hairStyle), hairColor, 1).setVisible(this.hasPonytail(hairStyle));
    this.hairAccent = scene.add.rectangle(-8, -16, 6, 10, hairColor, 1).setVisible(hairStyle === "femininoA" || hairStyle === "cacheado" || hairStyle === "tranca");
    this.hat = scene.add.rectangle(0, -24, this.hatWidth(hairStyle), this.hatHeight(hairStyle), this.hatColor(hairStyle), 1).setVisible(hairStyle === "bone" || hairStyle === "chapeu" || hairStyle === "chapeuPalha");
    this.outfitDetail = scene.add.rectangle(0, 7, outfitStyle === "macacao" ? 10 : outfitStyle === "fazenda" ? 8 : 14, outfitStyle === "jardineira" ? 12 : 3, this.detailColor(outfitStyle), 1);
    this.face = [scene.add.rectangle(-4, -14, 3, 3, 0x263027, 1), scene.add.rectangle(4, -14, 3, 3, 0x263027, 1)];
    this.mouth = scene.add.rectangle(0, -9, 6, 2, 0x7a3f2c, 1);
    this.toolGraphics = scene.add.graphics();

    this.add([
      this.shadow,
      this.leftFoot,
      this.rightFoot,
      this.toolGraphics,
      this.lowerOutfit,
      this.leftSleeve,
      this.rightSleeve,
      this.shirt,
      this.outfitDetail,
      this.scarf,
      this.ponytail,
      this.head,
      this.hair,
      this.hairAccent,
      this.hat,
      ...this.face,
      this.mouth,
    ]);
    this.setSize(this.bodyWidth, this.bodyHeight);
    this.setFacing(this.facing);
    this.setTool(this.currentTool);
    scene.add.existing(this);
  }

  setTool(tool: ToolId): void {
    this.currentTool = tool;
    this.redrawTool(0);
  }

  playToolAction(tool = this.currentTool): void {
    this.currentTool = tool;
    this.swingUntil = this.scene.time.now + 360;
  }

  setFacing(direction: Direction): void {
    this.facing = direction;
    const showFace = direction !== "up";
    this.face.forEach((part) => part.setVisible(showFace));
    this.mouth.setVisible(showFace);

    const eyeOffset = direction === "left" ? -2 : direction === "right" ? 2 : 0;
    this.face[0].setX(-4 + eyeOffset);
    this.face[1].setX(4 + eyeOffset);
    this.hat.setY(direction === "up" ? -25 : -24);
    this.hair.setY(direction === "up" ? -20 : -19);
    this.ponytail.setY(direction === "up" ? -11 : -9);
    this.hairAccent.setY(direction === "up" ? -17 : -16);
    this.redrawTool(0);
  }

  animate(time: number): void {
    const stride = Math.sin(time / 90);
    const bob = this.moving ? Math.abs(stride) * 1.6 : Math.sin(time / 620) * 0.35;
    const idleScale = this.moving ? 1 : 1 + Math.sin(time / 880) * 0.012;
    const swing = Math.max(0, (this.swingUntil - time) / 360);

    this.setScale(1, idleScale);
    this.leftFoot.setY(17 + (this.moving ? stride * 2 : 0));
    this.rightFoot.setY(17 - (this.moving ? stride * 2 : 0));
    this.lowerOutfit.setY(15 - bob * 0.55);
    this.leftSleeve.setY(5 - bob);
    this.rightSleeve.setY(5 - bob);
    this.shirt.setY(5 - bob);
    this.scarf.setY(-2 - bob);
    this.head.setY(-12 - bob);
    this.hair.setY((this.facing === "up" ? -20 : -19) - bob);
    this.ponytail.setY((this.facing === "up" ? -11 : -9) - bob * 0.7);
    this.hairAccent.setY((this.facing === "up" ? -17 : -16) - bob * 0.8);
    this.hat.setY((this.facing === "up" ? -25 : -24) - bob);
    this.face.forEach((part) => part.setY(-14 - bob));
    this.mouth.setY(-9 - bob);
    this.updateBlink(time);
    this.shadow.setScale(this.moving ? 1.05 + Math.abs(stride) * 0.08 : 1, 1);
    this.redrawTool(Math.sin(swing * Math.PI));
  }

  getFishingRodTip(): { x: number; y: number } {
    const swing = Math.max(0, (this.swingUntil - this.scene.time.now) / 360);
    const swingOffset = Math.sin(swing * Math.PI) * 5;

    if (this.facing === "left") {
      return { x: this.x - 32, y: this.y - 13 - swingOffset };
    }

    if (this.facing === "right") {
      return { x: this.x + 32, y: this.y - 13 - swingOffset };
    }

    if (this.facing === "up") {
      return { x: this.x + 15, y: this.y - 15 - swingOffset };
    }

    return { x: this.x + 32, y: this.y - 13 - swingOffset };
  }

  serialize(): PlayerSaveState {
    return {
      x: this.x,
      y: this.y,
      facing: this.facing,
    };
  }

  private redrawTool(swing: number): void {
    ToolVisualSystem.drawHeldTool(this.toolGraphics, this.currentTool, this.facing, swing);
    this.toolGraphics.setDepth(this.facing === "up" ? -1 : 1);
  }

  private updateBlink(time: number): void {
    const blinking = this.facing !== "up" && time % 4300 > 4140;
    this.face.forEach((part) => part.setScale(1, blinking ? 0.25 : 1));
  }

  private hairWidth(style: CharacterCustomization["style"] | undefined): number {
    if (style === "longo" || style === "femininoB" || style === "tranca") return 22;
    if (style === "cacheado") return 21;
    if (style === "femininoA" || style === "rabo" || style === "chapeuPalha") return 19;
    if (style === "neutroA" || style === "medio") return 17;
    return 15;
  }

  private hairHeight(style: CharacterCustomization["style"] | undefined): number {
    if (style === "longo" || style === "femininoB") return 13;
    if (style === "tranca") return 10;
    if (style === "cacheado") return 11;
    if (style === "medio" || style === "femininoA") return 9;
    return 6;
  }

  private hasPonytail(style: CharacterCustomization["style"]): boolean {
    return style === "rabo" || style === "longo" || style === "femininoB" || style === "tranca";
  }

  private ponytailX(style: CharacterCustomization["style"]): number {
    if (style === "tranca") return 10;
    if (style === "femininoB") return -9;
    return 0;
  }

  private ponytailWidth(style: CharacterCustomization["style"]): number {
    return style === "tranca" ? 5 : style === "longo" ? 18 : 6;
  }

  private ponytailHeight(style: CharacterCustomization["style"]): number {
    return style === "tranca" ? 22 : style === "longo" ? 18 : 14;
  }

  private hatWidth(style: CharacterCustomization["style"]): number {
    if (style === "chapeuPalha") return 28;
    if (style === "chapeu") return 24;
    return 20;
  }

  private hatHeight(style: CharacterCustomization["style"]): number {
    return style === "chapeuPalha" ? 6 : 5;
  }

  private hatColor(style: CharacterCustomization["style"]): number {
    if (style === "bone") return 0x2f6e8d;
    if (style === "chapeuPalha") return 0xd8b06b;
    return 0x7a4a24;
  }

  private detailColor(style: CharacterCustomization["outfitStyle"]): number {
    if (style === "camisa" || style === "alca") return 0xfff7dc;
    if (style === "casaco") return 0x263027;
    if (style === "fazenda") return 0x8d5627;
    return 0xf4cc58;
  }
}
