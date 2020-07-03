var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: 500,
  parent: "barn",
  transparent: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    mode: Phaser.Scale.RESIZE
  },
};

var game = new Phaser.Game(config);
var barnPos = new Phaser.Geom.Point(-130, 40);
var animalStart = new Phaser.Geom.Point(-30, 280);
var animalEndX = 2000;
var door1Pos = new Phaser.Geom.Point(barnPos.x + 200, barnPos.y + 142);
var door2Pos = new Phaser.Geom.Point(door1Pos.x + 35, door1Pos.y - 35);
var doorDisplace = 25;
var doorPoly;
var state = "init";
var animals;

function preload() {
  this.load.image("barnfront", "/assets/images/footer/barnfront.png");
  this.load.image("barnmask", "/assets/images/footer/barnmask.png");
  this.load.image("barnback", "/assets/images/footer/barnback.png");
  this.load.image("speech", "/assets/images/footer/speech.png");
  this.load.image("door1", "/assets/images/footer/door.png");
  this.load.image("door2", "/assets/images/footer/door.png");
  this.load.image("pusher", "/assets/images/footer/pusher.png");

  this.load.spritesheet("horse_ss", "/assets/images/footer/horse_sprites.png", {
    frameWidth: 150,
    frameHeight: 120,
  });
  this.load.spritesheet("pig_ss", "/assets/images/footer/pig_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("llama_ss", "/assets/images/footer/llama_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("giraffe_ss", "/assets/images/footer/giraffe_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("panda_ss", "/assets/images/footer/panda_sprites.png", {
    frameWidth: 160,
    frameHeight: 120,
  });
  this.load.spritesheet("blow_ss", "/assets/images/footer/blow_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });

  doorPoly = new Phaser.Geom.Polygon([
    new Phaser.Geom.Point(barnPos.x + 200, barnPos.y + 178),
    new Phaser.Geom.Point(barnPos.x + 270, barnPos.y + 109),
    new Phaser.Geom.Point(barnPos.x + 270, barnPos.y + 248),
    new Phaser.Geom.Point(barnPos.x + 200, barnPos.y + 316),
  ]);
}

function create() {
  var barnmask_image = this.add
    .image(barnPos.x, barnPos.y, "barnmask")
    .setOrigin(0, 0);

  var barnfront_image = this.add
    .image(barnPos.x, barnPos.y, "barnfront")
    .setOrigin(0, 0);

  var barnback_image = this.add
    .image(barnPos.x + 200, barnPos.y, "barnback")
    .setOrigin(0, 0);

  var door1_image = this.add
    .image(door1Pos.x, door1Pos.y, "door1")
    .setOrigin(0, 0);

  var door2_image = this.add
    .image(door2Pos.x, door2Pos.y, "door2")
    .setOrigin(0, 0);

  var pusher_image = this.add.image(
    animalStart.x - 40,
    animalStart.y + 10,
    "pusher"
  );
  pusher_image.flipX = true;

  barnmask_image.setDepth(1);
  barnback_image.setDepth(30);
  door2_image.setDepth(40);
  pusher_image.setDepth(50);
  barnfront_image.setDepth(60);
  door1_image.setDepth(70);

  var highlight_group = [
    barnback_image,
    barnfront_image,
    door1_image,
    door2_image,
  ];

  var pointer_over = false;
  var tint = 0xfffffff;

  barnmask_image
    .setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
    })
    .on("pointerover", function () {
      highlight_group.forEach(function (elem) {
        elem.setTint(0xff0000);
      });
    });

  barnmask_image
    .setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
    })
    .on("pointerout", function () {
      highlight_group.forEach(function (elem) {
        elem.setTint(0xffffff);
      });
    });

  barnmask_image
    .setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
    })
    .on("pointerup", function () {});

  barnmask_image
    .setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
    })
    .on(
      "pointerdown",
      function () {
        if (state == "playing") {
          var speech_image = this.add.image(0, 0, "speech");
          speech_image.x = 200;
          speech_image.y = 150;
          speech_image.alpha = 1;
          speech_image.setDepth(70);

          this.tweens.add(make_speech_bubble_tween(speech_image));
        } else if (state == "init") {
          state = "playing";

          var index = Math.floor(Math.random() * animals.length);
          var animal = animals[index];
          var sprite = this.add.sprite(
            animalStart.x,
            animalStart.y,
            "animal_sprite"
          );

          sprite.setDepth(55);
          sprite.flipX = true;
          sprite.anims.play(animal.start_animation);

          this.tweens.timeline({
            onComplete: function () {
              sprite.destroy();
            },

            tweens: [
              {
                targets: door1_image,
                x: door1Pos.x - doorDisplace,
                y: door1Pos.y + doorDisplace,
                duration: 2000,
                offset: 0,
              },
              {
                targets: door2_image,
                x: door2Pos.x + doorDisplace,
                y: door2Pos.y - doorDisplace,
                duration: 2000,
                offset: 0,
              },
              {
                targets: pusher_image,
                offset: 2000,
                props: {
                  x: {
                    value: pusher_image.x + 200,
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
                    value: animalStart.x + 200,
                    duration: 1000,
                    ease: "Linear",
                    repeat: 0,
                  },
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
                offset: 5000,
              },
              {
                targets: door2_image,
                x: door2Pos.x,
                y: door2Pos.y,
                duration: 2000,
                offset: 5000,
                onComplete: function () {
                  state = "init";
                },
              },
              {
                targets: sprite,
                alpha: 0,
                duration: 1000,
                offset: 10000,
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
          value: animalEndX,
          duration: 8000,
          ease: "Linear",
        },
        y: {
          duration: 300,
          yoyo: true,
          repeat: 10,
          ease: "Sine",
          value: animalStart.y - 100,
        },
      },
    },
    {
      start_animation: "pig_start",
      move_animation: "pig_move",
      tween: {
        x: {
          value: animalEndX,
          duration: 8000,
          ease: "Linear",
          repeat: 0,
        },
        rotation: {
          value: 10,
          duration: 8000,
        },
      },
    },
    {
      start_animation: "llama_start",
      move_animation: "llama_move",
      tween: {
        x: {
          value: animalEndX,
          duration: 8000,
          ease: "Quad.easeIn",
          repeat: 0,
        },
      },
    },
    {
      start_animation: "giraffe_start",
      move_animation: "giraffe_move",
      tween: {
        x: {
          value: animalEndX,
          duration: 8000,
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
          value: animalEndX,
          duration: 8000,
          ease: "Linear",
          repeat: 0,
        },
        y: {
          duration: 400,
          yoyo: true,
          repeat: 10,
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
          value: animalEndX,
          duration: 8000,
          ease: "Linear",
          repeat: 0,
        },
        y: {
          duration: 625,
          yoyo: true,
          repeat: 10,
          ease: "Sine",
          value: animalStart.y - 100,
        },
      },
    },
  ];
}

function make_speech_bubble_tween(target) {
  return {
    targets: target,
    onComplete: function () {
      target.destroy();
    },
    duration: 1000,
    props: {
      alpha: {
        value: 0,
        ease: "Quad.easeIn",
      },
      scaleX: {
        value: 0.5,
        ease: "Linear",
      },
      rotation: {
        value: -0.4,
        ease: "Linear",
      },
      scaleY: {
        value: 0.5,
        ease: "Linear",
      },
      x: {
        value: 300,
        ease: "Linear",
      },
      y: {
        value: 50,
        ease: "Linear",
      },
    },
  };
}

function update() {}
