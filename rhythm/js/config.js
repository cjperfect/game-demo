// 游戏关卡配置
var levelConfig = {
  1: {
    timeLimit: 8, // 秒
    noteSpeed: 400, // px/s
    frequency: 1.0, // 条/秒
    targetScore: 0, // 通关分数
  },
  2: {
    timeLimit: 8,
    noteSpeed: 500,
    frequency: 1.2,
    targetScore: 0,
  },
  3: {
    timeLimit: 5,
    noteSpeed: 360,
    frequency: 1.4,
    targetScore: 0,
  },
  4: {
    timeLimit: 5,
    noteSpeed: 460,
    frequency: 1.6,
    targetScore: 0,
  },
  5: {
    timeLimit: 5,
    noteSpeed: 560,
    frequency: 1.8,
    targetScore: 0,
  },
};

var levelNum = 5;

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
  comboText;

// 用于初始化连击奖励表
var BASE_COMBO_REWARD_GIVEN = {
  10: false,
  20: false,
};
// 用来记录已经给予过的连击奖励，避免重复发放
var comboRewardGiven = {
  ...BASE_COMBO_REWARD_GIVEN,
};

// ===== 连击奖励表（可随意扩展） =====
var comboRewards = {
  10: 1, // 连击 10 额外 +1 分
  20: 3, // 连击 20 额外 +3 分
};
