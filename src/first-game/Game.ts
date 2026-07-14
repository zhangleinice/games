import * as Phaser from "phaser";
import { FirstGameScene } from "./GameScene";

const config = {
    // 渲染环境：Phaser.CANVAS | Phaser.WEBGL | Phaser.AUTO
    type: Phaser.AUTO,
    // 自己做游戏，最好设置width: 1280,height: 720,以后整个项目都围绕这个坐标系开发。这样既符合现代 16:9 屏幕，又不会让坐标和资源管理变得混乱
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0,y: 300 },
            debug: false
        }
    },
    scene: [FirstGameScene]
};

export const firstGame = () => new Phaser.Game(config);
