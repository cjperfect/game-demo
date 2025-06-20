// 辅助函数，用于获取 URL 查询参数
function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] === variable) {
      return parseInt(pair[1], 10); // 转换为整数
    }
  }
  return null;
}

var successScore = 5;
var isGameOver = false;
var score = 0;

var game = new Phaser.Game(750, 1661, Phaser.CANVAS, "gameCanvas");

var main = function () {
  this.preload = function () {
    // 设置缩放模式
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // 设置图像渲染质量
    game.renderer.renderSession.roundPixels = true;
    game.stage.smoothed = false;
    game.load.image("background", "assets/background.png");
    game.load.image("ground", "assets/ground.png");
    game.load.image("title", "assets/title.png");
    game.load.spritesheet("bird", "assets/bird.png", 34, 24, 3);
    game.load.image("btn", "assets/start-button.png");
    game.load.spritesheet("pipe", "assets/pipes.png", 54, 320, 2);
    game.load.image("game_over", "assets/gameover.png");
    game.load.image("score_board", "assets/scoreboard.png");

    game.load.onFileComplete.add(function (progress) {
      // 加载界面
      var loadingLine = document.querySelector(".progress-line");
      var loadingIcon = document.querySelector(".progress-icon");
      loadingLine.style.width = progress + "%";
      loadingIcon.style.left = progress - 10 + "%";

      if (progress == 100) {
        var startTimer = setTimeout(() => {
          document.querySelector(".game-loading").classList.add("hidden");
          document
            .querySelector(".game-desc-container")
            .classList.remove("hidden");
          game.paused = true;
          clearTimeout(startTimer);
        }, 400);
      }
    });
  };

  this.create = function () {
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, "background");
    this.pipeGroup = game.add.group();
    this.pipeGroup.enableBody = true;
    this.ground = game.add.tileSprite(
      0,
      game.height - 112,
      game.width,
      112,
      "ground"
    );
    this.bird = game.add.sprite(50, game.world.centerY, "bird");
    this.bird.animations.add("fly");
    this.bird.animations.play("fly", 12, true);
    this.bird.anchor.setTo(0.5, 0.5);
    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
    this.bird.body.gravity.y = 0;
    game.physics.enable(this.ground, Phaser.Physics.ARCADE);
    this.ground.body.immovable = true;
    this.scoreText = game.add.text(game.world.centerX - 20, 30, "0", {
      font: "36px Arial",
      fill: "#fff",
      stroke: "#000",
      strokeThickness: 6,
    });
    this.hasStarted = false;
    game.time.events.loop(900, this.generatePipes, this);
    game.time.events.stop(false);
    setTimeout(() => {
      this.startGame();
    }, 800);
  };

  // 碰撞检测
  this.update = function () {
    if (!this.hasStarted) return;
    game.physics.arcade.collide(
      this.bird,
      this.ground,
      this.hitGround,
      null,
      this
    );
    game.physics.arcade.overlap(
      this.bird,
      this.pipeGroup,
      this.hitPipe,
      null,
      this
    );
    if (!this.bird.inWorld) this.hitCeil();
    if (this.bird.angle < 90) this.bird.angle += 2.5;
    this.pipeGroup.forEachExists(this.checkScore, this);
  };
  // 构建管道
  this.generatePipes = function () {
    var gap = 150;
    var difficulty = 100; // difficulty越大越简单
    var position =
      50 + Math.floor((505 - 112 - difficulty - gap) * Math.random());
    var topPipeY = 0;
    var bottomPipeY = position + gap;
    console.log("to", topPipeY, bottomPipeY);
    if (this.resetPipe(topPipeY, bottomPipeY)) return;
    var topPipe = game.add.sprite(
      game.width,
      topPipeY,
      "pipe",
      0,
      this.pipeGroup
    );
    var bottomPipe = game.add.sprite(
      game.width,
      bottomPipeY,
      "pipe",
      1,
      this.pipeGroup
    );
    this.pipeGroup.setAll("checkWorldBounds", true);
    this.pipeGroup.setAll("outOfBoundsKill", true);
    this.pipeGroup.setAll("body.velocity.x", -this.gameSpeed);
  };
  // 开始游戏
  this.startGame = function () {
    this.gameSpeed = 200;
    this.gameIsOver = false;
    this.hasHitGround = false;
    this.hasStarted = true;
    this.bg.autoScroll(-(this.gameSpeed / 10), 0);
    this.ground.autoScroll(-this.gameSpeed, 0);
    this.bird.body.gravity.y = 1150;
    game.input.onDown.add(this.fly, this);
    game.time.events.start();
  };
  this.stopGame = function () {
    this.bg.stopScroll();
    this.ground.stopScroll();
    this.pipeGroup.forEachExists(function (pipe) {
      pipe.body.velocity.x = 0;
    }, this);
    this.bird.animations.stop("fly", 0);
    game.input.onDown.remove(this.fly, this);
    game.time.events.stop(true);
  };
  this.fly = function () {
    this.bird.body.velocity.y = -350;
    game.add.tween(this.bird).to({ angle: -30 }, 100, null, true, 0, 0, false);
  };
  this.hitCeil = function () {
    this.gameOver();
  };
  this.hitPipe = function () {
    if (this.gameIsOver) return;
    this.gameOver();
  };
  this.hitGround = function () {
    if (this.hasHitGround) return;
    this.hasHitGround = true;
    this.gameOver(true);
  };
  this.gameOver = function (show_text) {
    this.gameIsOver = true;
    this.stopGame();
    if (show_text) this.showGameOverText();
  };
  this.showGameOverText = function () {
    this.scoreText.destroy();
    var ti = setTimeout(() => {
      if (_score >= successScore) {
        setTimeout(function () {
          game.paused = true;
          isGameOver = true;
          document
            .querySelector(".game-success-container")
            .classList.remove("hidden");
          document.getElementById("scoreNum").innerText = score;
        }, 300);
        return;
      } else {
        var times = getQueryVariable("times");
        if (times > 0) {
          document
            .querySelector(".game-over-container-times")
            .classList.remove("hidden");
        } else {
          document
            .querySelector(".game-over-container-no-times")
            .classList.remove("hidden");
        }
      }

      clearTimeout(ti);
    }, 500);
  };
  this.resetPipe = function (topPipeY, bottomPipeY) {
    var i = 0;
    this.pipeGroup.forEachDead(function (pipe) {
      if (pipe.y <= 0) {
        pipe.reset(game.width, topPipeY);
        pipe.hasScored = false;
      } else {
        pipe.reset(game.width, bottomPipeY);
      }
      pipe.body.velocity.x = -this.gameSpeed;
      i++;
    }, this);
    return i == 2;
  };
  this.checkScore = function (pipe) {
    if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 - 54) {
      pipe.hasScored = true;
      this.scoreText.text = ++score;
      return true;
    }
    return false;
  };
};

game.state.add("main", main);
