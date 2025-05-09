var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, "");

// 场景一 预先加载
var bootState = function (game) {
  this.preload = function () {};
  this.create = function () {
    //在第一个场景运行好之后，启动第二个场景
    game.state.start("loader");
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  };
};

// 场景二 LOADING
var loaderState = function (game) {
  var loadImg;
  this.init = function () {
    loadImg = game.add.sprite(game.world.centerX - 10, game.world.centerY - 40, "loadImg");
    loadImg.anchor.set(0.5, 0.5);
    loadImg.animations.add("loadImg_away", [0, 1, 2, 3, 4]);
    loadImg.play("loadImg_away", 10, true);
  };
  this.preload = function () {
    // 背景动画
    game.load.atlasXML("bg_sprites", "assets/bg/sprites.png", "assets/bg/sprites.xml");
    // 船动画
    game.load.atlasXML("running", "assets/boat/sprites.png", "assets/boat/sprites.xml");
    // 游戏背景
    // game.load.image("bg_sy", "assets/bg_sy.png");
    // 碰撞物资源加载
    game.load.atlasXML("obstacle", "assets/obstacle/sprites.png", "assets/obstacle/sprites.xml");
    game.load.onFileComplete.add(function (progress) {
      if (progress == 100) {
        game.state.start("jmBgState");
      }
    });
  };
};

// 场景3
var jmBgState = function (game) {
  var bgsy;

  this.init = function () {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  };
  this.create = function () {
    game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
    bgsy = game.add.image(0, 0, "bg_sy");
    bgsy.scale.set(0.7);
    game.state.start("runState");
  };
  this.update = function () {};
};

// 场景4 开跑！
var runState = function (game) {
  var emitter;
  var emitterLeft;
  var emitterRight;
  var bgrunning;
  var runningMan;
  var progressTextScore;
  var score = 0;
  var timeText = 60; //默认时间
  var obstacles;
  var obstacleTimer = 0;

  // 用于记录上次碰撞的时间戳
  var lastCollisionTime = 0;
  // 定义三条跑道的X坐标（在变量范围内全局设置）
  var leftLane = 70;
  var middleLane = 140;
  var rightLane = 210;

  this.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, window.innerWidth, window.innerhei);

    //运动背景
    bg_sprites = game.add.sprite(0, 0, "bg_sprites");
    bg_sprites.width = game.width;
    bg_sprites.height = game.height;
    bgrunning = bg_sprites.animations.add("qs_walk_away", [0, 1, 2, 3, 4]);
    bgrunning.play(10, true);

    //跑男
    running = game.add.sprite(140, window.innerHeight / 2, "running");
    runningMan = running.animations.add("running_away", [0, 1, 2]);
    runningMan.play(10, true);
    running.scale.set(0.26);

    // 确保初始位置在中间跑道
    running.x = middleLane;

    var pointer = game.input.activePointer;
    game.input.onUp.add(function () {
      var newPointer = game.input.activePointer;
      if (newPointer.position.x > running.x && running.x < rightLane && newPointer.position.y > running.y) {
        // 向右移动一条跑道
        if (running.x == leftLane) {
          running.x = middleLane;
        } else if (running.x == middleLane) {
          running.x = rightLane;
        }
      } else if (newPointer.position.x < running.x && running.x > leftLane && newPointer.position.y > running.y) {
        // 向左移动一条跑道
        if (running.x == rightLane) {
          running.x = middleLane;
        } else if (running.x == middleLane) {
          running.x = leftLane;
        }
      }
    });

    // 创建障碍物组
    obstacles = game.add.group();
    obstacles.enableBody = true;
    obstacles.physicsBodyType = Phaser.Physics.ARCADE;

    var graphics = game.add.graphics(0, 0);
    graphics.beginFill(0xffffff, 1); // 红色，不透明
    // 画一个矩形（x, y, 宽, 高）
    var rectX = 32;
    var rectY = 32;
    var rectWidth = 136;
    var rectHeight = 30;
    graphics.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 20);

    graphics.endFill();

    progressTextScore = game.add.text(30, 30, "得分： " + score, { fill: "#596061", fontSize: "12px" });
    progressTextScore.font = "PingFangSC, PingFang SC";
    // 设置文字居中对齐
    progressTextScore.anchor.set(0.5);

    game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

    // 添加检测碰撞的定时器，每秒30次
    // game.time.events.loop(Phaser.Timer.SECOND / 30, checkCollisions, this);

    function updateCounter() {
      if (timeText > 0) {
        timeText--;
        console.log("updateCounter", score);
        progressTextScore.text = "得分：" + score;
      }
      if (timeText == 0) {
        bgrunning.loop = false;
        runningMan.loop = false;
        emitter1.kill();
        emitter.kill();
        emitterLeft1.kill();
        emitterLeft.kill();
        emitterRight1.kill();
        emitterRight.kill();
        progressTextScore.text = "得分：" + score;
        var stopBg = game.add.image(30, 150, "stopBg");
        stopBg.scale.set(1.2);
        var stopTextSmall = game.add.text(70, 190, "恭喜你本次得分为", { fill: "#414141", fontSize: "20px" });
        stopTextSmall.font = "微软雅黑";
        var stopTextBigScore = game.add.text(90, 220, score, { fill: "#414141", fontSize: "150px" });
        game.add.button(
          50,
          370,
          "stopBtn",
          function () {
            //游戏暂停，alert分数
            alert("我被点击了，分数：" + score + "，去发ajax吧！");
          },
          game
        );
      }
    }
  };

  // 重写的碰撞检测函数
  // function checkCollisions() {
  //   // 获取当前时间
  //   var currentTime = new Date().getTime();

  //   // 玩家碰撞区域
  //   var playerHitbox = {
  //     x: running.x, // 中心点X
  //     y: running.y, // 中心点Y
  //     width: 50, // 宽度
  //     height: 80, // 高度
  //   };

  //   // 玩家碰撞框的边界（用于检测）
  //   var playerLeft = playerHitbox.x - playerHitbox.width / 2;
  //   var playerRight = playerHitbox.x + playerHitbox.width / 2;
  //   var playerTop = playerHitbox.y - playerHitbox.height / 2;
  //   var playerBottom = playerHitbox.y + playerHitbox.height / 2;

  //   // 遍历所有发射器
  //   for (var i = 0; i < allEmitters.length; i++) {
  //     var currentEmitter = allEmitters[i];
  //     var activeCount = 0;

  //     // 遍历发射器的所有子元素（粒子）
  //     if (currentEmitter && currentEmitter.children) {
  //       for (var j = 0; j < currentEmitter.children.length; j++) {
  //         var particle = currentEmitter.children[j];

  //         // 只处理活跃的粒子
  //         if (particle && particle.alive) {
  //           activeCount++;

  //           // 粒子碰撞区域
  //           var particleHitbox = {
  //             x: particle.x, // 中心点X
  //             y: particle.y, // 中心点Y
  //             width: 40, // 宽度
  //             height: 40, // 高度
  //           };

  //           // 粒子碰撞框的边界
  //           var particleLeft = particleHitbox.x - particleHitbox.width / 2;
  //           var particleRight = particleHitbox.x + particleHitbox.width / 2;
  //           var particleTop = particleHitbox.y - particleHitbox.height / 2;
  //           var particleBottom = particleHitbox.y + particleHitbox.height / 2;

  //           // 碰撞检测 - 矩形相交法
  //           var collided = !(
  //             playerRight < particleLeft ||
  //             playerLeft > particleRight ||
  //             playerBottom < particleTop ||
  //             playerTop > particleBottom
  //           );

  //           // 限制碰撞频率 - 粒子必须在可见区域才能触发碰撞
  //           var validYRange = particle.y > 50 && particle.y < 300;

  //           // 如果发生碰撞并且时间间隔足够（至少500毫秒）
  //           if (collided && validYRange && currentTime - lastCollisionTime > 500) {
  //             lastCollisionTime = currentTime;

  //             console.log("碰撞! 类型:", currentEmitter.particleType, "跑道:", currentEmitter.lane);

  //             // 根据粒子类型更新分数
  //             if (currentEmitter.particleType == "tree") {
  //               // 撞到树木扣5分
  //               score -= 5;
  //               console.log("撞到树木，扣5分！当前分数:", score);
  //             } else {
  //               // 收集金币加5分
  //               score += 5;
  //               console.log("收集金币，加5分！当前分数:", score);
  //             }

  //             // 更新分数显示
  //             progressTextScore.text = "得分：" + score;

  //             // 移除粒子
  //             particle.kill();
  //             break; // 一次只处理一个碰撞
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  this.update = function () {
    // 空实现 - 碰撞检测已移至checkCollisions函数
    // 碰撞检测：如果玩家与障碍物发生碰撞，会自动停止玩家运动（物理引擎处理）
    game.physics.arcade.collide(running, obstacles);
    // 每 1 秒生成一个障碍物
    if (game.time.now > obstacleTimer) {
      var xArr = [70, 140, 210];

      var x = xArr[Math.floor(Math.random() * xArr.length)];
      // 随机位置
      var y = game.rnd.between(-300, game.world.height / 2);
      createObstacle(x, y);
      obstacleTimer = game.time.now + 2000; // 下一次生成的时间点
    }

    // 删除已经离开屏幕的障碍物
    obstacles.forEachAlive(function (obstacle) {
      if (obstacle.x < -obstacle.width) {
        obstacle.kill(); // 回收
      }
    });
  };

  function createObstacle(x, y) {
    // 创建一个障碍物精灵
    var obstacle = obstacles.getFirstDead();
    if (!obstacle) {
      obstacle = obstacles.create(x, y, "obstacle", [0, 1, 2]);

      obstacle.width = 360;
      obstacle.height = 360;
      obstacle.scale.set(0.3);
    } else {
      obstacle.reset(game.width, game.rnd.between(50, 250));
    }

    // 设置速度
    obstacle.body.velocity.y = 120;
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true; // 离开屏幕自动 kill
  }
};

game.state.add("boot", bootState);
game.state.add("loader", loaderState);
game.state.add("jmBgState", jmBgState);
game.state.add("runState", runState);
game.state.start("boot"); //启动第一个场景
