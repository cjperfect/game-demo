var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, "", {
  preload: preload,
  create: create,
  update: update,
});
function preload() {
  //加载:图片👇
  game.load.image("bg", "image/beijingline.png");
  game.load.image("boundaryLeft", "image/biao0004.png");
  game.load.image("boundaryCenter", "image/biao0004.png");
  game.load.image("boundaryRight", "image/biao0004.png");
  game.load.image("btnLeft", "image/shou0001.png");
  game.load.image("btnCenter", "image/shou0002.png");
  game.load.image("btnRight", "image/shou0003.png");
  game.load.image("yinfu0", "image/biao0001.png");
  game.load.image("yinfu1", "image/biao0002.png");
  game.load.image("yinfu2", "image/biao0003.png");
  game.load.image("Guang1", "image/guangxxx.png");
  game.load.image("Guang2", "image/guangxxx.png");
  game.load.image("Guang3", "image/guangxxx.png");
  game.load.image("GUANG1", "image/guang2.png");
  game.load.image("Gdian1", "image/guangdian0001.png");
  game.load.image("Gdian2", "image/guangdian0002.png");
  game.load.image("Gdian3", "image/guangdian0003.png");
  game.load.image("Gdian4", "image/guangdian0004.png");
  game.load.image("paizi", "image/fenshupai.png");
  game.load.image("Miss", "image/miss.png");
  game.load.image("kaishi", "image/kaishi.png");
  game.load.image("jieshu", "image/youxijieshu.png");
  game.load.image("restart", "image/anniu.png");
  game.load.audio("mainMusic", "audio/xingxing.mp3");
  game.load.audio("missMusic", "audio/MISS.wav");
  game.load.audio("overMusic", "audio/over_audio.mp3");

  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
}

function create() {
  //物理碰撞效果👇（ARCADE是效果其中的一种）：
  game.physics.startSystem(Phaser.Physics.ARCADE);
  var bgw = game.add.sprite(0, 0, "bg");
  bgw.scale.setTo(gameWidth / 750, gameHeight / 1026);
  // 点击开始的界面：
  starts = game.add.group();
  starts.inputEnabled = true;

  kaishi = game.add.sprite(gameWidth * 0.31, gameHeight * 0.3, "kaishi");
  kaishi.scale.setTo((gameWidth / 750) * 1.2);
  // 给开始添加点击事件：
  kaishi.inputEnabled = true;
  kaishi.enableBody = true;
  kaishi.events.onInputDown.add(startHide, this);
  kaishi.input.priorityID = 10;

  // 定义边界组：
  boundarys = game.add.group();

  // 给边界开启物理效果
  boundarys.enableBody = false;
  boundarys.inputEnabled = true;
  boundary1 = boundarys.create(gameWidth * 0.15, gameHeight * 0.76, "boundaryLeft");
  boundary1.scale.setTo((gameWidth / 750) * 0.5, (gameHeight / 1026) * 1.48);
  boundary1.inputEnabled = true;
  boundary2 = boundarys.create(gameWidth * 0.42, gameHeight * 0.76, "boundaryCenter");
  boundary2.scale.setTo((gameWidth / 750) * 0.5, (gameHeight / 1026) * 1.48);
  boundary3 = boundarys.create(gameWidth * 0.7, gameHeight * 0.76, "boundaryRight");
  boundary3.scale.setTo((gameWidth / 750) * 0.5, (gameHeight / 1026) * 1.48);

  // 按钮组：
  btn1 = game.add.sprite(gameWidth * 0.13, gameHeight * 0.85, "btnLeft");
  btn1.enableBody = false;
  btn1.inputEnabled = true;
  btn1.scale.setTo((gameWidth / 750) * 1);
  btn2 = game.add.sprite(gameWidth * 0.41, gameHeight * 0.85, "btnCenter");
  btn2.enableBody = false;
  btn2.inputEnabled = true;
  btn2.scale.setTo((gameWidth / 750) * 1);
  btn3 = game.add.sprite(gameWidth * 0.69, gameHeight * 0.85, "btnRight");
  btn3.enableBody = false;
  btn3.inputEnabled = true;
  btn3.scale.setTo((gameWidth / 750) * 1);

  // 给按钮添加事件;
  btn1.events.onInputDown.add(func, this);
  btn1.input.priorityID = 10;
  btn2.events.onInputDown.add(func1, this);
  btn2.input.priorityID = 10;
  btn3.events.onInputDown.add(func2, this);
  btn3.input.priorityID = 10;

  // 按下的光：
  guangs = game.add.group();
  guang1 = game.add.sprite(gameWidth * 0.085, gameHeight * 0.75, "Guang2");
  guang1.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  guang1.alpha = 1;
  Guang1 = game.add.sprite(gameWidth * 0.085, gameHeight * 0.54, "GUANG1");
  Guang1.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  Guang1.alpha = 0;

  guang2 = game.add.sprite(gameWidth * 0.362, gameHeight * 0.75, "Guang2");
  guang2.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  guang2.alpha = 1;
  Guang2 = game.add.sprite(gameWidth * 0.362, gameHeight * 0.54, "GUANG1");
  Guang2.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  Guang2.alpha = 0;

  guang3 = game.add.sprite(gameWidth * 0.637, gameHeight * 0.75, "Guang2");
  guang3.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  guang3.alpha = 1;
  Guang3 = game.add.sprite(gameWidth * 0.637, gameHeight * 0.54, "GUANG1");
  Guang3.scale.setTo(gameWidth / 750, (gameHeight / 1026) * 1.48);
  Guang3.alpha = 0;

  //音符组：
  notes1 = game.add.group();
  notes1.enableBody = true;
  notes2 = game.add.group();
  notes2.enableBody = true;
  notes3 = game.add.group();
  notes3.enableBody = true;

  // 创建分数版：
  paizi = game.add.sprite(gameWidth * 0.265, gameHeight * 0.01, "paizi");
  paizi.scale.setTo((gameWidth / 750) * 1.3);

  // 分数显示
  good = game.add.text(gameWidth * 0.325, gameHeight * 0.02, "", { fill: "#ffffff" });
  good.scale.setTo((gameWidth / 750) * 1.3);
  good.text = "得分:" + goodCounter;

  // 关卡显示
  levelText = game.add.text(gameWidth * 0.6, gameHeight * 0.02, "第1关", { fill: "#ffffff" });
  levelText.scale.setTo((gameWidth / 750) * 1.3);

  // 时间显示
  timeText = game.add.text(gameWidth * 0.75, gameHeight * 0.02, "时间: 20秒", { fill: "#ffffff" });
  timeText.scale.setTo((gameWidth / 750) * 1.3);

  // 创建关卡升级动画文本
  boxGroup = game.add.group();
  boxGroup.x = game.world.centerX - 200;
  boxGroup.y = game.world.centerY + 125;
  var rect = game.add.graphics(0, 0);
  rect.beginFill("#000000", 0.8); // 蓝色、透明度 0.8
  rect.drawRoundedRect(0, 0, 400, 250, 16); // 圆角矩形
  rect.endFill();

  tweenText = game.add.text(200, 125, "", {
    fontSize: "26px",
    fill: "#fff",
    fontWeight: "normal",
    align: "center",
    lineHeight: 36,
  });
  tweenText.anchor.setTo(0.5);

  boxGroup.add(rect);
  boxGroup.add(tweenText);
  boxGroup.visible = false;

  comboText = game.add.text(100, 60, `连击: ${combo}`, {
    fontSize: "30px",
    fill: "#ffff00",
    fontWeight: "bold",
  });
  comboText.anchor.setTo(0.5);

  gameOver = game.add.sprite();
}

/**
 * 升级关卡
 * 增加球数量并显示升级动画
 */
function levelUp() {
  // 设置升级文本
  boxGroup.visible = true;

  var content =
    "本关完成！\n" +
    "本关得分：" +
    goodCounter +
    " 分\n" +
    "本关通关要求：" +
    targetScore +
    " 分\n" +
    "已成功进入下一关！\n" +
    "下一关将在 2 秒后自动开始…";

  tweenText.setText(content);

  // 播放升级动画
  game.add
    .tween(boxGroup)
    .to({ y: boxGroup.y - 100, alpha: 0.8 }, 300, "Linear", false)
    .to({ y: boxGroup.y - 150 }, 300, "Linear", false)
    .to({ y: boxGroup.y - 250, alpha: 0 }, 300, "Linear", true);
}

function update() {
  if (!isPlaying) return;
  btn1.events.onInputDown.add(onDown1, this);
  btn1.events.onInputUp.add(onUp1, this);
  btn2.events.onInputDown.add(onDown2, this);
  btn2.events.onInputUp.add(onUp2, this);
  btn3.events.onInputDown.add(onDown3, this);
  btn3.events.onInputUp.add(onUp3, this);

  // ----------------------
  // 1. 生成音符计时器
  // ----------------------
  noteTimer += game.time.elapsed;

  // 目标间隔 = frequency（条/秒） → 转换成毫秒
  var targetInterval = 1000 / noteFrequency;

  if (noteTimer >= targetInterval) {
    generateRhythmicNotes();
    noteTimer = 0;
  }

  // ----------------------
  // 2. 更新关卡时间
  // ----------------------
  levelTimer += game.time.elapsed;
  var elapsedSeconds = levelTimer / 1000;
  var remainingTime = Math.max(0, levelTimeLimit - elapsedSeconds);
  timeText.text = "时间: " + Math.ceil(remainingTime) + "秒";

  // ----------------------
  // 3. 时间到，判断通关 / 失败
  // ----------------------
  if (remainingTime <= 0) {
    isPlaying = false;

    if (goodCounter >= targetScore) {
      levelComplete();
    } else {
      levelFailed();
    }
  }

  if (checkOverlap(notes3, btn3)) {
    // MISS
    miss = game.add.sprite(gameWidth * 0.34, gameHeight * 0.4, "Miss");
    miss.scale.setTo((gameWidth / 750) * 1, (gameHeight / 1026) * 1);
    if (noteArrR[btnAddR]) {
      noteArrR[btnAddR].destroy();
    }
    btnAddR++;
    game.time.events.add(Phaser.Timer.SECOND * 0.2, missOUt, this);
  } else if (checkOverlap(notes2, btn2)) {
    // MISS
    miss = game.add.sprite(gameWidth * 0.34, gameHeight * 0.4, "Miss");
    miss.scale.setTo((gameWidth / 750) * 1, (gameHeight / 1026) * 1);
    if (noteArrC[btnAddC]) {
      noteArrC[btnAddC].destroy();
    }
    btnAddC++;
    game.time.events.add(Phaser.Timer.SECOND * 0.2, missOUt, this);
  } else if (checkOverlap(notes1, btn1)) {
    // MISS
    miss = game.add.sprite(gameWidth * 0.34, gameHeight * 0.4, "Miss");
    miss.scale.setTo((gameWidth / 750) * 1, (gameHeight / 1026) * 1);
    if (noteArrL[btnAddL]) {
      noteArrL[btnAddL].destroy();
    }
    btnAddL++;
    game.time.events.add(Phaser.Timer.SECOND * 0.2, missOUt, this);
  }
}
// 根据节奏生成音符
function generateRhythmicNotes() {
  // 基础间隔
  var baseInterval = 1000; // 1秒
  var adjustedInterval = baseInterval / noteFrequency;

  // 随机选择要生成的音符位置
  var positions = [];
  if (Math.random() < 0.5) positions.push("left"); // 50%概率左边
  if (Math.random() < 0.5) positions.push("center"); // 50%概率中间
  if (Math.random() < 0.5) positions.push("right"); // 50%概率右边

  // 如果随机后没有位置，至少生成一个
  if (positions.length === 0) {
    positions = ["left", "center", "right"];
    var randomIndex = Math.floor(Math.random() * 3);
    positions = [positions[randomIndex]];
  }

  // 随机打乱位置顺序
  for (var i = positions.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // 错开生成音符
  for (var i = 0; i < positions.length; i++) {
    var delay = i * (adjustedInterval * 0.3); // 每个音符间隔30%

    game.time.events.add(
      delay,
      (function (position) {
        return function () {
          switch (position) {
            case "left":
              createLeftNote(noteSpeed);
              break;
            case "center":
              createCenterNote(noteSpeed);
              break;
            case "right":
              createRightNote(noteSpeed);
              break;
          }
        };
      })(positions[i]),
      this
    );
  }
  // 下一次生成音符的间隔随机 ±20%
  noteInterval = adjustedInterval * (0.8 + Math.random() * 0.4);
}

// 创建左边音符
function createLeftNote(speed) {
  noteArrL[noteAddL] = notes1.create(gameWidth * 0.09, 0, "yinfu0");
  noteArrL[noteAddL].scale.setTo((gameWidth / 750) * 1);
  noteArrL[noteAddL].body.velocity.y = speed;
  noteArrL[noteAddL].alpha = 0;
  noteArrL[noteAddL].inputEnabled = true;
  const temp = noteAddL;
  setTimeout(() => {
    noteArrL[temp].alpha = 1;
  }, 100);
  noteAddL++;
}

// 创建中间音符
function createCenterNote(speed) {
  noteArrC[noteAddC] = notes2.create(gameWidth * 0.368, 0, "yinfu1");
  noteArrC[noteAddC].scale.setTo((gameWidth / 750) * 1);
  noteArrC[noteAddC].body.velocity.y = speed;
  noteArrC[noteAddC].alpha = 0;
  noteArrC[noteAddC].inputEnabled = true;
  const temp = noteAddC;
  setTimeout(() => {
    noteArrC[temp].alpha = 1;
  }, 100);
  noteAddC++;
}

// 创建右边音符
function createRightNote(speed) {
  noteArrR[noteAddR] = notes3.create(gameWidth * 0.643, 0, "yinfu2");
  noteArrR[noteAddR].scale.setTo((gameWidth / 750) * 1);
  noteArrR[noteAddR].body.velocity.y = speed;
  noteArrR[noteAddR].alpha = 0;
  noteArrR[noteAddR].inputEnabled = true;
  const temp = noteAddR;
  setTimeout(() => {
    noteArrR[temp].alpha = 1;
  }, 100);
  noteAddR++;
}

// 关卡完成
function levelComplete() {
  isPlaying = false;

  // 停止音乐
  if (mainMusic && mainMusic.isPlaying) {
    mainMusic.stop();
  }

  // 清除所有音符
  clearAllNotes();

  levelUp(currentLevel);

  game.time.events.add(
    Phaser.Timer.SECOND * 2,
    function () {
      // 升级关卡
      currentLevel++;

      if (currentLevel <= levelNum) {
        // 根据 levelConfig 设置下一关参数
        levelTimeLimit = levelConfig[currentLevel].timeLimit;
        noteSpeed = levelConfig[currentLevel].noteSpeed;
        noteFrequency = levelConfig[currentLevel].frequency;
        targetScore = levelConfig[currentLevel].targetScore;

        // 重置计数器
        levelTimer = 0;

        // 更新关卡显示
        levelText.text = "第" + currentLevel + "关";
        timeText.text = "时间: " + levelTimeLimit + "秒";

        // 开始下一关
        isPlaying = true;
      } else {
        // 游戏通关
        gameComplete();
      }
    },
    this
  );
}

// 关卡失败
function levelFailed() {
  isPlaying = false;

  // 停止音乐
  if (mainMusic && mainMusic.isPlaying) {
    mainMusic.stop();
  }

  game.paused = true;

  // 游戏失败
  alert("游戏失败了");
}

// 游戏通关
function gameComplete() {
  game.paused = true;
  alert("游戏通关了");
}

// 清除所有音符
function clearAllNotes() {
  // 清除左边音符
  for (var i = 0; i < noteArrL.length; i++) {
    if (noteArrL[i]) {
      noteArrL[i].destroy();
    }
  }
  noteArrL = [];
  noteAddL = 0;
  btnAddL = 0;

  // 清除中间音符
  for (var i = 0; i < noteArrC.length; i++) {
    if (noteArrC[i]) {
      noteArrC[i].destroy();
    }
  }
  noteArrC = [];
  noteAddC = 0;
  btnAddC = 0;

  // 清除右边音符
  for (var i = 0; i < noteArrR.length; i++) {
    if (noteArrR[i]) {
      noteArrR[i].destroy();
    }
  }
  noteArrR = [];
  noteAddR = 0;
  btnAddR = 0;
}

// 开始游戏
function startHide() {
  kaishi.destroy();

  // 添加主音乐：
  mainMusic = game.add.audio("mainMusic");
  mainMusic.play();
  isPlaying = true;

  // 开始节奏音符生成
  noteTimer = 0;
  noteInterval = 500;
}

// miss 隐藏
function missOUt() {
  if (miss) {
    miss.destroy();
    miss = null; // 重置miss变量
  }
}

// 得分 / 连击逻辑处理
function scoreLogic(isSuccess) {
  if (isSuccess) {
    // Combo 增加
    combo++;
    goodCounter++;

    /**
     * 连击达到 10：额外 +1 分
     * 连击达到 20：额外 +3 分
     */

    // ===== 连击奖励逻辑 =====
    if (comboRewards[combo] && !comboRewardGiven[combo]) {
      goodCounter += comboRewards[combo]; // 加奖励分
      comboRewardGiven[combo] = true; // 标记该奖励已发放
    }

    good.text = "得分:" + goodCounter;
    comboText.text = "连击：" + combo;
  } else {
    // MISS 清空连击
    combo = 0;
    comboRewardGiven = { ...BASE_COMBO_REWARD_GIVEN };
    comboText.text = "连击：0";
  }
}

// func  func1  func2 左中右命中后的逻辑
function func() {
  if (noteArrL[btnAddL] && checkOverlap(noteArrL[btnAddL], boundary1)) {
    scoreLogic(true);

    // 粒子效果
    emitter1 = game.add.emitter(0.1, 0, 10);
    emitter1.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter1.gravity = -400;
    emitter1.setScale(0.005, 0.005);
    emitter1.x = gameWidth * 0.23;
    emitter1.y = gameHeight * 0.75;
    emitter1.start(true, 1000, null, 30);
    noteArrL[btnAddL].kill();

    btnAddL++;
  } else {
    scoreLogic(false);
  }
}

function func1() {
  if (noteArrC[btnAddC] && checkOverlap(noteArrC[btnAddC], boundary2)) {
    scoreLogic(true);

    emitter2 = game.add.emitter(0, 0, 10);
    emitter2.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter2.gravity = -400;
    emitter2.setScale(0.05, 0.05);
    emitter2.x = gameWidth * 0.5;
    emitter2.y = gameHeight * 0.75;
    emitter2.start(true, 1000, null, 10);
    noteArrC[btnAddC].kill();
    btnAddC++;
  } else {
    scoreLogic(false);
  }
}

function func2() {
  if (noteArrR[btnAddR] && checkOverlap(noteArrR[btnAddR], boundary3)) {
    scoreLogic(true);

    emitter3 = game.add.emitter(0, 0, 10);
    emitter3.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter3.gravity = -400;
    emitter3.setScale(-10, -10);
    emitter3.x = gameWidth * 0.77;
    emitter3.y = gameHeight * 0.75;
    emitter3.start(true, 1000, null, 20);
    noteArrR[btnAddR].kill();
    btnAddR++;
  } else {
    scoreLogic(false);
  }
}

function onDown1() {
  guang1.alpha = 0;
  Guang1.alpha = 1;
}

function onUp1() {
  guang1.alpha = 1;
  Guang1.alpha = 0;
}

function onDown2() {
  guang2.alpha = 0;
  Guang2.alpha = 1;
}

function onUp2() {
  guang2.alpha = 1;
  Guang2.alpha = 0;
}

function onDown3() {
  guang3.alpha = 0;
  Guang3.alpha = 1;
}

function onUp3() {
  guang3.alpha = 1;
  Guang3.alpha = 0;
}

function checkOverlap(note, boundary1) {
  if (note && boundary1) {
    var boundsA = note.getBounds();
    var boundsB = boundary1.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
  }
  return false;
}
