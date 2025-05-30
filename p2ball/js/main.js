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

/**
 * 游戏主状态类
 * 管理游戏的所有状态和逻辑
 */
var GameState = function (game) {
  // 游戏状态变量
  var _over = false; // 游戏是否结束
  var _holding = false; // 是否按住准备发射
  var _going = false; // 球是否正在移动
  var _pointID = -1; // 当前触控点ID
  var _ballNum = 3; // 当前球数量
  var _ballKill = 0; // 已消失的球数
  var _xrow = 0; // 当前行数
  var _score = 0; // 当前分数
  var _level = 0; // 当前关卡
  var _startBall; // 起始球
  var _startBallShotBg; // 起始球发射后
  var boxGroup;
  var levelText;

  // 游戏对象
  var balls, shapes, line, tweenText;
  var ballMaterial, worldMaterial;

  /**
   * 初始化游戏状态
   * 重置所有游戏变量为默认值
   */
  this.init = function () {
    // 禁用平滑处理以提高清晰度
    game.stage.smoothed = false;
    game.renderer.renderSession.roundPixels = true;

    _over = false;
    _holding = false;
    _going = false;
    _pointID = -1;
    _ballNum = 3;
    _ballKill = 0;
    _xrow = 0;
    _score = 0;
    _level = 0;
  };

  /**
   * 预加载游戏资源
   * 加载游戏所需的所有图像资源
   */
  this.preload = function () {
    // 设置缩放模式
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // 设置图像渲染质量
    game.renderer.renderSession.roundPixels = true;
    game.stage.smoothed = false;

    // 加载游戏背景
    this.load.image("ground", "assets/imgs/bg.png");

    // 加载分数面板背景
    this.load.image("scorePanel", "assets/imgs/score-panel.png");

    // 加载开始球的图像
    this.load.image("ball", "assets/imgs/ball.png");

    // 加载开始球的背景
    this.load.image("startBallBg", "assets/imgs/start-ball-bg.png");

    // 加载开始球发射后的背景
    this.load.image("shotFinishBg", "assets/imgs/shot-finish-bg.png");

    // 加载待发射状态的背景
    this.load.image("pendingBg", "assets/imgs/pending-shot.png");

    this.load.spritesheet("ball2", "assets/imgs/balls2-1.png", 114, 114);

    this.load.image("dot", "assets/imgs/dot.png");

    game.load.onFileComplete.add(function (progress) {
      // 加载界面
      var loadingLine = document.querySelector(".progress-line");
      var loadingIcon = document.querySelector(".progress-icon");
      loadingLine.style.width = progress + "%";
      loadingIcon.style.left = progress - 10 + "%";

      if (progress == 100) {
        var startTimer = setTimeout(() => {
          document.querySelector(".game-loading").classList.add("hidden");
          game.state.start("runState");
          clearTimeout(startTimer);
        }, 400);
      }
    });
  };

  /**
   * 创建游戏场景
   * 初始化游戏世界和所有游戏对象
   */
  this.create = function () {
    // 初始化P2物理系统
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000; // 设置重力
    // game.physics.p2.debug = true; // 开启调试模式

    // 创建物理材质
    ballMaterial = game.physics.p2.createMaterial("ballMaterial");
    worldMaterial = game.physics.p2.createMaterial("worldMaterial");

    // 设置材质碰撞属性
    game.physics.p2.createContactMaterial(ballMaterial, worldMaterial, {
      restitution: 0.98, // 弹性系数
      friction: 0, // 摩擦力
    });

    // 球与球之间的碰撞属性
    game.physics.p2.createContactMaterial(ballMaterial, ballMaterial, {
      restitution: 0,
      friction: 0,
      stiffness: 0.00001, // 刚度
    });

    game.physics.p2.setWorldMaterial(worldMaterial);

    // 创建背景
    game.add.tileSprite(0, 0, game.width, game.height, "ground");

    // 创建碰撞地面
    var ground = game.add.tileSprite(
      game.world.centerX,
      game.height - 30,
      game.width,
      60,
      "ground"
    );
    ground.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(ground);
    ground.body.static = true; // 设置为静态物体
    ground.alpha = 0;

    // 地面碰撞检测
    ground.body.onBeginContact.add(function (b1, b2) {
      if (b1 && b1.sprite.key == "ball") {
        b1.sprite.kill();
        _ballKill++;
        if (_ballKill == _ballNum) {
          this._shapesUp(); // 所有球消失后上移形状
        }
      }
    }, this);

    // 创建分数面板背景
    game.add.tileSprite(20, 10, 712, 250, "scorePanel");

    // 创建发射球背景
    game.add.image(game.world.centerX - 55, 110, "startBallBg");

    // 创建发射球发射后背景
    _startBallShotBg = game.add.image(
      game.world.centerX - 55,
      110,
      "shotFinishBg"
    );
    _startBallShotBg.visible = false;

    // 创建中间发射球
    _startBall = game.add.image(game.world.centerX - 30, 135, "ball");
    _startBall.visible = true;

    // 待发射状态的背景
    var pendingBg = game.add.image(game.world.centerX - 28, 136, "pendingBg");
    // 默认隐藏状态
    pendingBg.visible = false;

    // 创建分数显示文本
    var scoreText = game.add.text(150, 145, _score + "", {
      fontSize: "28px",
      fill: "#926039",
    });
    scoreText.anchor.setTo(0.5);

    scoreText.update = function () {
      this.text = _score;
    };

    // 创建当前关卡文本
    levelText = game.add.text(game.world.centerX - 48, 58, "", {
      fontSize: "28px",
      fill: "#926039",
    });

    // 创建剩余球数显示文本
    var ballText = game.add.text(game.world.width - 170, 145, _ballNum + "", {
      fontSize: "28px",
      fill: "#926039",
    });
    ballText.anchor.setTo(0.5);

    ballText.update = function () {
      this.text = _ballNum;
    };

    // 初始化对象组
    shapes = game.add.physicsGroup(Phaser.Physics.P2JS);
    balls = game.add.physicsGroup(Phaser.Physics.P2JS);

    // 创建关卡升级动画文本
    boxGroup = game.add.group();
    var rect = game.add.graphics(0, 0);
    rect.beginFill("#000000", 0.8); // 蓝色、透明度 0.8
    rect.drawRoundedRect(0, 0, 220, 114, 16); // 圆角矩形
    rect.endFill();

    tweenText = game.add.text(
      boxGroup.x + boxGroup.width / 2 + 110,
      boxGroup.y + boxGroup.height / 2 + 57,
      "",
      {
        fontSize: "26px",
        fill: "#fff",
        fontWeight: "normal",
      }
    );
    tweenText.anchor.setTo(0.5);

    boxGroup.add(rect);
    boxGroup.add(tweenText);

    const dotImage = game.cache.getImage("dot"); // 你的 14x14 圆形图片
    const dotSize = 14;
    const spacing = 20;
    const tileSize = dotSize + spacing * 2; // => 64

    // 创建一个带透明间距的 tile 单元
    const bmd = game.make.bitmapData(tileSize, tileSize);
    bmd.ctx.clearRect(0, 0, tileSize, tileSize);

    // 将原图绘制到 tile 中心
    const drawX = (tileSize - dotSize) / 2;
    const drawY = (tileSize - dotSize) / 2;
    bmd.ctx.drawImage(dotImage, drawX, drawY);
    bmd.update();

    // 创建瞄准线
    line = game.add.tileSprite(
      game.world.centerX,
      145,
      game.world.centerX,
      54,
      bmd
    );
    line.anchor.setTo(0, 0.5);
    line.visible = false;

    // 创建初始形状(3行)
    for (var i = 2; i < 5; i++) {
      this._createShapes(i);
    }

    // 鼠标/触摸按下事件
    game.input.onDown.add(function (p) {
      if (!_over && !_going && !_holding) {
        _holding = true;
        _pointID = p.id;
        line.rotation = Math.atan2(p.y - 110, p.x - (game.world.centerX - 55));
        line.visible = true;
        pendingBg.visible = true;
      }
    }, this);

    // 鼠标/触摸释放事件
    game.input.onUp.add(function (p) {
      if (_holding && p.id == _pointID) {
        _holding = false;
        _pointID = -1;
        _going = true;
        line.visible = false;
        pendingBg.visible = false;
        _startBall.visible = false;
        _startBallShotBg.visible = true;

        // 计算发射速度向量
        var vPoint = this._velocityFromRotation(line.rotation, 800);

        // 依次发射球(间隔200ms)
        for (var i = 0; i < _ballNum; i++) {
          game.time.events.add(
            200 * i,
            function (id, p) {
              // 重用或创建新球
              // if (id < balls.children.length) {
              //   var ball = balls.getChildAt(id);
              //   ball.reset(game.world.centerX, 160);
              // } else {
              var ball = balls.create(game.world.centerX, 160, "ball");
              ball.anchor.set(0.5);
              ball.scale.set(0.6);
              ball.body.setCircle(12);
              ball.body.setMaterial(ballMaterial);

              // 球碰撞检测
              ball.body.onBeginContact.add(function (b1, b2) {
                if (this.body.data.gravityScale == 0) {
                  if (b1 && b1.sprite.key == "ball") {
                    return; // 忽略球与球的碰撞
                  }
                  this.body.data.gravityScale = 1; // 碰撞后启用重力
                }
              }, ball);
              // }
              ball.body.data.gravityScale = 0; // 初始无重力
              ball.body.velocity.x = p.x; // 设置X速度
              ball.body.velocity.y = p.y; // 设置Y速度
            },
            this,
            i,
            vPoint
          );
        }
        _ballKill = 0; // 重置消失球计数
      }
    }, this);
  };

  /**
   * 游戏主循环
   * 每帧调用，更新游戏状态
   */
  this.update = function () {
    // 更新瞄准线角度
    if (!_going && _holding) {
      var p =
        _pointID == 0
          ? game.input.mousePointer
          : game.input.pointers[_pointID - 1];
      line.rotation = Math.atan2(p.y - 110, p.x - (game.world.centerX - 55));
    }
  };

  /**
   * 形状上移
   * 当所有球消失后，将所有形状上移一行
   */
  this._shapesUp = function () {
    this._createShapes(5); // 创建新一行形状

    // 所有形状上移
    shapes.forEachAlive(function (shape) {
      var topY = shape.body.y - 90;
      // 检查游戏是否结束(形状到达顶部)
      if (topY < 260 && !_over) {
        _over = true;
        this._overMenu(); // 显示结束菜单
      }
      // 上移动画
      game.add.tween(shape.body).to({ y: topY }, 200, "Linear", true);
    }, this);

    _going = false; // 重置发射状态
  };

  /**
   * 创建形状行
   * @param {number} i - 行号(相对于底部)
   */
  this._createShapes = function (i) {
    _startBall.visible = true;
    _startBallShotBg.visible = false;

    // 每10行升一级
    if (_xrow == 0) {
      this._levelUp();
    }

    // 计算当前行形状数量(5或4个，交错排列)
    var col = 5 - (_xrow % 2);

    // 创建形状
    for (var j = 0; j < col; j++) {
      var shapeID = game.rnd.between(0, 6); // 随机形状类型

      // 直接创建新的形状对象
      var shape = shapes.create(
        90 + j * 140 + 45 * (_xrow % 2), // X位置(交错排列)
        game.world.centerY + i * 116, // Y位置
        "ball2",
        shapeID
      );
      // shape.anchor.set(0.5);

      var bodyMap = {
        0: () => {
          shape.body.setCircle(50); // 圆形

          // 添加圆形可视化
          const graphics0 = game.add.graphics(0, 0);
          graphics0.lineStyle(2, 0x0000ff, 1); // 蓝色线条
          graphics0.beginFill(0x0000ff, 0.2); // 半透明蓝色填充
          graphics0.drawCircle(0, 0, 50);
          graphics0.endFill();
          shape.addChild(graphics0);
        },
        1: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [0, -42, 50, 34, -50, 34]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(0, -42);
          graphics1.lineTo(50, 34);
          graphics1.lineTo(-50, 34);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
        2: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [-44, -44, 44, -44, 44, 44, -44, 44]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(-44, -44);
          graphics1.lineTo(44, -44);
          graphics1.lineTo(44, 44);
          graphics1.lineTo(-44, 44);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
        3: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [-20, -60, 60, -20, 20, 60, -60, 20]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(-20, -60);
          graphics1.lineTo(60, -20);
          graphics1.lineTo(20, 60);
          graphics1.lineTo(-60, 20);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
        4: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [10, -60, 60, 10, -10, 60, -60, -10]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(10, -60);
          graphics1.lineTo(60, 10);
          graphics1.lineTo(-10, 60);
          graphics1.lineTo(-60, -10);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
        5: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [-50, -25, 35, -45, 15, 40]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(-50, -25);
          graphics1.lineTo(35, -45);
          graphics1.lineTo(15, 40);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
        6: () => {
          shape.body.addPolygon(
            // 多边形
            null,
            [-35, -45, 45, 5, -35, 45]
          );

          // 添加多边形可视化
          const graphics1 = game.add.graphics(0, 0);
          graphics1.lineStyle(2, 0xff0000, 1);
          graphics1.beginFill(0xff0000, 0.2); // 半透明红色填充
          graphics1.moveTo(-35, -45);
          graphics1.lineTo(45, 5);
          graphics1.lineTo(-35, 45);
          graphics1.endFill();
          shape.addChild(graphics1);
        },
      };
      bodyMap[shapeID]();

      shape.body.static = true; // 静态物体
      shape.body.setMaterial(worldMaterial);
      shape.health = game.rnd.between(_ballNum, _ballNum * 4); // 随机生命值

      // 为形状添加生命值文本
      if (!shape.txt) {
        shape.txt = shape.addChild(
          game.make.text(0, 2, shape.health + "", {
            fontSize: "38px",
            fill: "#FFFFFF",
            fontWeight: "normal",
          })
        );
        shape.txt.anchor.set(0.5);

        // 更新生命值显示
        shape.update = function () {
          this.txt.text = this.health;
        };

        // 形状碰撞事件
        shape.body.onEndContact.add(function (b1, b2) {
          this.damage(1); // 减少生命值
          _score++; // 增加分数
        }, shape);
      }

      // if (shapeID != 0) {
      //   // 圆形不用旋转
      //   shape.body.angle = angle; // 设置角度
      //   shape.txt.angle = -angle; // 文本反向旋转保持可读
      // }
    }
    _xrow = (_xrow + 1) % 10; // 行数循环(0-9)
  };

  /**
   * 从角度计算速度向量
   * @param {number} rotation - 角度(弧度)
   * @param {number} speed - 速度大小
   * @return {Phaser.Point} 速度向量
   */
  this._velocityFromRotation = function (rotation, speed) {
    return new Phaser.Point(
      Math.cos(rotation) * speed,
      Math.sin(rotation) * speed
    );
  };

  /**
   * 升级关卡
   * 增加球数量并显示升级动画
   */
  this._levelUp = function () {
    _level++;
    _ballNum = _level + 2; // 每关增加1个球

    // 设置升级文本
    boxGroup.x = this.world.centerX - 110;
    boxGroup.y = game.height - 200;
    boxGroup.alpha = 0;
    tweenText.setText("进入Level " + _level);
    levelText.setText("Level " + _level);

    // 播放升级动画
    game.add
      .tween(boxGroup)
      .to({ y: boxGroup.y - 100, alpha: 0.8 }, 300, "Linear", false)
      .to({ y: boxGroup.y - 150 }, 500, "Linear", false)
      .to({ y: boxGroup.y - 250, alpha: 0 }, 300, "Linear", true);
  };

  /**
   * 显示游戏结束菜单
   * 包含重新开始按钮
   */
  this._overMenu = function () {
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
  };

  this.render = function () {
    game.world.forEach(function (child) {
      if (child.body) {
        game.debug.body(child);
      }
    });
  };
};

var game = new Phaser.Game(750, 1461, Phaser.WebGL, "gameCanvas", null, true);
// 添加游戏状态
game.state.add("main", GameState, true);
