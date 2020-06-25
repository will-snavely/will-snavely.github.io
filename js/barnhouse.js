var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  parent: "barn",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  audio: {
    disableWebAudio: true,
  },
};

var game = new Phaser.Game(config);
var barnPos = new Phaser.Geom.Point(504, 2);
var animalStart = new Phaser.Geom.Point(700, 240);
var door1Pos = new Phaser.Geom.Point(barnPos.x + 37, barnPos.y + 108);
var door2Pos = new Phaser.Geom.Point(barnPos.x + 71, barnPos.y + 142);
var doorDisplace = 25;
var doorPoly;
var state = "init";
var animals;

function preload() {
  this.load.image("background", "assets/images/background.png");
  this.load.image("barnfront", "assets/images/barnfront.png");
  this.load.image("barnback", "assets/images/barnback.png");
  this.load.image("door1", "assets/images/door.png");
  this.load.image("door2", "assets/images/door.png");
  this.load.image("pusher", "assets/images/pusher.png");

  this.load.spritesheet("horse_ss", "assets/images/horse_sprites.png", {
    frameWidth: 150,
    frameHeight: 120,
  });
  this.load.spritesheet("pig_ss", "assets/images/pig_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("llama_ss", "assets/images/llama_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("giraffe_ss", "assets/images/giraffe_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("panda_ss", "assets/images/panda_sprites.png", {
    frameWidth: 160,
    frameHeight: 120,
  });
  this.load.spritesheet("blow_ss", "assets/images/blow_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });

  doorPoly = new Phaser.Geom.Polygon([
    new Phaser.Geom.Point(barnPos.x + 37, barnPos.y + 109),
    new Phaser.Geom.Point(barnPos.x + 107, barnPos.y + 178),
    new Phaser.Geom.Point(barnPos.x + 107, barnPos.y + 316),
    new Phaser.Geom.Point(barnPos.x + 37, barnPos.y + 248),
  ]);

  this.load.audioSprite("sfx", "assets/audio/sfx.json", [
    "assets/audio/sfx.ogg",
  ]);
}

function create() {
  var background_image = this.add.image(0, 0, "background").setOrigin(0, 0);
  var barnback_image = this.add
    .image(barnPos.x, barnPos.y, "barnback")
    .setOrigin(0, 0);

  var door1_image = this.add
    .image(door1Pos.x, door1Pos.y, "door1")
    .setOrigin(0, 0);

  var barnfront_image = this.add
    .image(barnPos.x + 107, barnPos.y, "barnfront")
    .setOrigin(0, 0);

  var door2_image = this.add
    .image(door2Pos.x, door2Pos.y, "door2")
    .setOrigin(0, 0);

  var pusher_image = this.add.image(
    animalStart.x,
    animalStart.y + 10,
    "pusher"
  );

  background_image.setDepth(10);
  barnback_image.setDepth(20);
  door1_image.setDepth(40);
  pusher_image.setDepth(41);
  barnfront_image.setDepth(50);
  door2_image.setDepth(60);

  this.input.on(
    "pointermove",
    function (pointer) {
      if (state == "init") {
        if (doorPoly.contains(pointer.x, pointer.y)) {
          door1_image.setTint(0xff0000);
          door2_image.setTint(0xff0000);
        } else {
          door1_image.setTint(0xffffff);
          door2_image.setTint(0xffffff);
        }
      }
    },
    this
  );

  this.input.on(
    "pointerdown",
    function (pointer) {
      if (state == "init" && doorPoly.contains(pointer.x, pointer.y)) {
        state = "playing";
        door1_image.setTint(0xffffff);
        door2_image.setTint(0xffffff);

        var index = Math.floor(Math.random() * animals.length);
        var animal = animals[index];
        var sprite = this.add.sprite(
          animalStart.x,
          animalStart.y,
          "animal_sprite"
        );

        sprite.setDepth(45);
        sprite.anims.play(animal.start_animation, true);
        pusher_image.x = animalStart.x + 90;

        this.tweens.timeline({
          onComplete: function () {
            sprite.destroy();
            state = "init";
          },

          tweens: [
            {
              targets: door1_image,
              x: door1Pos.x - doorDisplace,
              y: door1Pos.y - doorDisplace,
              duration: 2000,
              offset: 0,
            },
            {
              targets: door2_image,
              x: door2Pos.x + doorDisplace,
              y: door2Pos.y + doorDisplace,
              duration: 2000,
              offset: 0,
            },
            {
              targets: pusher_image,
              offset: 2000,
              props: {
                x: {
                  value: pusher_image.x - 200,
                  duration: 1000,
                  ease: "Linear",
                  yoyo: true,
                  repeat: 0,
                },
              },
            },
            {
              targets: sprite,
              offset: 2000,
              props: {
                x: {
                  value: animalStart.x - 200,
                  duration: 1000,
                  ease: "Linear",
                  repeat: 0,
                },
              },
              onStart: function () {
                sprite.anims.play(animal.start_animation);
              },
            },
            {
              targets: sprite,
              props: animal.tween,
              offset: 4000,
              onRepeat: animal.tween_onRepeat,
              onRepeatScope: this,

              onStart: function () {
                sprite.anims.play(animal.move_animation);
                if ("tween_onStart" in animal) {
                  animal.tween_onStart(this);
                }
              },
              onStartScope: this,
            },
            {
              targets: door1_image,
              x: door1Pos.x,
              y: door1Pos.y,
              duration: 2000,
              offset: 6000,
            },
            {
              targets: door2_image,
              x: door2Pos.x,
              y: door2Pos.y,
              duration: 2000,
              offset: 6000,
            },
          ],
        });
      }
    },
    this
  );

  this.anims.create({
    key: "horse_start",
    frames: [{ key: "horse_ss", frame: 0 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "horse_move",
    frames: this.anims.generateFrameNumbers("horse_ss", {
      start: 1,
      end: 5,
    }),
    yoyo: true,
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "pig_start",
    frames: [{ key: "pig_ss", frame: 0 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "pig_move",
    frames: this.anims.generateFrameNumbers("pig_ss", {
      start: 1,
      end: 5,
    }),
    yoyo: true,
    frameRate: 20,
    repeat: -1,
  });

  this.anims.create({
    key: "llama_move",
    frames: this.anims.generateFrameNumbers("llama_ss", {
      start: 1,
      end: 5,
    }),
    yoyo: true,
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "llama_start",
    frames: [{ key: "llama_ss", frame: 0 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "giraffe_move",
    frames: this.anims.generateFrameNumbers("giraffe_ss", {
      start: 1,
      end: 5,
    }),
    yoyo: true,
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "giraffe_start",
    frames: [{ key: "giraffe_ss", frame: 0 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "panda_start",
    frames: [{ key: "panda_ss", frame: 0 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "panda_move",
    frames: this.anims.generateFrameNumbers("panda_ss", {
      start: 1,
      end: 5,
    }),
    yoyo: true,
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "blowfish_start",
    frames: [{ key: "blow_ss", frame: 0 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "blowfish_move",
    frames: this.anims.generateFrameNumbers("blow_ss", {
      start: 0,
      end: 24,
    }),
    frameRate: 20,
    repeat: -1,
  });

  var scene = this;
  console.log(scene);

  animals = [
    {
      start_animation: "horse_start",
      move_animation: "horse_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
        },
        y: {
          duration: 300,
          yoyo: true,
          repeat: 4,
          ease: "Sine",
          value: animalStart.y - 100,
        },
      },
      tween_onRepeat: function () {
        this.sound.playAudioSprite("sfx", "horse_bounce");
      },
      tween_onStart: function (scene) {
        scene.sound.playAudioSprite("sfx", "horse_bounce");
      },
    },
    {
      start_animation: "pig_start",
      move_animation: "pig_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
        rotation: {
          value: -6,
          duration: 3000,
        },
      },
    },
    {
      start_animation: "llama_start",
      move_animation: "llama_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Quad.easeIn",
          repeat: 0,
        },
      },
      tween_onStart: function (scene) {
        scene.sound.playAudioSprite("sfx", "llama_rocket");
      },
    },
    {
      start_animation: "giraffe_start",
      move_animation: "giraffe_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
      },
    },
    {
      start_animation: "panda_start",
      move_animation: "panda_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
        y: {
          duration: 400,
          yoyo: true,
          repeat: 3,
          ease: "Sine",
          value: animalStart.y - 30,
        },
      },
    },
    {
      start_animation: "blowfish_start",
      move_animation: "blowfish_move",
      tween: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
        y: {
          duration: 625,
          yoyo: true,
          repeat: 2,
          ease: "Sine",
          value: animalStart.y - 100,
        },
      },
    },
  ];
}

function update() {}
