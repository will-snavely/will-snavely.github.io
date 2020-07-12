var fold2Config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 500,
  parent: "fold2",
  scene: {
    preload: fold2Preload,
    create: fold2Create,
    update: fold2Update,
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

var fold2Data = {
  game: new Phaser.Game(fold2Config),
  cursors: null,
  player: null,
  ball: null,
  platforms: null,
  buttonDown: false,
  sumText: "",
  sum: 0,
  movingBodies: [],
  rotatingBodies: [],
  velocity: 160,
  collectables: [],
  direction: 1,
  moveButton: null,
};

function fold2Preload() {
  this.load.image("guy", "/assets/images/posts/fold1/guy.png");
  this.load.image("ball", "/assets/images/posts/fold1/ball.png");
  this.load.image("ground", "/assets/images/posts/fold3/ground.png");
  this.load.image("dog1", "/assets/images/posts/fold1/dog.png");
  this.load.image("pizza2", "/assets/images/posts/fold1/pizza.png");
  this.load.image("football3", "/assets/images/posts/fold1/football.png");
  this.load.image("guitar4", "/assets/images/posts/fold1/guitar.png");
  this.load.image("cactus5", "/assets/images/posts/fold1/cactus.png");
  this.load.image("leftbutton", "/assets/images/posts/fold3/leftbutton.png");
  this.load.image("rightbutton", "/assets/images/posts/fold3/rightbutton.png");
  this.load.image("movebutton", "/assets/images/posts/fold3/movebutton.png");
}

function fold2Create() {
  scene = this;
  fold2Data.platforms = this.physics.add.staticGroup();
  fold2Data.platforms.create(500, 420, "ground");

  fold2Data.player = this.physics.add.image(40, 265, "guy");
  fold2Data.ball = this.physics.add.image(165, 240, "ball");

  var sumStyle = {
    font: "bold 30px Courier",
    fill: "#000000",
    align: "center",
  };
  fold2Data.sumText = this.add.text(
    fold2Data.ball.x - 27,
    fold2Data.ball.y - 30,
    "Sum\n0",
    sumStyle
  );
  this.physics.world.enable(fold2Data.sumText);

  fold2Data.collectables = [
    {
      collected: false,
      body: this.physics.add.image(300, 395, "dog1"),
      intercept: 260,
      value: 1,
    },
    {
      collected: false,
      body: this.physics.add.image(400, 395, "pizza2"),
      intercept: 360,
      value: 2,
    },
    {
      collected: false,
      body: this.physics.add.image(500, 395, "football3"),
      intercept: 460,
      value: 3,
    },
    {
      collected: false,
      body: this.physics.add.image(600, 395, "guitar4"),
      intercept: 560,
      value: 4,
    },
    {
      collected: false,
      body: this.physics.add.image(700, 395, "cactus5"),
      intercept: 660,
      value: 5,
    },
  ];

  this.physics.add.collider(fold2Data.player, fold2Data.platforms);
  this.physics.add.collider(fold2Data.ball, fold2Data.platforms);

  fold2Data.moveButton = this.add.image(500, 420, "movebutton");
  fold2Data.moveButton.setInteractive().on("pointerdown", function () {
    fold2Data.buttonDown = true;
    fold2Data.moveButton.setTint(0x00ff00);
  });
  scene.input.on("pointerup", function () {
    fold2Data.buttonDown = false;
    fold2Data.moveButton.setTint(0xffffff);
  });
  reset(scene);

  var left_button = this.add.image(110, 60, "leftbutton");
  left_button.setTint(0x00ff00);
  left_button.setInteractive().on("pointerdown", function () {
    if (fold2Data.direction == -1) {
      fold2Data.direction = 1;
      left_button.setTint(0x00ff00);
      right_button.setTint(0xffffff);
      reset(scene);
    }
  });

  var right_button = this.add.image(320, 60, "rightbutton");
  right_button.setInteractive().on("pointerdown", function () {
    if (fold2Data.direction == 1) {
      fold2Data.direction = -1;
      left_button.setTint(0xffffff);
      right_button.setTint(0x00ff00);
      reset(scene);
    }
  });

  fold2Data.cursors = this.input.keyboard.createCursorKeys();
}

function resetCollectables() {
  var offset = 300;
  fold2Data.collectables.forEach(function (item) {
    item.collected = false;
    item.body.setVelocityX(0);
    item.body.setAngularVelocity(0);
    item.body.x = offset;
    item.body.y = 395;
    item.body.rotation = 0;
    item.intercept = offset - 40 * fold2Data.direction;
    offset += 100;
  });
}

function reset(scene) {
  resetCollectables();
  stop();
  fold2Data.ball.rotation = 0;

  if (fold2Data.direction == 1) {
    fold2Data.player.x = 40;
    fold2Data.player.y = 265;
    fold2Data.ball.x = 165;
    fold2Data.ball.y = 240;
    fold2Data.player.flipX = false;
    fold2Data.ball.flipX = false;
    fold2Data.moveButton.flipX = false;
  } else {
    fold2Data.player.x = 960;
    fold2Data.player.y = 265;
    fold2Data.ball.x = 835;
    fold2Data.ball.y = 240;
    fold2Data.player.flipX = true;
    fold2Data.ball.flipX = true;
    fold2Data.moveButton.flipX = true;
  }

  fold2Data.sum = 0;
  fold2Data.sumText.x = fold2Data.ball.x - 27;
  fold2Data.sumText.setText("Sum\n" + fold2Data.sum.toString());

  fold2Data.movingBodies = [fold2Data.player, fold2Data.ball, fold2Data.sumText.body];
  fold2Data.rotatingBodies = [fold2Data.ball];
}

function move(vx, vr) {
  fold2Data.movingBodies.forEach(function (item) {
    item.setVelocityX(vx * fold2Data.direction);
  });
  fold2Data.rotatingBodies.forEach(function (item) {
    item.setAngularVelocity(vr * fold2Data.direction);
  });
}

function stop() {
  move(0, 0);
}

function fold2Update() {
  fold2Data.collectables.forEach(function (item) {
    if (!item.collected) {
      if (fold2Data.direction * (item.intercept - fold2Data.ball.x) < 0) {
        item.collected = true;
        item.body.x = fold2Data.ball.x;
        item.body.y = fold2Data.ball.y;
        fold2Data.movingBodies.push(item.body);
        fold2Data.rotatingBodies.push(item.body);
        fold2Data.sum += item.value;
        fold2Data.sumText.setText("Sum\n" + fold2Data.sum.toString());
      }
    }
  });

  if (fold2Data.buttonDown) {
    if (fold2Data.player.x > 30 && fold2Data.player.x < 970) {
      move(160, 100);
    } else {
      stop();
    }
  } else {
    stop();
  }
}
