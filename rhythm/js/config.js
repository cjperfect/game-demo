// 游戏关卡配置
var levelConfig = {
  1: {
    timeLimit: 20, // 秒
    noteSpeed: 350, // px/s
    frequency: 1.0, // 条/秒
    targetScore: 13, // 通关分数
    estimatedNotes: 20, // 预计总条数
  },
  2: {
    timeLimit: 22,
    noteSpeed: 450,
    frequency: 1.2,
    targetScore: 18,
    estimatedNotes: 26,
  },
  3: {
    timeLimit: 24,
    noteSpeed: 550,
    frequency: 1.4,
    targetScore: 23,
    estimatedNotes: 33,
  },
  4: {
    timeLimit: 26,
    noteSpeed: 650,
    frequency: 1.6,
    targetScore: 31,
    estimatedNotes: 41,
  },
  5: {
    timeLimit: 28,
    noteSpeed: 750,
    frequency: 1.8,
    targetScore: 39,
    estimatedNotes: 50,
  },
};

var gameWidth = 750;
var gameHeight = 1660;

// 点击的地方  左 中 右
var boundary1, boundary2, boundary3, boundarys;
var btn1, btn2, btn3, btns;

// 音符数组 左中右
var noteArrL = [];
var noteArrC = [];
var noteArrR = [];

var noteAddL = 0;
var noteAddC = 0;
var noteAddR = 0;

var btnAddL = 0;
var btnAddC = 0;
var btnAddR = 0;

// 命中的光效
var guang1;
var guang2;
var guang3;

var emitter1;
var emitter2;
var emitter3;
var emitter4;

var good;
// 得分计数器
var goodCounter = 0;

// miss计数器
var missCounter = 0;
var miss;

var paizi;
var starts;

var yuan;
var yuan1;
var kaishi;
var readyMusic;
var ready;
var go;
var readyTween;
var gameOver;
var restartBtn;
var mainMusic;

// 新增变量用于节奏音符生成
var isPlaying = false;
var noteTimer = 0;
var noteInterval = 500; // 初始音符间隔(毫秒)

// 关卡系统变量
var currentLevel = 1;
var levelText;
var timeText;
var levelTimer = 0;
// 升级关卡动画元素
var boxGroup;
var tweenText;

// 基准值用于计算比例
var BASE_NOTE_SPEED = 350; // 基础下落速度
// 当前关卡
var currentLevel = 1;
var noteFrequency = levelConfig[currentLevel].frequency; // 条/秒
var noteSpeed = levelConfig[currentLevel].noteSpeed; // px/s
var noteInterval = 1000 / noteFrequency; // 基础间隔
var targetScore = levelConfig[currentLevel].targetScore;
var levelTimeLimit = levelConfig[currentLevel].timeLimit;

/************* 连击系统 *************/
var combo = 0,
  maxCombo = 0,
  comboText;
