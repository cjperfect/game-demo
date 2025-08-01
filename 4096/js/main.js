var offsetY = 115;
var game;
var gameOptions = {
  tileSize: 166,
  tweenSpeed: 50,
  tileSpacing: 10,
  localStorageName: "top4096score", //4096 增加储存分数变量
};
var ROW = 0;
var COL = 1; //4096 分别用于定位行和列的常量
// 窗口第一次加载
window.onload = function () {
  var gameConfig = {
    type: Phaser.CANVAS,
    width: 750,
    height: 1660,
    backgroundColor: 0xecf0f1,
    scene: [preloadAssets, playGame],
  };
  game = new Phaser.Game(gameConfig);
};

var preloadAssets = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function preloadAssets() {
    Phaser.Scene.call(this, { key: "PreloadAssets" });
  },
  // 预加载 各种资源
  preload: function () {
    this.load.image("bg", "assets/bg.png");
    this.load.image("spot", "assets/spot.png");
    this.load.image("gridBg", "assets/grid-bg.png");
    this.load.image("restart", "assets/restart.png");
    this.load.spritesheet("tiles", "assets/tiles.png", {
      frameWidth: gameOptions.tileSize,
      frameHeight: gameOptions.tileSize,
    });
  },
  create: function () {
    this.scene.start("PlayGame");
  },
});

var playGame = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function playGame() {
    Phaser.Scene.call(this, { key: "PlayGame" });
  },
  // 游戏开始运行
  create: function () {
    this.fieldArray = [];
    this.fieldGroup = this.add.group();
    this.score = 0; //4096 增加得分
    this.bestScore =
      localStorage.getItem(gameOptions.localStorageName) == null
        ? 0
        : localStorage.getItem(gameOptions.localStorageName);
    // 目前最高分数
    document.querySelector(".best-score-num").innerHTML = this.bestScore;
    // 归零当前分数
    document.querySelector(".score-num").innerHTML = 0;

    // 添加全屏背景图片
    this.bgImage = this.add.image(game.config.width / 2, game.config.height / 2, "bg");

    // 缩放背景图以适应屏幕大小
    this.bgImage.displayWidth = game.config.width;
    this.bgImage.displayHeight = game.config.height;

    this.add.image(game.config.width / 2, game.config.height / 2 - offsetY, "gridBg");

    for (var i = 0; i < 4; i++) {
      this.fieldArray[i] = [];
      for (var j = 0; j < 4; j++) {
        var spot = this.add.sprite(this.tileDestination(j, COL), this.tileDestination(i, ROW) - offsetY, "spot");
        var tile = this.add.sprite(this.tileDestination(j, COL), this.tileDestination(i, ROW) - offsetY, "tiles");
        tile.alpha = 0;
        tile.visible = 0;
        this.fieldGroup.add(tile);
        this.fieldArray[i][j] = {
          tileValue: 0,
          tileSprite: tile,
          canUpgrade: true,
        };
      }
    }
    var restartButton = this.add.sprite(
      this.tileDestination(0, COL) + 265,
      this.tileDestination(5, ROW) - 250,
      "restart"
    );
    restartButton.setInteractive();
    restartButton.on(
      "pointerdown",
      function () {
        this.scene.start("PlayGame");
      },
      this
    );

    //键盘按下执行的操作
    this.input.keyboard.on("keydown", this.handleKey, this);
    this.canMove = false;
    this.addTile();
    this.addTile();
    //键盘放开执行的操作
    this.input.on("pointerup", this.endSwipe, this);
  },
  endSwipe: function (e) {
    var swipeTime = e.upTime - e.downTime;
    var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
    var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
    var swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
    if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)) {
      var children = this.fieldGroup.getChildren();
      if (swipeNormal.x > 0.8) {
        for (var i = 0; i < children.length; i++) {
          children[i].depth = game.config.width - children[i].x;
        }
        this.handleMove(0, 1);
      }
      if (swipeNormal.x < -0.8) {
        for (var i = 0; i < children.length; i++) {
          children[i].depth = children[i].x;
        }
        this.handleMove(0, -1);
      }
      if (swipeNormal.y > 0.8) {
        for (var i = 0; i < children.length; i++) {
          children[i].depth = game.config.height - children[i].y;
        }
        this.handleMove(1, 0);
      }
      if (swipeNormal.y < -0.8) {
        for (var i = 0; i < children.length; i++) {
          children[i].depth = children[i].y;
        }
        this.handleMove(-1, 0);
      }
    }
  },
  //随机产生一个数字2
  addTile: function () {
    var emptyTiles = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (this.fieldArray[i][j].tileValue == 0) {
          emptyTiles.push({
            row: i,
            col: j,
          });
        }
      }
    }
    if (emptyTiles.length > 0) {
      var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
      this.fieldArray[chosenTile.row][chosenTile.col].tileValue = 1;
      this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
      this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
      this.tweens.add({
        targets: [this.fieldArray[chosenTile.row][chosenTile.col].tileSprite],
        alpha: 1,
        duration: gameOptions.tweenSpeed,
        onComplete: function (tween) {
          tween.parent.scene.canMove = true;
        },
      });
    }
  },
  //确定是哪些键被按下，执行相关的操作-移动handleMove()
  handleKey: function (e) {
    if (this.canMove) {
      var children = this.fieldGroup.getChildren();
      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          for (var i = 0; i < children.length; i++) {
            children[i].depth = children[i].x;
          }
          this.handleMove(0, -1);
          break;
        case "KeyD":
        case "ArrowRight":
          for (var i = 0; i < children.length; i++) {
            children[i].depth = game.config.width - children[i].x;
          }
          this.handleMove(0, 1);
          break;
        case "KeyW":
        case "ArrowUp":
          for (var i = 0; i < children.length; i++) {
            children[i].depth = children[i].y;
          }
          this.handleMove(-1, 0);
          break;
        case "KeyS":
        case "ArrowDown":
          for (var i = 0; i < children.length; i++) {
            children[i].depth = game.config.height - children[i].y;
          }
          this.handleMove(1, 0);
          break;
      }
    }
  },
  //数字移动及合并函数
  handleMove: function (deltaRow, deltaCol) {
    this.canMove = false;
    var somethingMoved = false;
    this.movingTiles = 0;
    var moveScore = 0;
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var colToWatch = deltaCol == 1 ? 4 - 1 - j : j;
        var rowToWatch = deltaRow == 1 ? 4 - 1 - i : i;
        var tileValue = this.fieldArray[rowToWatch][colToWatch].tileValue;
        if (tileValue != 0) {
          var colSteps = deltaCol;
          var rowSteps = deltaRow;
          while (
            this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0
          ) {
            colSteps += deltaCol;
            rowSteps += deltaRow;
          }
          if (
            this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue &&
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade &&
            this.fieldArray[rowToWatch][colToWatch].canUpgrade &&
            tileValue < 12
          ) {
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue++;
            moveScore += Math.pow(2, this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue);
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
            this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
            this.moveTile(
              this.fieldArray[rowToWatch][colToWatch],
              rowToWatch + rowSteps,
              colToWatch + colSteps,
              Math.abs(rowSteps + colSteps),
              true
            );
            somethingMoved = true;
          } else {
            colSteps = colSteps - deltaCol;
            rowSteps = rowSteps - deltaRow;
            if (colSteps != 0 || rowSteps != 0) {
              this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
              this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
              this.moveTile(
                this.fieldArray[rowToWatch][colToWatch],
                rowToWatch + rowSteps,
                colToWatch + colSteps,
                Math.abs(rowSteps + colSteps),
                false
              );
              somethingMoved = true;
            }
          }
        }
      }
    }
    if (!somethingMoved) {
      this.canMove = true;
    } else {
      this.score += moveScore;
      document.querySelector(".score-num").innerHTML = this.score;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        document.querySelector(".best-score-num").innerHTML = this.bestScore;
        localStorage.setItem(gameOptions.localStorageName, this.bestScore);
      }
    }
  },
  // 数字移动的效果(动画)
  moveTile: function (tile, row, col, distance, changeNumber) {
    this.movingTiles++;
    this.tweens.add({
      targets: [tile.tileSprite],
      x: this.tileDestination(col, COL),
      y: this.tileDestination(row, ROW) - offsetY,
      duration: gameOptions.tweenSpeed * distance,
      onComplete: function (tween) {
        tween.parent.scene.movingTiles--;
        if (changeNumber) {
          tween.parent.scene.transformTile(tile, row, col);
        }
        if (tween.parent.scene.movingTiles == 0) {
          tween.parent.scene.resetTiles();
          tween.parent.scene.addTile();
        }
      },
    });
  },
  // 变化的效果(动画)
  transformTile: function (tile, row, col) {
    this.movingTiles++;
    tile.tileSprite.setFrame(this.fieldArray[row][col].tileValue - 1);
    this.tweens.add({
      targets: [tile.tileSprite],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: gameOptions.tweenSpeed,
      yoyo: true,
      repeat: 1,
      onComplete: function (tween) {
        tween.parent.scene.movingTiles--;
        if (tween.parent.scene.movingTiles == 0) {
          tween.parent.scene.resetTiles();
          tween.parent.scene.addTile();
        }
      },
    });
  },
  //重新加载图像
  resetTiles: function () {
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        this.fieldArray[i][j].canUpgrade = true;
        this.fieldArray[i][j].tileSprite.x = this.tileDestination(j, COL);
        this.fieldArray[i][j].tileSprite.y = this.tileDestination(i, ROW) - offsetY;
        if (this.fieldArray[i][j].tileValue > 0) {
          this.fieldArray[i][j].tileSprite.alpha = 1;
          this.fieldArray[i][j].tileSprite.visible = true;
          this.fieldArray[i][j].tileSprite.setFrame(this.fieldArray[i][j].tileValue - 1);
        } else {
          this.fieldArray[i][j].tileSprite.alpha = 0;
          this.fieldArray[i][j].tileSprite.visible = false;
        }
      }
    }
  },
  //判断是否在框内
  isInsideBoard: function (row, col) {
    return row >= 0 && col >= 0 && row < 4 && col < 4;
  },
  tileDestination: function (pos, axis) {
    var offset = axis == ROW ? (game.config.height - game.config.width) / 2 : 0;
    return (
      pos * (gameOptions.tileSize + gameOptions.tileSpacing) +
      gameOptions.tileSize / 2 +
      gameOptions.tileSpacing +
      offset +
      18
    );
  },
});
