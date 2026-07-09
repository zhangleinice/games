import Phaser from "phaser";
import GameScene from "./GameScene";

export function createFirstGame() {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game",
    scene: [GameScene],
  });
}