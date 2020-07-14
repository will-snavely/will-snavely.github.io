var fold1Config = {
  type: Phaser.AUTO,
  width: 800,
  height: 350,
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

var fold1Data = {
  fold1Game: new Phaser.Game(fold1Config),
  cursors: null,
  player: null,
  ball: null,
  buttonDown: false,
  sumText: "",
  sum: 0,
  movingBodies: [],
  rotatingBodies: [],
  velocity: 160,
  collectables: [],
};

function fold1Preload() {
  this.load.image("guy", "/assets/images/posts/fold1/guy.png");
  this.load.image("ball", "/assets/images/posts/fold1/ball.png");
  this.load.image("ground", "/assets/images/posts/fold1/ground.png");
  this.load.image("movebutton", "/assets/images/posts/fold1/movebutton.png");
  this.load.image("resetbutton", "/assets/images/posts/fold1/resetbutton.png");
  this.load.image("dog1", "/assets/images/posts/fold1/dog.png");
  this.load.image("pizza2", "/assets/images/posts/fold1/pizza.png");
  this.load.image("football3", "/assets/images/posts/fold1/football.png");
  this.load.image("guitar4", "/assets/images/posts/fold1/guitar.png");
  this.load.image("cactus5", "/assets/images/posts/fold1/cactus.png");
}

function fold1Create() {
  var OFFSCREEN = -500;
  var scene = this;
  var platforms = this.physics.add.staticGroup();
  var ground = platforms.create(0, 190, "ground").setOrigin(0, 0);
  ground.scaleY = 3;

  fold1Data.player = this.physics.add.image(40, 125, "guy");
  fold1Data.ball = this.physics.add.image(165, 100, "ball");

  this.physics.add.collider(fold1Data.player, platforms);
  this.physics.add.collider(fold1Data.ball, platforms);

  var sumStyle = {
    font: "bold 30px Courier",
    fill: "#000000",
    align: "center",
  };
  fold1Data.sumText = this.add.text(OFFSCREEN, OFFSCREEN, "Sum\n0", sumStyle);
  this.physics.world.enable(fold1Data.sumText);

  fold1Data.cursors = this.input.keyboard.createCursorKeys();

  collectableImages = ["dog1", "pizza2", "football3", "guitar4", "cactus5"];
  fold1Data.collectables = [];
  value = 1;
  collectableImages.forEach(function (image) {
    fold1Data.collectables.push({
      collected: false,
      body: scene.physics.add.image(OFFSCREEN, OFFSCREEN, image),
      intercept: null,
      value: value,
    });
    value += 1;
  });

  reset();

  var buttons = [
    this.add
      .image(110, 290, "movebutton")
      .setInteractive()
      .on("pointerdown", function () {
        this.setTint(0x00ff00);
        fold1Data.buttonDown = true;
      }),
    this.add
      .image(320, 290, "resetbutton")
      .setInteractive()
      .on("pointerdown", function () {
        this.setTint(0x00ff00);
        reset();
      }),
  ];

  scene.input.on("pointerup", function () {
    fold1Data.buttonDown = false;
    buttons.forEach(function (button) {
      button.setTint(0xffffff);
    });
  });
}

function resetCollectables() {
  var offset = 300;
  fold1Data.collectables.forEach(function (item) {
    item.collected = false;
    item.body.setVelocityX(0);
    item.body.setAngularVelocity(0);
    item.body.x = offset;
    item.body.y = 255;
    item.body.rotation = 0;
    item.intercept = offset - 40;
    offset += 100;
  });
}

function reset(scene) {
  resetCollectables();
  stop();
  fold1Data.ball.rotation = 0;
  fold1Data.player.x = 40;
  fold1Data.player.y = 125;
  fold1Data.ball.x = 165;
  fold1Data.ball.y = 100;
  fold1Data.sumText.x = fold1Data.ball.x - 27;
  fold1Data.sumText.y = fold1Data.ball.y - 30;

  fold1Data.sum = 0;
  fold1Data.sumText.setText("Sum\n" + fold1Data.sum);

  fold1Data.movingBodies = [
    fold1Data.player,
    fold1Data.ball,
    fold1Data.sumText.body,
  ];
  fold1Data.rotatingBodies = [fold1Data.ball];
}

function move(vx, vr) {
  fold1Data.movingBodies.forEach(function (item) {
    item.setVelocityX(vx);
  });
  fold1Data.rotatingBodies.forEach(function (item) {
    item.setAngularVelocity(vr);
  });
}

function stop() {
  move(0, 0);
}

function fold1Update() {
  fold1Data.collectables.forEach(function (item) {
    if (!item.collected && fold1Data.ball.x > item.intercept) {
      item.collected = true;
      item.body.x = fold1Data.ball.x;
      item.body.y = fold1Data.ball.y;
      fold1Data.movingBodies.push(item.body);
      fold1Data.rotatingBodies.push(item.body);
      fold1Data.sum += item.value;
      fold1Data.sumText.setText("Sum\n" + fold1Data.sum.toString());
    }
  });

  if (fold1Data.cursors.right.isDown || fold1Data.buttonDown) {
    if (fold1Data.player.x < 580) {
      move(160, 100);
    } else {
      stop();
    }
  } else {
    stop();
  }
}
