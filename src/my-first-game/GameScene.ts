import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {

  constructor() {
    super("GameScene");
  }

  create() {

    this.add.text(
      400,
      300,
      "Hello Phaser 4!",
      {
        fontSize: "36px",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

  }

}