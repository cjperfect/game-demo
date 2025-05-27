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
    if (!game.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    } else {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }

    // 加载游戏资源
    this.load.image("ground", "assets/imgs/ground.png");
    this.load.spritesheet("ball", "assets/imgs/balls.png", 32, 32);
    this.load.spritesheet("ball2", "assets/imgs/balls2.png", 48, 48);
    this.load.spritesheet("button", "assets/imgs/buttons.png", 80, 40);
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
    game.add.tileSprite(0, 0, game.width, 60, "ground").alpha = 0.5;

    // 创建中心球(发射点)
    var home = game.add.sprite(game.world.centerX, 30, "ball", 3);
    home.anchor.setTo(0.5);
    home.scale.setTo(1.2);
    home.update = function () {
      this.alpha = !_over && !_going ? 1 : 0.5;
    };

    // 创建分数显示文本
    var scoreText = game.add.text(10, 30, _score + "", {
      fontSize: "20px",
      fill: "#fff",
      stroke: "#000", // 添加描边提高清晰度
      strokeThickness: 2, // 描边粗细
    });
    scoreText.anchor.setTo(0, 0.5);
    scoreText.update = function () {
      this.text = _score;
    };

    // 创建剩余球数显示文本
    var levelText = game.add.text(game.width - 10, 30, _ballNum + "", {
      fontSize: "20px",
      fill: "#fff",
      stroke: "#000", // 添加描边提高清晰度
      strokeThickness: 2, // 描边粗细
    });
    levelText.anchor.setTo(1, 0.5);
    levelText.update = function () {
      this.text = _ballNum;
    };

    // 初始化对象组
    shapes = game.add.physicsGroup(Phaser.Physics.P2JS);
    balls = game.add.physicsGroup(Phaser.Physics.P2JS);

    // 创建地面
    var ground = game.add.tileSprite(
      game.world.centerX,
      game.height - 30,
      game.width,
      60,
      "ground"
    );
    game.physics.p2.enable(ground);
    ground.body.static = true; // 设置为静态物体

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

    // 创建关卡升级动画文本
    tweenText = game.add.text(0, 0, "", {
      fontSize: "36px",
      fill: "#fff",
      stroke: "#000", // 添加描边提高清晰度
      strokeThickness: 4, // 描边粗细
    });
    tweenText.anchor.setTo(0.5);
    tweenText.alpha = 0;

    // 创建瞄准线
    line = game.add.tileSprite(
      game.world.centerX,
      30,
      game.world.centerX,
      16,
      "dot"
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
        line.rotation = Math.atan2(p.y - 20, p.x - 225);
        line.visible = true;
      }
    }, this);

    // 鼠标/触摸释放事件
    game.input.onUp.add(function (p) {
      if (_holding && p.id == _pointID) {
        _holding = false;
        _pointID = -1;
        _going = true;
        line.visible = false;

        // 计算发射速度向量
        var vPoint = this._velocityFromRotation(line.rotation, 800);

        // 依次发射球(间隔200ms)
        for (var i = 0; i < _ballNum; i++) {
          game.time.events.add(
            200 * i,
            function (id, p) {
              // 重用或创建新球
              if (id < balls.children.length) {
                var ball = balls.getChildAt(id);
                ball.reset(game.world.centerX, 30);
              } else {
                var ball = balls.create(game.world.centerX, 30, "ball", 0);
                ball.anchor.set(0.5);
                ball.scale.set(0.7);
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
              }
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
      line.rotation = Math.atan2(p.y - 20, p.x - 225);
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
      if (topY < 60 && !_over) {
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
    // 每10行升一级
    if (_xrow == 0) {
      this._levelUp();
    }

    // 计算当前行形状数量(5或4个，交错排列)
    var col = 5 - (_xrow % 2);

    // 创建形状
    for (var j = 0; j < col; j++) {
      var shapeID = game.rnd.between(1, 3); // 随机形状类型
      var angle = game.rnd.between(0, 11) * 30; // 随机角度

      // 获取或创建形状对象
      var shape = shapes.getFirstDead(
        true,
        65 + j * 90 + 45 * (_xrow % 2), // X位置(交错排列)
        300 + i * 90, // Y位置
        "ball2",
        shapeID
      );
      shape.anchor.set(0.5);

      // 根据形状类型设置碰撞体
      if (shapeID == 1) {
        shape.body.setRectangle(44, 44, 0, 0); // 矩形
      } else if (shapeID == 3) {
        shape.body.addPolygon(
          // 多边形
          null,
          [23, 0, 0, 39, 1, 40, 46, 40, 47, 39, 24, 0]
        );
      } else {
        shape.body.setCircle(22); // 圆形
      }

      shape.body.static = true; // 静态物体
      shape.body.setMaterial(worldMaterial);
      shape.health = game.rnd.between(_ballNum, _ballNum * 4); // 随机生命值

      // 为形状添加生命值文本
      if (!shape.txt) {
        shape.txt = shape.addChild(
          game.make.text(0, 0, shape.health + "", {
            fontSize: "20px",
            fill: "#f00",
            stroke: "#000", // 添加描边提高清晰度
            strokeThickness: 1, // 描边粗细
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

      shape.body.angle = angle; // 设置角度
      shape.txt.angle = -angle; // 文本反向旋转保持可读
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
    tweenText.x = this.world.centerX;
    tweenText.y = this.world.centerY;
    tweenText.alpha = 0;
    tweenText.setText("LEVEL - " + _level);

    // 播放升级动画
    game.add
      .tween(tweenText)
      .to({ y: tweenText.y - 100, alpha: 0.8 }, 300, "Linear", false)
      .to({ y: tweenText.y - 150 }, 500, "Linear", false)
      .to({ y: tweenText.y - 250, alpha: 0 }, 300, "Linear", true);
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
};

// 创建游戏实例(500x860分辨率，使用Canvas渲染)
var game = new Phaser.Game(500, 860, Phaser.CANVAS, "", null, false, true);
// 添加游戏状态
game.state.add("main", GameState, true);
