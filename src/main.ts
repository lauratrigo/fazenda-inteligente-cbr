import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { FarmScene } from "./scenes/FarmScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: "game-container",
  width: 768,
  height: 576,
  backgroundColor: "#70b85d",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, FarmScene],
};

new Phaser.Game(config);

