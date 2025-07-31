// 辅助函数，用于获取 URL 查询参数
function getQueryVariable(variable) {
  // 获取 URL 查询字符串
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
var scoreDom = document.querySelector(".score-num");
var levelDom = document.querySelector(".level-num");

// 成功分数线
var successScore = 1;

// 多少分为1关
var nextLevelScore = 2;

// 当前分数
var score = 0;

// 当前关卡
var level = 1;

// 游戏是否结束
var isGameOver = false;

// 生成管道时间
var interval = 1400;

// 升级关卡动画元素
var boxGroup;

// 创建 Phaser 游戏实例，设置画布大小和渲染方式
var game = new Phaser.Game(750, 1609, Phaser.CANVAS, "gameCanvas");

// 主游戏逻辑
var main = function () {
  // 预加载资源
  this.preload = function () {
    // 设置缩放模式，适配不同屏幕
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // 设置图像渲染质量
    game.renderer.renderSession.roundPixels = true;
    game.stage.smoothed = false;

    // 加载游戏所需图片资源
    game.load.image("background", "assets/bg.png");
    game.load.image("ground", "assets/ground.png");
    game.load.image("bird", "assets/bird.png");
    game.load.spritesheet("pipe", "assets/pipes.png", 124, 454, 2);

    // 关于游戏声音加载
    game.load.audio("hit_pipe_sound", "assets/pipe-hit.mp3");
    game.load.audio("down_sound", "assets/down.mp3");

    // 监听资源加载进度，更新加载界面
    game.load.onFileComplete.add(function (progress) {
      var loadingLine = document.querySelector(".progress-line");
      var loadingIcon = document.querySelector(".progress-icon");
      loadingLine.style.width = progress + "%";
      loadingIcon.style.left = progress - 10 + "%";

      // 资源加载完成后，显示游戏说明界面
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

  // 创建游戏场景
  this.create = function () {
    // 添加背景
    this.bg = game.add.tileSprite(0, 0, game.width, game.height, "background");
    // 创建管道组
    this.pipeGroup = game.add.group();
    this.pipeGroup.enableBody = true;
    // 添加地面
    this.ground = game.add.tileSprite(
      0,
      game.world.centerY + 295,
      game.width,
      20,
      "ground"
    );
    // 添加小鸟角色
    this.bird = game.add.sprite(350, game.world.centerY - 200, "bird");
    this.bird.anchor.setTo(0.5, 0.5);
    // 启用物理系统
    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
    // 调整碰撞面积
    this.bird.body.setCircle(40, 30, 10); // 30为半径，10,10为偏移
    this.bird.body.gravity.y = 0;
    game.physics.enable(this.ground, Phaser.Physics.ARCADE);
    this.ground.body.immovable = true;
    // 添加游戏音效
    this.soundHitPipe = game.add.sound("hit_pipe_sound");
    this.downSound = game.add.sound("down_sound");

    // 创建关卡升级动画文本
    boxGroup = game.add.group();
    var rect = game.add.graphics(0, 0);
    rect.beginFill("#000000", 0.8); // 蓝色、透明度 0.8
    rect.drawRoundedRect(0, 0, 220, 114, 16); // 圆角矩形
    rect.endFill();

    this.tweenText = game.add.text(
      boxGroup.x + boxGroup.width / 2 + 110,
      boxGroup.y + boxGroup.height / 2 + 57,
      "",
      {
        fontSize: "26px",
        fill: "#fff",
        fontWeight: "normal",
      }
    );
    this.tweenText.anchor.setTo(0.5);

    boxGroup.add(rect);
    boxGroup.add(this.tweenText);
    boxGroup.visible = false;

    // 游戏状态标志
    this.hasStarted = false;

    // 定时生成管道, 每过一关生成管道的速度加快
    game.time.events.loop(
      interval - (level - 1) * 200,
      this.generatePipes,
      this
    );
    // 暂停管道生成
    game.time.events.stop(false);
    // 延迟启动游戏
    setTimeout(() => {
      this.startGame();
    }, 800);
  };

  // 游戏主循环，碰撞检测
  this.update = function () {
    if (!this.hasStarted) return;

    // 限制小鸟最高只能到y=160
    if (this.bird.y < 160) {
      this.bird.y = 160;
      this.bird.body.velocity.y = 0;
    }
    // 检测小鸟与地面的碰撞
    game.physics.arcade.collide(
      this.bird,
      this.ground,
      this.hitGround,
      null,
      this
    );
    // 检测小鸟与管道的碰撞
    game.physics.arcade.overlap(
      this.bird,
      this.pipeGroup,
      this.hitPipe,
      null,
      this
    );

    // 小鸟下落角度变化
    if (this.bird.angle < 90) this.bird.angle += 2.5;
    // 检查是否得分
    this.pipeGroup.forEachExists(this.checkScore, this);
  };

  /**
   * 升级关卡
   * 增加球数量并显示升级动画
   */
  this.levelUp = function (level) {
    // 设置升级文本
    boxGroup.x = game.world.centerX - 110;
    boxGroup.y = game.world.centerY + 250;
    boxGroup.alpha = 0;
    this.tweenText.setText("进入Level " + level);

    // 播放升级动画
    game.add
      .tween(boxGroup)
      .to({ y: boxGroup.y - 100, alpha: 0.8 }, 300, "Linear", false)
      .to({ y: boxGroup.y - 150 }, 500, "Linear", false)
      .to({ y: boxGroup.y - 250, alpha: 0 }, 300, "Linear", true);
  };

  // 生成管道
  this.generatePipes = function () {
    var gap = 300; // 固定间隙
    var totalPipeHeight = 900; // 上下管道总高度
    // 随机上管道高度
    var topPipeHeight =
      Math.floor(Math.random() * (totalPipeHeight - gap - 150 - 300 + 1)) + 300;
    var bottomPipeHeight = totalPipeHeight - topPipeHeight - 200;
    var topPipeY = Math.floor(Math.random() * (160 - 120 + 1)) + 120;
    var groundY = game.world.centerY + 295; // 地面的位置
    var bottomPipeY = groundY - bottomPipeHeight;

    // 优先复用死亡的管道
    // if (this.resetPipe(topPipeY, bottomPipeY)) return;

    // 创建上管道
    var topPipe = game.add.sprite(
      game.width,
      topPipeY,
      "pipe",
      0,
      this.pipeGroup
    );
    topPipe.height = topPipeHeight;
    topPipe.visible = false;

    // 创建下管道
    var bottomPipe = game.add.sprite(
      game.width,
      bottomPipeY,
      "pipe",
      1,
      this.pipeGroup
    );
    bottomPipe.height = bottomPipeHeight;
    bottomPipe.visible = false;

    setTimeout(() => {
      topPipe.visible = true;
      bottomPipe.visible = true;
    }, 10);

    // 设置管道属性
    this.pipeGroup.setAll("checkWorldBounds", true);
    this.pipeGroup.setAll("outOfBoundsKill", true);
    this.pipeGroup.setAll("body.velocity.x", -this.gameSpeed);
  };
  // 启动游戏
  this.startGame = function () {
    this.gameSpeed = 200; // 管道移动速度
    this.gameIsOver = false;
    this.hasHitGround = false;
    this.hasStarted = true;

    // 升级动画显示
    boxGroup.visible = true;
    this.levelUp(1);

    // 小鸟重力生效
    this.bird.body.gravity.y = 1150;
    // 绑定点击事件，控制小鸟飞行
    game.input.onDown.add(this.fly, this);
    // 启动管道生成定时器
    game.time.events.start();
  };
  // 停止游戏
  this.stopGame = function () {
    // 停止所有管道移动
    this.pipeGroup.forEachExists(function (pipe) {
      pipe.body.velocity.x = 0;
    }, this);

    // 移除点击事件
    game.input.onDown.remove(this.fly, this);
    // 停止管道生成定时器
    game.time.events.stop(true);
  };
  // 小鸟飞行（点击事件）
  this.fly = function () {
    this.bird.body.velocity.y = -350;
    // 小鸟角度动画
    game.add.tween(this.bird).to({ angle: -30 }, 100, null, true, 0, 0, false);
  };

  // 撞到管道
  this.hitPipe = function () {
    if (this.gameIsOver) return;
    // 撞击音效
    this.soundHitPipe.play();
    setTimeout(() => {
      // 下坠音效
      this.downSound.play();
      setTimeout(() => {
        this.downSound.stop();
      }, 1000);
    }, 200);

    this.gameOver();
  };
  // 撞到地面
  this.hitGround = function () {
    if (this.hasHitGround) return;
    this.hasHitGround = true;
    // 碰到地面后禁止再往下掉
    this.bird.y = this.ground.y - this.bird.height / 2;
    this.bird.body.velocity.y = 0;
    this.bird.body.gravity.y = 0;
    this.gameOver(true);
  };
  // 游戏结束处理
  this.gameOver = function (over) {
    this.gameIsOver = true;
    this.stopGame();
    if (over) this.showGameOverText();
  };
  // 显示游戏结束界面
  this.showGameOverText = function () {
    if (score >= successScore) {
      // 达到成功分数，显示成功界面
      isGameOver = true;
      document
        .querySelector(".game-success-container")
        .classList.remove("hidden");

      var successDom = document.querySelector(".success");
      var className = "success-1";
      // 有两次抽奖机会
      if (score >= 125) className = "success-2";
      // 有三次抽奖机会
      if (score >= 225) className = "success-3";
      successDom.classList.add(className);

      document.getElementById("scoreNum").innerText = score;
      return;
    } else {
      // 没有达到成功分数，判断是否还有机会
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
  };
  // 复用死亡的管道，减少内存消耗
  this.resetPipe = function (topPipeY, bottomPipeY) {
    var i = 0;
    this.pipeGroup.forEachDead(function (pipe) {
      if (pipe.y <= 200) {
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
  // 检查是否得分
  this.checkScore = function (pipe) {
    // 只对上管道计分，且小鸟通过管道时加分, 上管道的y>=120, 但是也会很大, 就给个200作为一个参考值
    if (!pipe.hasScored && pipe.y <= 200 && this.bird.x >= pipe.x + 160) {
      pipe.hasScored = true;
      // 得分
      scoreDom.innerText = ++score;
      // 当前关卡
      var nextLevel = Math.floor(score / nextLevelScore) + 1;
      if (nextLevel > level) {
        level = nextLevel;
        this.levelUp(level);
      }
      levelDom.innerHTML = level;
      return true;
    }
    return false;
  };

  // 打开调试
  // this.render = function () {
  //   game.debug.body(this.bird);
  //   this.pipeGroup.forEach(function (obstacle) {
  //     game.debug.body(obstacle);
  //   });
  // };
};

// 注册主状态到游戏
game.state.add("main", main);
