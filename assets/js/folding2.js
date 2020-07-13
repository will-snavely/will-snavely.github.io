var fold2Config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 550,
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
  accLabel: "Accumulator",
  ballLabel: "doubleUp",
  accText: null,
  ballText: null,
  acc: "",
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
  var OFFSCREEN = -500;
  fold2Data.platforms = this.physics.add.staticGroup();
  fold2Data.platforms.create(500, 470, "ground");

  fold2Data.player = this.physics.add.image(OFFSCREEN, OFFSCREEN, "guy");
  fold2Data.ball = this.physics.add.image(OFFSCREEN, OFFSCREEN, "ball");

  var style1 = {
    font: "bold 30px Courier",
    fill: "#000000",
    align: "center",
  };
  fold2Data.accText = this.add.text(100, 400, "", style1);
  var style1 = {
    font: "bold 24px Courier",
    fill: "#000000",
    align: "center",
  };
  fold2Data.ballText = this.add.text(
    OFFSCREEN,
    OFFSCREEN,
    fold2Data.ballLabel,
    style1
  );
  this.physics.world.enable(fold2Data.ballText);

  collectableImages = ["dog1", "pizza2", "football3"];
  fold2Data.collectables = [];
  value = 1;
  collectableImages.forEach(function (image) {
    fold2Data.collectables.push({
      collected: false,
      body: scene.physics.add.image(OFFSCREEN, OFFSCREEN, image),
      intercept: null,
      value: value,
    });
    value += 1;
  });

  this.physics.add.collider(fold2Data.player, fold2Data.platforms);
  this.physics.add.collider(fold2Data.ball, fold2Data.platforms);

  fold2Data.moveButton = this.add.image(500, 490, "movebutton");
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
    item.body.y = 425;
    item.body.rotation = 0;
    item.intercept = offset - 40 * fold2Data.direction;
    offset += 200;
  });
}

function reset(scene) {
  resetCollectables();
  stop();
  fold2Data.ball.rotation = 0;

  fold2Data.ball.y = 290;
  fold2Data.player.y = 305;
  if (fold2Data.direction == 1) {
    fold2Data.player.x = 40;
    fold2Data.ball.x = 165;
    fold2Data.player.flipX = false;
    fold2Data.ball.flipX = false;
    fold2Data.moveButton.flipX = false;
  } else {
    fold2Data.player.x = 960;
    fold2Data.ball.x = 835;
    fold2Data.player.flipX = true;
    fold2Data.ball.flipX = true;
    fold2Data.moveButton.flipX = true;
  }

  fold2Data.ballText.x = fold2Data.ball.x - 55;
  fold2Data.ballText.y = fold2Data.ball.y - 15;

  fold2Data.acc = "End";
  fold2Data.accText.setText(
    fold2Data.accLabel + ": " + fold2Data.acc.toString()
  );

  fold2Data.movingBodies = [
    fold2Data.player,
    fold2Data.ball,
    fold2Data.ballText.body,
  ];
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
        fold2Data.acc =
          "(" + item.value + ", (" + item.value + ", " + fold2Data.acc + "))";
        fold2Data.accText.setText(
          fold2Data.accLabel + ": " + fold2Data.acc.toString()
        );
      }
    }
  });

  if (
    fold2Data.buttonDown ||
    (fold2Data.direction == 1 && fold2Data.cursors.right.isDown) ||
    (fold2Data.direction == -1 && fold2Data.cursors.left.isDown)
  ) {
    if (fold2Data.player.x > 30 && fold2Data.player.x < 970) {
      move(160, 100);
    } else {
      stop();
    }
  } else {
    stop();
  }
}
