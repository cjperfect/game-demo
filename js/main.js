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

var game = new Phaser.Game(
  window.innerWidth,
  window.innerHeight,
  Phaser.CANVAS,
  "gameCanvas"
);

// 左上角积分面板文字公共配置
var textCommonConfig = {
  fill: "#596061",
  fontSize: "12px",
  align: "center",
  fontWeight: 400,
};

// 游戏分数
var score = 0;

// 通过需要的分数
var successScore = 88;

// 是否游戏结束了
var isGameOver = false;

// 场景 LOADING
var loaderState = function (game) {
  this.preload = function () {
    // 分数图标
    game.load.image("scoreIcon", "assets/icon.png");
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
    game.load.image("bg", "assets/bg/bg.png");

    // game.load.onFileComplete.add(function (progress) {
    //   if (progress == 100) {
    //     game.state.start("runState");
    //   }
    // });
  };

  this.create = function () {
    game.stage.smoothed = false;
    Phaser.Canvas.setImageRenderingCrisp(game.canvas); // 仅限 Canvas 渲染器

    // 占位背景
    defaultBg = game.add.image(0, 0, "bg");
    defaultBg.width = game.width;
    defaultBg.height = game.height;
  };
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

  // 分数对象
  var scoreValue;

  this.create = function () {
    game.stage.smoothed = false;
    Phaser.Canvas.setImageRenderingCrisp(game.canvas); // 仅限 Canvas 渲染器

    // 开启游戏物理引擎
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // 跑道基础宽度
    var trackWidth = ~~(game.width / 3);
    // 定义三条跑道的X坐标（在变量范围内全局设置）
    var leftLane = 30;
    var middleLane = trackWidth + 30;
    var rightLane = trackWidth * 2 + 30;

    // 创建背景精灵图
    bg_sprites = game.add.tileSprite(0, 0, 1500, 4800, "bg");
    bg_sprites.smoothed = false;
    // 设置背景缩放以适应游戏窗口
    bg_sprites.scale.set(
      game.width / bg_sprites.width,
      game.height / bg_sprites.height
    );

    // 创建左上角计分板
    const graphics = game.add.graphics(0, 0);
    graphics.beginFill(0xffffff, 1);
    // 画一个圆角矩形（x, y, 宽, 高, 圆角）
    graphics.drawRoundedRect(32, 32, 136, 30, 20);
    // 将矩形转换为图片对象
    graphics.endFill();
    var scoreImg = game.add.image(20, 20, graphics.generateTexture());
    scoreImg.smoothed = false;
    graphics.destroy();

    // 分数前面的图标
    var scoreIcon = game.add.image(20, 16, "scoreIcon");
    score.smoothed = false;
    scoreIcon.anchor.set(0.5, 0.5);
    scoreIcon.scale.set(0.2);

    // 创建前缀文字“得分: ”
    var prefix = game.add.text(48, 18, "得分", textCommonConfig);
    prefix.anchor.set(0.5, 0.5);

    scoreValue = game.add.text(prefix.x + prefix.width + 20, 18, score, {
      ...textCommonConfig,
      fontSize: "18px",
    });
    scoreValue.anchor.set(0.5, 0.5);

    var suffix = game.add.text(
      scoreValue.x + scoreValue.width + 18,
      18,
      "分",
      textCommonConfig
    );
    suffix.anchor.set(0.5, 0.5);

    scoreImg.addChild(scoreIcon);
    scoreImg.addChild(prefix);
    scoreImg.addChild(scoreValue);
    scoreImg.addChild(suffix);

    // 玩家
    running = game.add.sprite(middleLane, game.height / 2, "running");
    running.smoothed = false;
    running.gameElementType = "player";
    // 为参与碰撞的物体启动物理系统
    game.physics.arcade.enable(running);
    runningMan = running.animations.add("running_away", [0, 1, 2]);
    runningMan.play(6, true);
    running.scale.set(0.24);
    running.body.setSize(420, 540, 15, 0);

    game.input.onUp.add(function () {
      var newPointer = game.input.activePointer;
      if (newPointer.position.x > running.x && running.x < rightLane) {
        // 向右移动一条跑道
        if (running.x == leftLane) {
          running.x = middleLane;
        } else if (running.x == middleLane) {
          running.x = rightLane;
        }
      } else if (newPointer.position.x < running.x && running.x > leftLane) {
        // 向左移动一条跑道
        if (running.x == rightLane) {
          running.x = middleLane;
        } else if (running.x == middleLane) {
          running.x = leftLane;
        }
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
      Phaser.Timer.SECOND * 3,
      function () {
        if (spawnInterval > minInterval) {
          // 生成障碍物时间短一点, 移动速度快一点, 背景速度快一点
          spawnInterval -= intervalDecrease;
          scrollSpeed += 15;
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
      // 随机选一个障碍物
      var randomIndex = game.rnd.integerInRange(0, 2);

      // 创建 sprite 并使用随机帧
      var xRandom = [leftLane, middleLane, rightLane];
      var x = xRandom[Math.floor(Math.random() * xRandom.length)];

      var obstacle = obstaclesGroup.create(x, -60, "obstacles", randomIndex); // 初始 y 为 -64（从上方出现）

      // 防止障碍物遮挡计分板, 提高计分板的层级
      game.world.bringToTop(scoreImg);

      // 设置障碍物属性
      switch (randomIndex) {
        case 0:
          // 炸弹
          obstacle.gameElementType = 0;
          break;
        case 1:
          // 石头
          obstacle.gameElementType = 1;
          // 得分
          obstacle.score = -5;
          break;
        case 2:
          // 粽子
          obstacle.gameElementType = 2;
          // 得分
          obstacle.score = 5;
          break;
      }

      // 设置物理和速度
      obstacle.body.velocity.y = scrollSpeed;
      obstacle.checkWorldBounds = true;
      obstacle.outOfBoundsKill = true;
      obstacle.scale.set(0.24);
      obstacle.body.setSize(280, 240, 50, 80);
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
    isGameOver = true;

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
  }

  // 碰撞检测
  function onCollide(running, obstacle) {
    // 碰撞不同的障碍物有不同的效果;
    switch (obstacle.gameElementType) {
      case 0:
        // 碰到炸弹
        game.paused = true;
        // 游戏结束
        gameOver();
        break;
      case 1:
        // 碰到石头
        obstacle.kill();
        score += obstacle.score;
        if (score < 0) {
          game.paused = true;
          // 游戏结束
          gameOver();
          return;
        }
        changeScore("reduceScore");
        break;
      case 2:
        // 碰到粽子
        obstacle.kill();
        score += obstacle.score;
        changeScore("addScore");
        break;
    }

    // 游戏通关
    if (score >= successScore) {
      game.paused = true;
      isGameOver = true;

      // 游戏通关
      document
        .querySelector(".game-success-container")
        .classList.remove("hidden");
      document.getElementById("scoreNum").innerText = score;
    }

    scoreValue.text = score;
  }

  this.update = function () {
    // 平滑向下滚动（纵向）
    // 每帧 tilePositionY 改变 scrollSpeed × delta
    const delta = this.time.physicsElapsed;
    bg_sprites.tilePosition.y += scrollSpeed * delta;
    game.physics.arcade.overlap(running, obstaclesGroup, onCollide, null, this);
  };

  // 打开碰撞调试
  // this.render = function () {
  //   game.debug.body(running);
  //   obstaclesGroup.forEach(function (obstacle) {
  //     game.debug.body(obstacle);
  //   });
  // }
};

game.state.add("loader", loaderState);
game.state.add("runState", runState);
// game.state.start("loader"); //启动第一个场景
