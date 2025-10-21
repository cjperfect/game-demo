onload = function () {
  // 定义全局变量
  var startText; // “开始游戏”文本对象
  var restartText; // “重新开始”文本对象
  var welcome; // 欢迎界面背景
  var gameover; // 游戏结束背景
  var spend = 0; // 游戏用时（秒）
  var str = ""; // 玩家称号字符串

  /* ---------------------- 启动状态 bootState ---------------------- */
  // 用于加载最基础的资源（loading 图），然后进入 loaderState
  var bootState = function (game) {
    this.preload = function () {
      game.load.image("loading", "assets/preloader.gif"); // 预加载图
    };
    this.create = function () {
      game.state.start("loader"); // 跳转到加载状态
    };
  };

  /* ---------------------- 资源加载状态 loaderState ---------------------- */
  var loaderState = function (game) {
    var progressText; // 加载进度文本

    this.init = function () {
      // 显示 loading 图和进度百分比
      var sprite = game.add.image(game.world.centerX, game.world.centerY, "loading");
      sprite.anchor = { x: 0.5, y: 0.5 };
      progressText = game.add.text(game.world.centerX, game.world.centerY + 30, "0%", {
        fill: "#fff",
        fontSize: "28px",
      });
      progressText.anchor = { x: 0.5, y: 0.5 };
    };

    this.preload = function () {
      // 加载主要游戏资源
      game.load.image("welcome", "assets/background.png");
      game.load.image("gameover", "assets/background2.png");
      game.load.spritesheet("card", "./assets/card.png", 700 / 4, 787 / 3, 12);
      game.load.image("timing", "assets/timing.png");

      // 实时更新加载进度
      game.load.onFileComplete.add(function (progress) {
        progressText.text = progress + "%";
      });
    };

    this.create = function () {
      // 当加载完成后，进入欢迎界面
      if (progressText.text == "100%") {
        game.state.start("welcome");
      }
    };
  };

  /* ---------------------- 欢迎界面状态 welcomeState ---------------------- */
  var welcomeState = function (game) {
    this.init = function () {
      // 居中并等比缩放
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    this.create = function () {
      // 背景和文字
      welcome = game.add.image(0, 0, "welcome");
      welcome.width = game.world.width;
      welcome.height = game.world.height;
      startText = game.add.text(game.world.centerX, game.world.centerY, "Click anywhere on the screen to start", {
        fill: "#fff",
        fontSize: "28px",
      });
      startText.anchor = { x: 0.5, y: 0.5 };

      // 点击一次后进入主游戏状态
      game.input.onDown.addOnce(Down, this);
    };
  };

  /* ---------------------- 游戏结束状态 gameoverState ---------------------- */
  var gameoverState = function (game) {
    this.create = function () {
      // 背景
      gameover = game.add.image(0, 0, "gameover");

      // 重新开始提示
      restartText = game.add.text(game.world.centerX, game.world.centerY, "Click anywhere on the screen to restart", {
        fill: "#fff",
        fontSize: "16px",
      });
      restartText.anchor = { x: 0.5, y: 0.5 };

      // 显示游戏用时和称号
      var Text = game.add.text(0, 0, "游戏成绩: " + spend + "秒", { fill: "#DC143C", fontSize: "21px" });
      Text.x = game.world.centerX - Text.width / 2;
      Text.y = game.world.centerY + Text.height * 1.5;

      var Text2 = game.add.text(0, 0, "获得称号: " + str, { fill: "#DC143C", fontSize: "21px" });
      Text2.x = game.world.centerX - Text2.width / 2;
      Text2.y = game.world.centerY + Text2.height * 3;

      // 点击任意处重新开始
      game.input.onDown.addOnce(reDown, this);
    };
  };

  /* ---------------------- 主游戏逻辑状态 gameState ---------------------- */
  var times = 0; // 点击次数（用于判断是否为第一张或第二张牌）
  var bpre, bcur; // 记录前一张与当前选中方块
  var pre = -1,
    cur = -1;
  var timing; // 计时条

  var gameState = function (game) {
    this.init = function () {
      // 居中对齐
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    var bmd = []; // bitmap 数据（用于绘制灰色方块）
    var block = []; // 实际方块对象
    var card = []; // 卡片图层
    var stime = 0; // 游戏用时（秒）

    this.create = function () {
      // 计算单格大小（4x4 格）
      var width = game.world.width / 4;
      var height = game.world.height / 4;

      // 创建 16 个方块的底图
      for (var i = 0; i < 16; i++) {
        bmd[i] = game.add.bitmapData(width, height);
        bmd[i].ctx.beginPath();
        bmd[i].ctx.rect(0, 0, width, height);
        bmd[i].ctx.strokeStyle = "red";
        bmd[i].ctx.strokeRect(0, 0, width, height);
        bmd[i].ctx.fillStyle = "dimgray";
      }

      // 将 bitmap 转换为 Sprite 并启用点击
      for (var i = 0; i < bmd.length; i++) {
        bmd[i].ctx.fill();
        bmd[i].ctx.stroke();
        block[i] = game.add.sprite(0, 0, bmd[i]);
        block[i].inputEnabled = true;
        block[i].tint = 0xffffff; // 默认白色
      }

      // 按 4x4 排列
      for (var i = 1; i < block.length; i++) {
        if (i % 4 == 0) {
          block[i].x = block[0].x;
          block[i].y = block[i - 1].y + block[i - 1].height;
        } else {
          block[i].x = block[i - 1].x + block[i - 1].width;
          block[i].y = block[i - 1].y;
        }
      }

      // 随机打乱顺序并分配 flag（前 8 对）
      var x = 0,
        y = 0,
        r = 0,
        d = 0;
      for (var i = 0; i < block.length; i++) {
        if (i < 8) block[i].flag = i;
        if (i > 7) block[i].flag = i - 8;

        r = GetRandomNum(i, block.length - 1);
        d = GetRandomNum(i, block.length - 1);
        x = block[d].x;
        y = block[d].y;
        block[d].x = block[r].x;
        block[d].y = block[r].y;
        block[r].x = x;
        block[r].y = y;
      }

      // 为每个 block 创建对应的卡片
      for (var i = 0; i < block.length; i++) {
        card[i] = game.add.sprite(block[i].x, block[i].y, "card");
        card[i].frame = block[i].flag;
        card[i].alpha = 1; // 默认可见
      }

      // 创建顶部计时条
      timing = game.add.sprite(0, 0, "timing");
      timing.x = game.world.centerX - timing.width / 2;
      timing.y = timing.height;
    };

    this.update = function () {
      // 绑定点击事件
      for (var i = 0; i < block.length; i++) {
        block[i].events.onInputDown.add(onDown, this);
      }

      // 检测是否全部匹配完成
      var j = 0;
      for (var i = 0; i < block.length; i++) {
        if (block[i].tint == 0xff7777) j++;
        if (j == block.length) {
          spend = stime;
          var sec = 0;
          game.time.events.loop(
            Phaser.Timer.SECOND,
            function () {
              sec += 1;
              if (sec == 1) game.state.start("gameover");
            },
            this
          );
        }
      }

      // 每秒计时逻辑
      var t = 0;
      game.time.events.loop(
        Phaser.Timer.SECOND,
        function () {
          t += 1;
          stime = t;

          // 根据用时赋予称号
          if (t <= 10) str = "速记能手";
          else if ((t > 10) & (t < 20)) str = "眼力达人";
          else str = "无名小卒";

          // 计时条走完则失败
          if (timing.width <= 0) {
            timing.kill();
            str = "出师未捷";
            stime = 0;
            game.state.start("gameover");
          }
        },
        this
      );

      // 每帧缩短计时条
      timing.width -= 0.1;
    };

    // 点击方块时触发
    function onDown(block) {
      for (var i = 0; i < 16; i++) {
        card[i].alpha = 0;
        if ((block.x == card[i].x) & (block.y == card[i].y)) {
          card[i].alpha = 1; // 翻开对应卡片
        }
      }

      times += 1;

      // 判断是否为第二次点击（成对匹配）
      if (times % 2 == 1) {
        cur = block.flag;
        bcur = block;
      } else {
        pre = cur;
        bpre = bcur;
        cur = block.flag;
        bcur = block;

        // 如果两张牌匹配成功
        if (pre == cur) {
          if (bpre == bcur) return;
          block.flag = "";
          bpre.tint = 0xff7777;
          block.tint = 0xff7777;
          bpre.inputEnabled = false;
          block.inputEnabled = false;

          // 翻回所有卡片（隐藏）
          for (var i = 0; i < 16; i++) {
            card[i].alpha = 0;
          }
        }
      }
    }
  };

  /* ---------------------- 状态切换的辅助函数 ---------------------- */
  function Down() {
    startText.destroy();
    game.state.start("main"); // 进入主游戏
  }

  function reDown() {
    restartText.destroy();
    game.state.start("main"); // 重新开始
  }

  /* ---------------------- 游戏实例化与状态注册 ---------------------- */
  var game = new Phaser.Game(750, 1661, Phaser.CANVAS, "gameCanvas");
  game.state.add("boot", bootState);
  game.state.add("loader", loaderState);
  game.state.add("welcome", welcomeState);
  game.state.add("main", gameState);
  game.state.add("gameover", gameoverState);
  game.state.start("boot"); // 启动流程从 boot 开始
};

/* ---------------------- 随机数函数 ---------------------- */
// 生成 Min~Max 的随机整数
function GetRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return Min + Math.round(Rand * Range);
}
