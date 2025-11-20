// 关卡配置表
const LEVELS = [
  { id: 1, duration: 20, speed: 350, freq: 1.0, total: 20, passScore: 13 },
  { id: 2, duration: 22, speed: 450, freq: 1.2, total: 26, passScore: 18 },
  { id: 3, duration: 24, speed: 550, freq: 1.4, total: 33, passScore: 23 },
  { id: 4, duration: 26, speed: 650, freq: 1.6, total: 41, passScore: 31 },
  { id: 5, duration: 28, speed: 750, freq: 1.8, total: 50, passScore: 39 },
];

var gameWidth = 750;
var gameHeight = 1660;

var boundary;
var boundarys;
var noteArrL = [];
var noteArrC = [];
var noteArrR = [];
var note;
var note2;
var note3;
var notes;
var ground;
var ground1;
var btn;
var btn1;
var btn2;
var btn3;
var btns;
var cursors;
var boundary1;
var boundary2;
var boundary3;
var noteAddL = 0;
var noteAddC = 0;
var noteAddR = 0;
var btnAddL = 0;
var btnAddC = 0;
var btnAddR = 0;
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
var levelTimeLimit = 20; // 第一关时间限制(秒)
var levelScoreTarget = 10; // 每关目标分数
var noteSpeed = 1; // 音符速度因子
