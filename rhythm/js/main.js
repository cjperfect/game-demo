

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
  game.load.image("yuan", "image/baidi1.png");
  game.load.image("kaishi", "image/kaishi.png");
  game.load.image("jieshu", "image/youxijieshu.png");
  game.load.image("restart", "image/anniu.png");
  game.load.image("go", "image/go.png");
  game.load.image("ready", "image/READY.png");
  game.load.audio("mainMusic", "audio/xingxing.mp3");
  game.load.audio("missMusic", "audio/MISS.wav");
  game.load.audio("readyMusic", "audio/readygo.mp3");
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
  // starts.enableBody = true;
  yuan = game.add.sprite(gameWidth * 0.15, gameHeight * 0.16, "yuan");
  yuan1 = game.add.sprite(gameWidth * 0.24, gameHeight * 0.21, "yuan");
  kaishi = game.add.sprite(gameWidth * 0.31, gameHeight * 0.3, "kaishi");
  yuan.scale.setTo((gameWidth / 750) * 1.2);
  yuan1.scale.setTo((gameWidth / 750) * 0.9);
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
  // 粒子效果：
  good = game.add.text(gameWidth * 0.425, gameHeight * 0.02, "", { fill: "#ffffff" });
  good.scale.setTo((gameWidth / 750) * 1.3);
  good.text = "得分:" + goodCounter;

  // 关卡显示
  levelText = game.add.text(gameWidth * 0.1, gameHeight * 0.02, "第1关", { fill: "#ffffff" });
  levelText.scale.setTo((gameWidth / 750) * 1.3);

  // 时间显示
  timeText = game.add.text(gameWidth * 0.1, gameHeight * 0.05, "时间: 20秒", { fill: "#ffffff" });
  timeText.scale.setTo((gameWidth / 750) * 1.3);

  gameOver = game.add.sprite();
}

function update() {
  btn1.events.onInputDown.add(onDown1, this);
  btn1.events.onInputUp.add(onUp1, this);
  btn2.events.onInputDown.add(onDown2, this);
  btn2.events.onInputUp.add(onUp2, this);
  btn3.events.onInputDown.add(onDown3, this);
  btn3.events.onInputUp.add(onUp3, this);

  // 更新音符生成计时器
  if (isPlaying) {
    noteTimer += game.time.elapsed;
    if (noteTimer >= noteInterval) {
      generateRhythmicNotes();
      noteTimer = 0;
      // 动态调整音符间隔，模拟节奏变化
      noteInterval = 300 + Math.random() * 400;
    }

    // 更新关卡计时器
    levelTimer += game.time.elapsed;
    var remainingTime = Math.max(0, levelTimeLimit - Math.floor(levelTimer / 1000));
    timeText.text = "时间: " + remainingTime + "秒";

    // 检查关卡是否成功
    if (goodCounter >= levelScoreTarget) {
      levelComplete();
    }

    // 检查关卡是否超时
    if (remainingTime <= 0) {
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
    var delay = i * 300; // 每个音符间隔150毫秒

    game.time.events.add(
      delay,
      (function (position) {
        return function () {
          switch (position) {
            case "left":
              createLeftNote();
              break;
            case "center":
              createCenterNote();
              break;
            case "right":
              createRightNote();
              break;
          }
        };
      })(positions[i]),
      this
    );
  }

  // 更随机的间隔
  noteInterval = 200 + Math.random() * 500; // 200-700毫秒的随机间隔
}

// 创建左边音符
function createLeftNote() {
  noteArrL[noteAddL] = notes1.create(gameWidth * 0.09, 0, "yinfu0");
  noteArrL[noteAddL].scale.setTo((gameWidth / 750) * 1);
  noteArrL[noteAddL].body.velocity.y = (gameHeight / 3) * noteSpeed;
  noteArrL[noteAddL].inputEnabled = true;
  noteAddL++;
}

// 创建中间音符
function createCenterNote() {
  noteArrC[noteAddC] = notes2.create(gameWidth * 0.368, 0, "yinfu1");
  noteArrC[noteAddC].scale.setTo((gameWidth / 750) * 1);
  noteArrC[noteAddC].body.velocity.y = (gameHeight / 3) * noteSpeed;
  noteArrC[noteAddC].inputEnabled = true;
  noteAddC++;
}

// 创建右边音符
function createRightNote() {
  noteArrR[noteAddR] = notes3.create(gameWidth * 0.643, 0, "yinfu2");
  noteArrR[noteAddR].scale.setTo((gameWidth / 750) * 1);
  noteArrR[noteAddR].body.velocity.y = (gameHeight / 3) * noteSpeed;
  noteArrR[noteAddR].inputEnabled = true;
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

  // 显示关卡完成信息
  var levelCompleteText = game.add.text(gameWidth * 0.2, gameHeight * 0.4, "第" + currentLevel + "关完成!", {
    fill: "#ffffff",
    fontSize: "40px",
  });
  levelCompleteText.scale.setTo((gameWidth / 750) * 1.3);

  // 进入下一关
  currentLevel++;

  if (currentLevel <= 3) {
    // 设置下一关参数
    if (currentLevel === 2) {
      levelTimeLimit = 15; // 第二关15秒
      noteSpeed = 1.3; // 音符速度加快
    } else if (currentLevel === 3) {
      levelTimeLimit = 10; // 第三关10秒
      noteSpeed = 1.6; // 音符速度更快
    }

    // 重置计数器
    goodCounter = 0;
    good.text = "得分:" + goodCounter;
    levelTimer = 0;

    // 更新关卡显示
    levelText.text = "第" + currentLevel + "关";
    timeText.text = "时间: " + levelTimeLimit + "秒";

    // 延迟后开始下一关
    game.time.events.add(
      Phaser.Timer.SECOND * 2,
      function () {
        levelCompleteText.destroy();
        startNextLevel();
      },
      this
    );
  } else {
    // 游戏通关
    gameComplete();
  }
}

// 关卡失败
function levelFailed() {
  isPlaying = false;

  // 停止音乐
  if (mainMusic && mainMusic.isPlaying) {
    mainMusic.stop();
  }

  // 显示失败信息
  var levelFailedText = game.add.text(gameWidth * 0.2, gameHeight * 0.4, "时间到! 游戏结束", {
    fill: "#ffffff",
    fontSize: "40px",
  });
  levelFailedText.scale.setTo((gameWidth / 750) * 1.3);

  // 延迟后显示重新开始界面
  game.time.events.add(
    Phaser.Timer.SECOND * 2,
    function () {
      levelFailedText.destroy();
      showGameOverScreen();
    },
    this
  );
}

// 游戏通关
function gameComplete() {
  // 显示通关信息
  var gameCompleteText = game.add.text(gameWidth * 0.2, gameHeight * 0.4, "恭喜通关!", {
    fill: "#ffffff",
    fontSize: "40px",
  });
  gameCompleteText.scale.setTo((gameWidth / 750) * 1.3);

  // 延迟后显示重新开始界面
  game.time.events.add(
    Phaser.Timer.SECOND * 2,
    function () {
      gameCompleteText.destroy();
      showGameOverScreen();
    },
    this
  );
}

// 开始下一关
function startNextLevel() {
  // 播放准备音乐
  readyMusic = game.add.audio("readyMusic");
  readyMusic.allowMultiple = false;
  readyMusic.play();
  readyMusic.onStop.add(readyStopped, this);

  ready = game.add.sprite(gameWidth * 0.18, gameHeight * 0.3, "ready");
  ready.scale.setTo((gameWidth / 750) * 1);
  game.time.events.add(Phaser.Timer.SECOND * 0.5, readygo, this);
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

// 显示游戏结束界面
function showGameOverScreen() {
  yuan = game.add.sprite(gameWidth * 0.15, gameHeight * 0.16, "yuan");
  yuan1 = game.add.sprite(gameWidth * 0.24, gameHeight * 0.21, "yuan");
  yuan.scale.setTo((gameWidth / 750) * 1.2);
  yuan1.scale.setTo((gameWidth / 750) * 0.9);
  gameOver = game.add.sprite(gameWidth * 0.2, gameHeight * 0.2, "jieshu");
  gameOver.scale.setTo((gameWidth / 750) * 1.2);
  restartBtn = game.add.sprite(gameWidth * 0.42, gameHeight * 0.33, "restart");
  restartBtn.scale.setTo((gameWidth / 750) * 1);
  restartBtn.inputEnabled = true;

  // 给按钮添加事件;
  // 给精灵添加事件：
  restartBtn.events.onInputDown.add(gameRestart, this);
}

function startHide() {
  yuan.destroy();
  yuan1.destroy();
  kaishi.destroy();

  readyMusic = game.add.audio("readyMusic");
  readyMusic.allowMultiple = false;
  readyMusic.play();
  readyMusic.onStop.add(readyStopped, this);

  ready = game.add.sprite(gameWidth * 0.18, gameHeight * 0.3, "ready");
  ready.scale.setTo((gameWidth / 750) * 1);
  game.time.events.add(Phaser.Timer.SECOND * 0.5, readygo, this);
}

function readyStopped() {
  // 添加主音乐：
  mainMusic = game.add.audio("mainMusic");
  mainMusic.play();
  isPlaying = true;

  // 开始节奏音符生成
  noteTimer = 0;
  noteInterval = 500;

  // 监听主音乐结束：
  mainMusic.onStop.add(musicStopped, this);
}

function musicStopped() {
  isPlaying = false;
  // 如果音乐自然结束但关卡还没完成，也显示游戏结束
  if (goodCounter < levelScoreTarget) {
    // showGameOverScreen();
  }
}

function gameRestart() {
  // 重置所有游戏状态
  currentLevel = 1;
  goodCounter = 0;
  levelTimer = 0;
  levelTimeLimit = 20;
  noteSpeed = 1;

  // 清除所有音符
  clearAllNotes();

  // 重置UI
  good.text = "得分:" + goodCounter;
  levelText.text = "第1关";
  timeText.text = "时间: 20秒";

  // 重新开始游戏
  game.state.restart();
}

function startShow() {
  yuan.reset(gameWidth * 0.15, gameHeight * 0.16);
}

function readygo() {
  readyTween = game.add.tween(ready.scale).to({ x: 0, y: 0 }, 500, null, true);
  readyTween = game.add.tween(ready).to({ x: gameWidth * 0.48, y: gameHeight * 0.36 }, 500, null, true);
  readyTween.onComplete.add(gogo, this);
}

function gogo() {
  go = game.add.sprite(gameWidth * 0.35, gameHeight * 0.3, "go");
  go.scale.setTo((gameWidth / 750) * 1);
  game.time.events.add(Phaser.Timer.SECOND * 0.5, goHide, this);
}

function goHide() {
  go.destroy();
}

function missOUt() {
  if (miss) {
    miss.destroy();
    miss = null; // 重置miss变量
  }
}

function func() {
  if (noteArrL[btnAddL] && checkOverlap(noteArrL[btnAddL], boundary1)) {
    goodCounter++;
    good.text = "得分:" + goodCounter;
    emitter1 = game.add.emitter(0.1, 0, 10);
    emitter1.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter1.gravity = -400;
    emitter1.setScale(0.005, 0.005);
    emitter1.x = gameWidth * 0.23;
    emitter1.y = gameHeight * 0.75;
    emitter1.start(true, 1000, null, 30);
    noteArrL[btnAddL].kill();
    btnAddL++;
  }
}

function func1() {
  if (noteArrC[btnAddC] && checkOverlap(noteArrC[btnAddC], boundary2)) {
    goodCounter++;
    good.text = "得分:" + goodCounter;
    emitter2 = game.add.emitter(0, 0, 10);
    emitter2.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter2.gravity = -400;
    emitter2.setScale(0.05, 0.05);
    emitter2.x = gameWidth * 0.5;
    emitter2.y = gameHeight * 0.75;
    emitter2.start(true, 1000, null, 10);
    noteArrC[btnAddC].kill();
    btnAddC++;
  }
}

function func2() {
  if (noteArrR[btnAddR] && checkOverlap(noteArrR[btnAddR], boundary3)) {
    goodCounter++;
    good.text = "得分:" + goodCounter;
    emitter3 = game.add.emitter(0, 0, 10);
    emitter3.makeParticles(["Gdian1", "Gdian2", "Gdian3", "Gdian4"]);
    emitter3.gravity = -400;
    emitter3.setScale(-10, -10);
    emitter3.x = gameWidth * 0.77;
    emitter3.y = gameHeight * 0.75;
    emitter3.start(true, 1000, null, 20);
    noteArrR[btnAddR].kill();
    btnAddR++;
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
