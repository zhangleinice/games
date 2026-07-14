import * as Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";

export class FirstGameScene extends Phaser.Scene {

    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars!: Phaser.Physics.Arcade.Group;
    private bombs!: Phaser.Physics.Arcade.Group;
    private scoreText!: Phaser.GameObjects.Text;

    private score = 0;
    private gameOver = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('sky', sky);
        this.load.image('ground', ground);
        this.load.image('star', star);
        this.load.image('bomb', bomb);
        // 加载精灵图（SpriteSheet），每一帧的宽度是 32，高度是 48
        this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        // 创建背景，把图片的中心放到 (400, 300) 这个坐标。
        this.add.image(400, 300, "sky");

        // 创建平台
        this.createPlatforms();

        // 创建玩家
        this.createPlayer();

        // 创建动画
        this.createAnimations();

        // 创建星星组（Group）
        this.createStars();

        // 创建炸弹组（Group）
        this.bombs = this.physics.add.group();

        // 添加碰撞体
        this.createColliders();

        // 创建方向键对象（上下左右）
        this.cursors = this.input.keyboard.createCursorKeys();

        // 创建左上角分数文本
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            color: "#000000",
        });

    }

    update() {
        if (this.gameOver) return;

        if (this.cursors.left.isDown)
        {
            // 设置玩家水平速度（向左）
            this.player.setVelocityX(-160);
            // 播放向左走动画
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // 跳跃，按下上方向键，并且玩家站在地面上时才能跳跃
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }
    }

    private createPlatforms ()
    {
        // 创建地面平台
        this.platforms = this.physics.add.staticGroup();

        // 创建地面
        // 在 (400,568) 创建一块地面，把它放大 2 倍，然后重新计算碰撞区域，使碰撞区域和放大后的图片一致。
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
    }

    private createPlayer ()
    {
        // 创建玩家（动态物理对象）
        this.player = this.physics.add.sprite(100, 450, 'dude');
        // 设置玩家弹性（碰撞后反弹程度）0~1，越大反弹越厉害
        this.player.setBounce(0.2);
        // 限制玩家不能离开游戏边界
        this.player.setCollideWorldBounds(true);
    }   

    private createAnimations ()
    {
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
    }

    private createStars() {
        this.stars = this.physics.add.group({
            key: 'star',
            // 创建1个，再重复11次
            repeat: 11,
            // setXY：第一个星星坐标 (12,0)，之后每个星星 x 坐标递增 70 像素
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        // 给每个星星设置一个随机弹跳高度（0.4 ~ 0.8）
        this.stars.children.forEach((child) => {
            (child as Phaser.Physics.Arcade.Image)
                .setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }

    private createColliders ()
    {
        // 玩家与平台碰撞，避免掉出地图
        this.physics.add.collider(this.player, this.platforms);

        // 给星星和平台添加碰撞
        this.physics.add.collider(this.stars, this.platforms);

        // 给玩家和星星添加重叠检测（Overlap）
        // 玩家碰到星星时，不会发生物理碰撞，而是调用 collectStar() 收集星星
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // 炸弹与平台发生物理碰撞
        this.physics.add.collider(this.bombs, this.platforms);
        // 玩家碰到炸弹时调用 hitBomb()
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    // 收集星星
    private collectStar (_, star)
    {
        // 禁用星星的物理和渲染（相当于消失）
        star.disableBody(true, true);

        // 计分
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // 如果所有星星都被收集完了
        if (this.stars.countActive(true) === 0)
        {
            // 重新启用所有星星，让它们重新从顶部掉落
            this.stars.children.forEach((child) => {
                const star = child as Phaser.Physics.Arcade.Image;

                star.enableBody(true, star.x, 0, true, true);
            });

            // 在玩家另一侧随机生成一个炸弹
            const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            // 创建炸弹
            const bomb = this.bombs.create(x, 16, 'bomb');
            // 完全弹性（撞墙会反弹）
            bomb.setBounce(1);
            // 不允许飞出屏幕
            bomb.setCollideWorldBounds(true);
            // 设置随机水平速度; 垂直速度固定为20，利用重力开始下落
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }

    // 碰到炸弹
    private hitBomb (player)
    {
        // 暂停整个物理系统, 玩家、炸弹都会停止运动
        this.physics.pause();
        // 玩家变成红色（受伤效果）
        player.setTint(0xff0000);
        // 播放站立动画（停止奔跑）
        this.player.anims.play('turn');

        this.gameOver = true;
    }
}