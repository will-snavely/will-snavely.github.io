var config = {
  type: Phaser.WEBGL,
  parent: "bike",
  width: 600,
  height: 500,
  scene: {
    preload: bikePreload,
    create: bikeCreate,
    update: bikeUpdate,
  },
  audio: {
    disableWebAudio: true,
  },
  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
  },
};

var camera;
var bikeGame = new Phaser.Game(config);
var cover;
var start_button;
var started = false;
var creatures;

function bikePreload() {
  this.load.scenePlugin(
    "Camera3DPlugin",
    "/assets/js/plugins/camera3d.min.js",
    "Camera3DPlugin",
    "cameras3d"
  );

  this.load.image("bg", "/assets/images/posts/bike/bg.png");
  this.load.image("rider", "/assets/images/posts/bike/rider.png");
  this.load.image("tree1", "/assets/images/posts/bike/tree1.png");
  this.load.image("cover", "/assets/images/posts/bike/fg.png");
  this.load.image("start", "/assets/images/posts/bike/start.png");
  this.load.image("hand", "/assets/images/posts/bike/hand.png");
  this.load.image("buttonbg", "/assets/images/posts/bike/buttonbg.png");
  this.load.image("hornfg", "/assets/images/posts/bike/hornfg.png");
  this.load.image("hornbg", "/assets/images/posts/bike/hornbg.png");
  this.load.image("note", "/assets/images/posts/bike/note.png");

  this.load.image("creature1", "/assets/images/posts/bike/creature1.png");
  this.load.image(
    "creature2_body",
    "/assets/images/posts/bike/creature2_body.png"
  );
  this.load.image(
    "creature2_arms",
    "/assets/images/posts/bike/creature2_arms.png"
  );
  this.load.image(
    "creature3_body",
    "/assets/images/posts/bike/creature3_body.png"
  );
  this.load.image(
    "creature3_leg1",
    "/assets/images/posts/bike/creature3_leg1.png"
  );
  this.load.image(
    "creature3_leg2",
    "/assets/images/posts/bike/creature3_leg2.png"
  );

  this.load.spritesheet(
    "finger_ss",
    "/assets/images/posts/bike/fingersprites.png",
    {
      frameWidth: 70,
      frameHeight: 70,
    }
  );
  this.load.spritesheet(
    "tire_ss",
    "/assets/images/posts/bike/tiresprites.png",
    {
      frameWidth: 100,
      frameHeight: 100,
    }
  );
  this.load.spritesheet(
    "horn_ss",
    "/assets/images/posts/bike/hornhandsprites.png",
    {
      frameWidth: 120,
      frameHeight: 120,
    }
  );
  this.load.audio("vex", ["/assets/sounds/vex.ogg", "/assets/sounds/vex.mp3"]);
}

function createAnims(scene) {
  scene.anims.create({
    key: "honk",
    frames: scene.anims.generateFrameNumbers("horn_ss", {
      start: 0,
      end: 4,
    }),
    frameRate: 30,
  });
  scene.anims.create({
    key: "right_rest",
    frames: [{ key: "horn_ss", frame: 0 }],
    frameRate: 15,
  });
  scene.anims.create({
    key: "spin",
    frames: scene.anims.generateFrameNumbers("tire_ss", {
      start: 0,
      end: 5,
    }),
    frameRate: 20,
    repeat: -1,
  });
  scene.anims.create({
    key: "left_rest",
    frames: [{ key: "finger_ss", frame: 0 }],
    frameRate: 20,
  });
  scene.anims.create({
    key: "extend",
    frames: scene.anims.generateFrameNumbers("finger_ss", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
  });
  var anim_wave = scene.anims.create({
    key: "wave",
    frames: scene.anims.generateFrameNumbers("finger_ss", {
      start: 0,
      end: 23,
    }),
    frameRate: 20,
    repeat: -1,
  });
  anim_wave.frames[23].nextFrame = anim_wave.frames[4];
}

function bikeCreate() {
  var scene = this;

  createAnims(scene);

  var musicPlayer = scene.sound.add("vex", {
    loop: true,
  });
  var musicStarted = false;

  camera = this.cameras3d.add(85).setPosition(0, 0, 2000);
  cover = this.add.image(0, 0, "cover").setOrigin(0, 0).setDepth(100);
  this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(-20);
  this.add.image(267, 433, "rider").setOrigin(0, 0).setDepth(10);

  var finger_sprite = scene.add.sprite(300, 422, "fingers");
  finger_sprite.setDepth(10);
  finger_sprite.anims.play("left_rest");
  var horn_sprite = scene.add.sprite(485, 441, "horn");
  horn_sprite.setDepth(10);
  horn_sprite.anims.play("right_rest");

  var wave_button = this.add.image(490, 60, "buttonbg").setDepth(10);
  var wave_toggled = false;
  var hand = this.add.image(490, 60, "hand").setDepth(30);
  this.tweens.add({
    targets: hand,
    rotation: 1,
    yoyo: true,
    repeat: -1,
  });

  wave_button.setInteractive().on("pointerdown", function () {
    if (!started) {
      return;
    }
    if (wave_toggled) {
      wave_toggled = false;
      wave_button.setTint(0xffffff);
      finger_sprite.anims.playReverse("extend");
    } else {
      wave_toggled = true;
      wave_button.setTint(0x00ff00);
      finger_sprite.anims.play("wave");
    }
  });

  var honk_button = this.add.image(490, 170, "buttonbg").setDepth(10);
  var honk_toggled = false;
  this.add.image(490, 170, "hornbg").setDepth(11);
  this.add.image(490, 170, "hornfg").setDepth(13);
  var note = this.add.image(460, 170, "note").setDepth(12);
  this.tweens.add({
    targets: note,
    duration: 1500,
    props: {
      x: {
        value: 400,
      },
      alpha: 0,
    },
    repeat: -1,
  });

  honk_button.setInteractive().on("pointerdown", function () {
    if (!started) {
      return;
    }
    if (honk_toggled) {
      honk_toggled = false;
      honk_button.setTint(0xffffff);
      horn_sprite.anims.playReverse("honk");
      if (musicStarted) {
        musicPlayer.pause();
      }
    } else {
      honk_toggled = true;
      honk_button.setTint(0xff0000);
      horn_sprite.anims.play("honk");
      if (!musicStarted) {
        musicPlayer.play();
        musicStarted = true;
      } else {
        musicPlayer.resume();
      }
    }
  });

  var tire_sprite = scene.add.sprite(410, 505, "tire");
  tire_sprite.anims.play("spin");

  start_button = this.add.image(300, 230, "start");
  start_button.setDepth(101);
  start_button
    .setInteractive()
    .on("pointerdown", function () {
      if (started) {
        return;
      }
      start_button.setTint(0x00ff00);
    })
    .on("pointerup", function () {
      start_button.setTint(0xffffff);
      if (started) {
        return;
      }
      started = true;
      start(scene);
    });

  creatures = [
    {
      parts: [
        {
          image: "creature1",
          startX: -50,
          startY: 100,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
            y: {
              value: 0,
              duration: 500,
              ease: "Sine",
              yoyo: true,
              repeat: 16,
            },
          },
        },
      ],
    },
    {
      parts: [
        {
          image: "creature2_arms",
          startX: -50,
          startY: 100,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
            y: {
              value: 80,
              duration: 500,
              yoyo: true,
              repeat: 16,
            },
          },
        },
        {
          image: "creature2_body",
          startX: -50,
          startY: 100,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
          },
        },
      ],
    },
    {
      parts: [
        {
          image: "creature3_leg1",
          startX: -50,
          startY: 100,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
            y: {
              value: 75,
              duration: 500,
              yoyo: true,
              repeat: 16,
            },
          },
        },
        {
          image: "creature3_leg2",
          startX: -50,
          startY: 75,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
            y: {
              value: 100,
              duration: 500,
              yoyo: true,
              repeat: 16,
            },
          },
        },
        {
          image: "creature3_body",
          startX: -50,
          startY: 100,
          startZ: 0,
          tween_props: {
            z: {
              value: 2500,
              duration: 7000,
            },
          },
        },
      ],
    },
  ];
}

function start(scene) {
  scene.tweens.add({
    targets: [cover, start_button],
    onComplete: function () {
      cover.destroy();
      start_button.destroy();
    },
    alpha: 0,
    duration: 1000,
  });

  treeScrollTimer(scene);
  creatureScrollTimer(scene);
}

function treeScrollTimer(scene) {
  scrollTree(scene);
  scene.time.delayedCall(Phaser.Math.Between(2000, 4000), treeScrollTimer, [
    scene,
  ]);
}

function creatureScrollTimer(scene) {
  scrollCreature(scene);
  scene.time.delayedCall(
    Phaser.Math.Between(5000, 10000),
    creatureScrollTimer,
    [scene]
  );
}

function scrollCreature(scene) {
  var index = Math.floor(Math.random() * creatures.length);
  var creature_meta = creatures[index];
  var timeline = scene.tweens.createTimeline();

  creature_meta.parts.forEach(function (part) {
    var creature_part = camera.create(
      part.startX,
      part.startY,
      part.startZ,
      part.image
    );
    creature_part.gameObject.alpha = 0;
    timeline.add({
      targets: creature_part,
      offset: 0,
      props: part.tween_props,
      onComplete: function () {
        console.log("removing");
        camera.remove(creature_part);
      },
    });
    timeline.add({
      targets: creature_part.gameObject,
      offset: 0,
      alpha: 1,
      duration: 500,
    });
  });
  timeline.play();
}

function scrollTree(scene) {
  var tree = camera.create(-500, 50, -6000, "tree1");
  tree.gameObject.alpha = 0;
  scene.tweens.add({
    targets: tree,
    onComplete: function () {
      camera.remove(tree);
    },
    props: {
      z: {
        value: 2500,
        duration: 10000,
      },
    },
  });
  scene.tweens.add({
    targets: tree.gameObject,
    props: {
      alpha: {
        value: 1,
        duration: 500,
      },
    },
  });
}

function bikeUpdate() {
  camera.update();
}
