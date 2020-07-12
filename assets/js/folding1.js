var fold1Config = {
  type: Phaser.AUTO,
  width: 800,
  height: 260,
  parent: "fold1",
  scene: {
    preload: fold1Preload,
    create: fold1Create,
    update: fold1Update,
  },
  backgroundColor: Phaser.Display.Color.HexStringToColor("0xa6edff").color,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
  },
};

var fold1Game = new Phaser.Game(fold1Config);
var cursors;
var player;
var ball;
var platforms;
var buttonDown = false;
var sumText;
var sum = 0;
var movingBodies = [];
var rotatingBodies = [];
var velocity = 160;
var collectables;

function fold1Preload() {
  this.load.image("guy", "/assets/images/posts/fold1/guy.png");
  this.load.image("ball", "/assets/images/posts/fold1/ball.png");
  this.load.image("ground", "/assets/images/posts/fold1/ground.png");
  this.load.image("rightbutton", "/assets/images/posts/fold1/right.png");
  this.load.image("dog1", "/assets/images/posts/fold1/dog.png");
  this.load.image("pizza2", "/assets/images/posts/fold1/pizza.png");
  this.load.image("football3", "/assets/images/posts/fold1/football.png");
  this.load.image("guitar4", "/assets/images/posts/fold1/guitar.png");
  this.load.image("cactus5", "/assets/images/posts/fold1/cactus.png");
}

function fold1Create() {
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 230, "ground");

  player = this.physics.add.image(40, 125, "guy");
  ball = this.physics.add.image(165, 100, "ball");

  dog1 = this.physics.add.image(300, 255, "dog1");
  pizza2 = this.physics.add.image(400, 255, "pizza2");
  football3 = this.physics.add.image(500, 255, "football3");
  guitar4 = this.physics.add.image(600, 255, "guitar4");
  cactus5 = this.physics.add.image(700, 255, "cactus5");

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(ball, platforms);

  var right_button = this.add.image(40, 230, "rightbutton");
  right_button
    .setInteractive()
    .on("pointerdown", function () {
      right_button.setTint(0x00ff00);
      buttonDown = true;
    })
    .on("pointerup", function () {
      right_button.setTint(0xffffff);
      buttonDown = false;
    });

  var instStyle = { font: "bold 22px Courier", fill: "#000000" };
  instText = this.add.text(80, 210, "Click arrow button\nor press right arrow key", instStyle);

  var sumStyle = { font: "bold 30px Courier", fill: "#000000", align: "center" };
  sumText = this.add.text(ball.x - 27, ball.y - 30, "Sum\n0", sumStyle);
  this.physics.world.enable(sumText);

  cursors = this.input.keyboard.createCursorKeys();

  movingBodies.push(player);
  movingBodies.push(ball);
  movingBodies.push(sumText.body);
  rotatingBodies.push(ball);

  collectables = [
    {
      collected: false,
      body: dog1,
      intercept: 260,
      value: 1,
    },
    {
      collected: false,
      body: pizza2,
      intercept: 360,
      value: 2,
    },
    {
      collected: false,
      body: football3,
      intercept: 460,
      value: 3,
    },
    {
      collected: false,
      body: guitar4,
      intercept: 560,
      value: 4,
    },
    {
      collected: false,
      body: cactus5,
      intercept: 660,
      value: 5,
    },
  ];
}

function move(vx, vr) {
  movingBodies.forEach(function (item) {
    item.setVelocityX(vx);
  });
  rotatingBodies.forEach(function (item) {
    item.setAngularVelocity(vr);
  });
}

function stop() {
  move(0, 0);
}

function fold1Update() {
  collectables.forEach(function (item) {
    if (!item.collected && ball.x > item.intercept) {
      item.collected = true;
      item.body.x = ball.x;
      item.body.y = ball.y;
      movingBodies.push(item.body);
      rotatingBodies.push(item.body);
      sum += item.value;
      sumText.setText("Sum\n" + sum.toString());
    }
  });

  if (cursors.right.isDown || buttonDown) {
    if (player.x < 580) {
      move(160, 100);
    } else {
      stop();
    }
  } else {
    stop();
  }
}
