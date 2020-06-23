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
  this.load.image("background", "images/background.png");
  this.load.image("barnfront", "images/barnfront.png");
  this.load.image("barnback", "images/barnback.png");
  this.load.image("door1", "images/door.png");
  this.load.image("door2", "images/door.png");
  this.load.spritesheet("horse_ss", "images/horse_sprites.png", {
    frameWidth: 150,
    frameHeight: 120,
  });
  this.load.spritesheet("pig_ss", "images/pig_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("llama_ss", "images/llama_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("giraffe_ss", "images/giraffe_sprites.png", {
    frameWidth: 120,
    frameHeight: 120,
  });
  this.load.spritesheet("panda_ss", "images/panda_sprites.png", {
    frameWidth: 160,
    frameHeight: 120,
  });

  doorPoly = new Phaser.Geom.Polygon([
    new Phaser.Geom.Point(barnPos.x + 37, barnPos.y + 109),
    new Phaser.Geom.Point(barnPos.x + 107, barnPos.y + 178),
    new Phaser.Geom.Point(barnPos.x + 107, barnPos.y + 316),
    new Phaser.Geom.Point(barnPos.x + 37, barnPos.y + 248),
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

  background_image.setDepth(10);
  barnback_image.setDepth(20);
  door1_image.setDepth(40);
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

        var animal = animals[Math.floor(Math.random() * animals.length)];
        var sprite = this.add.sprite(
          animalStart.x,
          animalStart.y,
          animal.sprite
        );
        sprite.setDepth(45);
        sprite.anims.play(animal.animation, true);

        var timeline = this.tweens.timeline({
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
              targets: sprite,
              props: animal.tween_props,
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
            },
          ],
        });
      }
    },
    this
  );

  this.anims.create({
    key: "horse_anim",
    frames: this.anims.generateFrameNumbers("horse_ss", {
      start: 0,
      end: 8,
    }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "pig_anim",
    frames: this.anims.generateFrameNumbers("pig_ss", {
      start: 0,
      end: 8,
    }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "llama_anim",
    frames: this.anims.generateFrameNumbers("llama_ss", {
      start: 0,
      end: 8,
    }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "giraffe_anim",
    frames: this.anims.generateFrameNumbers("giraffe_ss", {
      start: 0,
      end: 8,
    }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "panda_anim",
    frames: this.anims.generateFrameNumbers("panda_ss", {
      start: 0,
      end: 8,
    }),
    frameRate: 15,
    repeat: -1,
  });

  animals = [
/*{
      sprite: "horse",
      animation: "horse_anim",
      tween_props: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },

        y: {
          duration: 400,
          delay: 500,
          yoyo: true,
          repeat: 3,
          ease: "Sine",
          value: animalStart.y - 100,
        },
      },
    },
    {
      sprite: "pig",
      animation: "pig_anim",
      tween_props: {
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
      sprite: "llama",
      animation: "llama_anim",
      tween_props: {
        x: {
          value: -100,
          duration: 4000,
          ease: "Quad.easeIn",
          repeat: 0,
        },
      },
    },
    {
      sprite: "giraffe",
      animation: "giraffe_anim",
      tween_props: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
      },
    },*/
    {
      sprite: "panda",
      animation: "panda_anim",
      tween_props: {
        x: {
          value: -100,
          duration: 3000,
          ease: "Linear",
          repeat: 0,
        },
        y: {
          duration: 400,
          delay: 500,
          yoyo: true,
          repeat: 3,
          ease: "Sine",
          value: animalStart.y - 30,
        },
        
      },
    },
  ];
}

function update() {}
