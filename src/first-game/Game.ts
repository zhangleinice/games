import * as Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";

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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let platforms: Phaser.Physics.Arcade.StaticGroup;
let player: Phaser.Physics.Arcade.Sprite;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;

function preload() {
    this.load.image('sky', sky);
    this.load.image('ground', ground);
    this.load.image('star', star);
    this.load.image('bomb', bomb);
    // 加载精灵图（SpriteSheet），每一帧的宽度是 32，高度是 48
    this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });
}

function create() {

    // 创建背景，把图片的中心放到 (400, 300) 这个坐标。
    this.add.image(400, 300, "sky");

    // 创建"平台管理器"
    platforms = this.physics.add.staticGroup();

    // 创建地面
    // 在 (400,568) 创建一块地面，把它放大 2 倍，然后重新计算碰撞区域，使碰撞区域和放大后的图片一致。
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // 创建玩家（动态物理对象）
    player = this.physics.add.sprite(100, 450, 'dude');

    // 设置玩家弹性（碰撞后反弹程度）0~1，越大反弹越厉害
    player.setBounce(0.2);
    // 限制玩家不能离开游戏边界
    player.setCollideWorldBounds(true);

    // 向左走动画
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        // 每秒播放 10 帧
        frameRate: 10,
        // 无限循环
        repeat: -1
    });

    // 站立动画
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    // 向右走动画
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // 给玩家(player)和平台(platforms)添加物理碰撞。
    this.physics.add.collider(player, platforms);

    // 创建方向键对象（上下左右）
    cursors = this.input.keyboard.createCursorKeys();

}

function update() {
    if (cursors.left.isDown)
    {
        // 设置玩家水平速度（向左）
        player.setVelocityX(-160);
        // 播放向左走动画
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    // 跳跃，按下上方向键，并且玩家站在地面上时才能跳跃
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

export const firstGame = () => new Phaser.Game(config);
