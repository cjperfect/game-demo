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
var game;
window.onload = function () {
  // 格子数量
  var blockNum = 20;
  // 进度条长度比例
  var currentProgress = 99;
  // 游戏总时长
  var totalTime = 30;
  // 防止在两张卡正在判定时继续点击
  var lock = false;

  /* ---------------------- 资源加载状态 loaderState ---------------------- */
  var loaderState = function (game) {
    this.preload = function () {
      // 加载主要游戏资源
      game.load.image("bg", "assets/bg.png");
      game.load.image("block", "assets/block.png");
      game.load.spritesheet("card", "./assets/card.png", 800 / 5, 360 / 2, 10);

      // 实时更新加载进度
      game.load.onFileComplete.add(function (progress) {
        if (progress === 100) {
          game.state.start("main");
        }
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

    // 进度条DOM
    var progressDom = document.querySelector(".game-progress-line");

    this.create = function () {
      // --- 添加背景 ---
      var bg = game.add.image(0, 0, "bg");
      bg.width = game.width;
      bg.height = game.height;

      // 创建20个block
      for (var i = 0; i < blockNum; i++) {
        block[i] = game.add.sprite(0, 0, "block");
        block[i].inputEnabled = true;
        block[i].tint = 0xffffff; //778899
        block[i].index = i; // 记录自己的编号
        block[i].anchor.set(0.5); // ✅新增
      }

      // 按 4x5 排列（每行4个，共5行）
      for (var i = 0; i < block.length; i++) {
        var col = i % 4; // 列号（0~3）
        var row = Math.floor(i / 4); // 行号（0~4）
        const spacing = 10;
        block[i].x = col * (block[i].width + spacing) + 120;
        block[i].y = row * (block[i].height + spacing) + 440;
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
        card[i].anchor.set(0.5); // ✅新增
        block[i].card = card[i];

        // --- 添加flag文字，用于调试 ---
        var text = game.add.text(
          block[i].x + block[i].width / 2 - 90,
          block[i].y + block[i].height / 2 - 90,
          block[i].flag,
          {
            font: "48px",
          }
        );
        text.anchor.set(0.5); // 居中显示
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
              if (sec == 1) {
                console.log("通关了");
                this.gameOver(true);
              }
            },
            this
          );
        }
      }

      // deltaTime：每帧间隔（秒）
      var deltaTime = game.time.elapsedMS / 1000;

      // 每帧减少一点
      currentProgress -= (currentProgress / totalTime) * deltaTime + 0.01;

      if (currentProgress <= 0) {
        currentProgress = 0;
        console.log("⏰ 时间到，游戏结束！");
        this.gameOver(false);
      }

      // 更新进度条
      progressDom.style.setProperty("--progress", currentProgress + "%");
    };

    this.gameOver = function (isSuccess) {
      // 音乐暂停
      document.querySelector(".music-flag").classList.remove("music-open");

      // isSuccess 是否通关
      if (isSuccess) {
        document.querySelector(".game-success-container").classList.remove("hidden");
        document.getElementById("scoreNum").innerText = score;
        return;
      } else {
        // 没有通关, 判断是否还有机会
        var times = getQueryVariable("times");
        if (times > 0) {
          document.querySelector(".game-over-container-times").classList.remove("hidden");
        } else {
          document.querySelector(".game-over-container-no-times").classList.remove("hidden");
        }
      }
    };

    // 翻牌动画（保持原有中心缩放）
    function flipCard(cardSprite, onComplete) {
      if (!cardSprite) {
        if (onComplete) onComplete();
        return;
      }

      // 确保中心为锚点
      cardSprite.anchor.set(0.5);

      game.add
        .tween(cardSprite.scale)
        .to({ x: 0 }, 140, Phaser.Easing.Linear.None, true)
        .onComplete.add(function () {
          // 切换显隐（正反面）
          cardSprite.alpha = cardSprite.alpha === 0 ? 1 : 0;

          game.add
            .tween(cardSprite.scale)
            .to({ x: 1 }, 140, Phaser.Easing.Linear.None, true)
            .onComplete.add(function () {
              if (onComplete) onComplete();
            });
        });
    }

    // 点击方块时触发
    function onDown(block) {
      // 如果正在处理两张牌的判定，忽略点击
      if (lock) return;
      if (!block || !block.card) return;

      // 如果已经匹配成功，不允许点击
      if (block.card.isMatched || block.tint === 0xff7777) return;

      // 如果当前卡已翻开，也不允许重复翻
      if (block.card.isFlipped) return;

      // 第一张没被选则记录为 first
      if (!bpre) {
        lock = true;
        // 翻开第一张，翻完解除锁（允许点击第二张）
        flipCard(block.card, function () {
          block.card.isFlipped = true;
          bpre = block; // 记录第一张 block
          lock = false;
        });
        return;
      }

      // 第二张
      // 防止点同一张两次
      if (bpre === block) return;

      // 立刻锁定，防止点击第三张
      lock = true;
      // 保存本次需要的局部引用，避免后续 bpre/bcur 被修改造成 undefined
      var firstBlock = bpre;
      var secondBlock = block;
      var firstCard = firstBlock.card;
      var secondCard = secondBlock.card;

      // 翻开第二张，回调中判断匹配
      flipCard(secondCard, function () {
        secondCard.isFlipped = true;

        // 匹配成功
        if (firstBlock.flag === secondBlock.flag) {
          // 标记为 matched，保持明牌并禁用点击
          firstCard.isMatched = true;
          secondCard.isMatched = true;
          firstBlock.tint = 0xff7777;
          secondBlock.tint = 0xff7777;
          firstBlock.inputEnabled = false;
          secondBlock.inputEnabled = false;

          // 清除记录并解除锁
          bpre = null;
          lock = false;
        } else {
          // 未匹配：延迟翻回（使用局部引用，安全）
          game.time.events.add(
            300,
            function () {
              // 再次防护检查
              if (firstCard) {
                flipCard(firstCard, function () {
                  firstCard.isFlipped = false;
                });
              }
              if (secondCard) {
                flipCard(secondCard, function () {
                  secondCard.isFlipped = false;
                });
              }
              bpre = null;
              lock = false;
            },
            this
          );
        }
      });

      // 记录当前为 bcur（可选）
      bcur = block;
    }
  };

  /* ---------------------- 游戏实例化与状态注册 ---------------------- */
  game = new Phaser.Game(750, 1661, Phaser.CANVAS, "gameCanvas", null, true);
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
