onload = function () {
  // 定义全局变量

  /* ---------------------- 资源加载状态 loaderState ---------------------- */
  var loaderState = function (game) {
    this.preload = function () {
      // 加载主要游戏资源
      game.load.image("bg", "assets/bg.png");
      game.load.image("block", "assets/block.png");
      game.load.spritesheet("card", "./assets/card.png", 800 / 5, 360 / 2, 10);

      // 实时更新加载进度
      game.load.onFileComplete.add(function (progress) {
        game.state.start("main");
      });
    };
  };

  /* ---------------------- 主游戏逻辑状态 gameState ---------------------- */
  var times = 0; // 点击次数（用于判断是否为第一张或第二张牌）
  var bpre, bcur; // 记录前一张与当前选中方块
  var pre = -1,
    cur = -1;

  var gameState = function (game) {
    this.init = function () {
      // 居中对齐
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };

    var block = []; // 实际方块对象
    var card = []; // 卡片图层
    var stime = 0; // 游戏用时（秒）

    this.create = function () {
      // --- 添加背景 ---
      var bg = game.add.image(0, 0, "bg");
      bg.width = game.width;
      bg.height = game.height;

      // 创建20个block
      for (var i = 0; i < 20; i++) {
        block[i] = game.add.sprite(0, 0, "block");
        block[i].inputEnabled = true;
        block[i].tint = 0xffffff; //778899
      }


      // 按 4x5 排列（每行4个，共5行）
      for (var i = 0; i < block.length; i++) {
        var col = i % 4; // 列号（0~3）
        var row = Math.floor(i / 4); // 行号（0~4）
        const spacing = 10;
        block[i].x = col * (block[i].width + spacing) + 40;
        block[i].y = row * (block[i].height + spacing) + 300;
      }

      // 随机打乱顺序并分配 flag（前 8 对）
      var x = 0,
        y = 0,
        r = 0,
        d = 0;
      for (var i = 0; i < block.length; i++) {
        block[i].flag = i % 10; // 0~9 对应10对卡片

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
        card[i].alpha = 0; // 默认可见
      }
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
              // if (sec == 1) game.state.start("gameover");
            },
            this
          );
        }
      }

      // 每秒计时逻辑
      // var t = 0;
      // game.time.events.loop(
      //   Phaser.Timer.SECOND,
      //   function () {
      //     t += 1;
      //     stime = t;

      // 根据用时赋予称号
      // if (t <= 10) str = "速记能手";
      // else if ((t > 10) & (t < 20)) str = "眼力达人";
      // else str = "无名小卒";

      // 计时条走完则失败
      // if (timing.width <= 0) {
      //   timing.kill();
      //   str = "出师未捷";
      //   stime = 0;
      // game.state.start("gameover");
      // }
      //   },
      //   this
      // );

      // 每帧缩短计时条
      // timing.width -= 0.1;
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

  /* ---------------------- 游戏实例化与状态注册 ---------------------- */
  var game = new Phaser.Game(750, 1661, Phaser.CANVAS, "gameCanvas");
  game.state.add("loader", loaderState);
  game.state.add("main", gameState);
  game.state.start("loader"); // 启动流程从 boot 开始
};

/* ---------------------- 随机数函数 ---------------------- */
// 生成 Min~Max 的随机整数
function GetRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return Min + Math.round(Rand * Range);
}
