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

const dpr = window.devicePixelRatio || 1;

var game = new Phaser.Game(
  window.innerWidth,
  window.innerHeight,
  Phaser.CANVAS,
  "gameCanvas"
);

var scoreDom = document.querySelector(".score-num");

// 游戏分数
var score = 0;

// 通过需要的分数
var successScore = 60;

// 是否游戏结束了
var isGameOver = false;

// 场景 LOADING
var loaderState = function (game) {
  this.preload = function () {
    // 船动画
    game.load.atlasXML(
      "running",
      "assets/boat/sprites.png",
      "assets/boat/sprites.xml"
    );
    // 碰撞物资源加载
    game.load.atlasXML(
      "obstacles",
      "assets/obstacle/sprites.png",
      "assets/obstacle/sprites.xml"
    );

    // 分数图片, 加分
    game.load.image("addScore", "assets/addScore.png");
    // 分数图片，减分
    game.load.image("reduceScore", "assets/reduceScore.png");

    // 背景图片
    game.load.image("bg", "assets/bg.png");

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
            .querySelector(".game-tips-container")
            .classList.remove("hidden");
          game.state.start("runState");
          clearTimeout(startTimer);
        }, 400);
      }
    });
  };

  this.create = function () {};
};

var runState = function (game) {
  var runningMan;
  var obstaclesGroup;
  // 生成障碍物间隔时间
  var spawnInterval = 1500; // 初始间隔 1.5秒（单位ms）
  var minInterval = 500; // 最小间隔 0.5秒
  var intervalDecrease = 150; // 每次减少150ms

  var scrollSpeed = 160;

  // 无限生成障碍物的定时器
  var obstacleTimer;

  // 每隔多少秒增加生成障碍物的时间和速度
  var gapTime = 5;

  this.create = function () {
    game.paused = true;

    const { width, height } = game.canvas;
    game.canvas.width = width * dpr;
    game.canvas.height = height * dpr;
    game.canvas.style.width = width + "px";
    game.canvas.style.height = height + "px";
    const context = game.canvas.getContext("2d");
    context.scale(dpr, dpr);

    Phaser.Canvas.setImageRenderingCrisp(game.canvas); // 仅限 Canvas 渲染器
    game.stage.smoothed = false;

    // 开启游戏物理引擎
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.scale.scaleMode = Phaser.ScaleManager.FIT;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;

    // 跑道基础宽度
    var trackWidth = ~~(game.width / 3);
    // 定义三条跑道的X坐标（在变量范围内全局设置）
    var leftLane = 20;
    var middleLane = trackWidth + 20;
    var rightLane = trackWidth * 2 + 20;
    var lanes = [leftLane, middleLane, rightLane];
    var currentLaneIndex = 1; // 初始在中间
    var isMoving = false;

    // 创建背景精灵图
    bg_sprites = game.add.tileSprite(0, 0, 1500, 4800, "bg");

    // 设置背景缩放以适应游戏窗口
    bg_sprites.scale.set(
      game.width / bg_sprites.width,
      game.height / bg_sprites.height
    );

    // 玩家
    running = game.add.sprite(
      lanes[currentLaneIndex],
      game.height / 2,
      "running"
    );
    running.smoothed = false;
    running.gameElementType = "player";
    // 为参与碰撞的物体启动物理系统
    game.physics.arcade.enable(running);
    runningMan = running.animations.add("running_away", [0, 1, 2]);
    runningMan.play(6, true);
    running.scale.set(0.2);
    running.body.setSize(420, 540, 15, 0);

    function moveToLane(targetLane) {
      isMoving = true;
      var targetX = lanes[targetLane];

      var tween = game.add
        .tween(running)
        .to({ x: targetX }, 200, Phaser.Easing.Power2, true);
      tween.onComplete.add(function () {
        currentLane = targetLane;
        isMoving = false;
      });
    }

    game.input.onUp.add(function () {
      if (game.paused) return;
      if (isMoving) return;
      var pointerX = game.input.activePointer.position.x;
      var halfWidth = game.width / 2;
      if (pointerX > halfWidth && currentLaneIndex < 2) {
        moveToLane(++currentLaneIndex);
      } else if (pointerX < halfWidth && currentLaneIndex > 0) {
        moveToLane(--currentLaneIndex);
      }
    });

    // 创建障碍物组
    obstaclesGroup = game.add.group();
    // 为参与碰撞的物体启动物理系统
    obstaclesGroup.enableBody = true;
    obstaclesGroup.physicsBodyType = Phaser.Physics.ARCADE;

    // 定时器：每 spawnInterval 秒创建一个障碍物
    obstacleTimer = game.time.events.loop(spawnInterval, spawnObstacle, this);

    // 每 3 秒缩短一次生成间隔（直到最小值）
    game.time.events.loop(
      Phaser.Timer.SECOND * gapTime,
      function () {
        if (spawnInterval > minInterval) {
          // 生成障碍物时间短一点, 移动速度快一点, 背景速度快一点
          spawnInterval -= intervalDecrease;
          scrollSpeed += 20;
          // 先移除旧的计时器，再加一个新的更快的
          game.time.events.remove(obstacleTimer);
          obstacleTimer = game.time.events.loop(
            spawnInterval,
            spawnObstacle,
            this
          );
        }
      },
      this
    );

    // 生成障碍物函数
    function spawnObstacle() {
      // 随机选一个障碍物, 0 炸弹, 1石头, 2粽子
      var arr = [0, 0, 1, 1, 1, 2, 2];
      var randomIndex = arr[Math.floor(Math.random() * arr.length)];

      // 创建 sprite 并使用随机帧
      var xRandom = [leftLane, middleLane, rightLane];
      var x = xRandom[Math.floor(Math.random() * xRandom.length)];

      var obstacle = obstaclesGroup.create(x, -64, "obstacles", randomIndex); // 初始 y 为 -64（从上方出现）

      // 设置物理和速度
      obstacle.checkWorldBounds = true;
      obstacle.outOfBoundsKill = true;
      obstacle.visible = false;

      var t = setTimeout(() => {
        obstacle.visible = true;
        clearTimeout(t);
      }, 10);

      // 设置障碍物属性
      switch (randomIndex) {
        case 0:
          // 炸弹
          obstacle.gameElementType = 0;
          obstacle.body.setSize(60, 60, 10, 10);
          break;
        case 1:
          // 石头
          obstacle.gameElementType = 1;
          obstacle.score = -5;
          // 得分
          obstacle.body.setSize(60, 30, 10, 40);
          break;
        case 2:
          // 粽子
          obstacle.gameElementType = 2;
          // 得分
          obstacle.score = 5;
          obstacle.body.setSize(60, 40, 10, 25);
          break;
      }
    }
  };

  // 碰撞增加或者减少分数
  function changeScore(type) {
    var changeScoreImg = game.add.image(running.x, running.y - 50, type);
    changeScoreImg.anchor.set(0.5);
    changeScoreImg.scale.set(0.25);
    // 加补间动画，向上漂浮，然后消失
    var tween = game.add.tween(changeScoreImg).to(
      {
        y: changeScoreImg.y - 30,
        alpha: 0,
      },
      800,
      Phaser.Easing.Linear.None,
      true
    );

    tween.onComplete.add(function () {
      changeScoreImg.destroy();
    }, this);
  }

  function gameOver() {
    var _timer = setTimeout(() => {
      isGameOver = true;
      game.paused = true;

      // 获取游戏次数
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

      clearTimeout(_timer);
    }, 300);
  }

  // 碰撞检测
  function onCollide(running, obstacle) {
    // 播放碰撞动画/效果
    switch (obstacle.gameElementType) {
      case 0:
        // 碰到炸弹
        obstacle.kill();
        // 游戏通关
        if (score >= successScore) {
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
          gameOver();
        }
        break;
      case 1:
        // 碰到石头
        obstacle.kill();
        score += obstacle.score;
        if (score < 0) {
          gameOver();
        } else {
          changeScore("reduceScore");
        }
        break;
      case 2:
        // 碰到粽子
        obstacle.kill();
        score += obstacle.score;
        changeScore("addScore");
        break;
    }

    scoreDom.innerText = score;
  }

  this.update = function () {
    var delta = game.time.physicsElapsed; // 秒为单位
    // update 里
    bg_sprites.tilePosition.y += (scrollSpeed * delta) / bg_sprites.scale.y;

    obstaclesGroup.forEachAlive(function (obstacle) {
      obstacle.y += scrollSpeed * delta;
    });

    game.physics.arcade.overlap(running, obstaclesGroup, onCollide, null, this);
  };

  // 打开碰撞调试
  // this.render = function () {
  //   game.debug.body(running);
  //   obstaclesGroup.forEach(function (obstacle) {
  //     game.debug.body(obstacle);
  //   });
  // };
};

game.state.add("loader", loaderState);
game.state.add("runState", runState);
// game.state.start("loader"); //启动第一个场景
