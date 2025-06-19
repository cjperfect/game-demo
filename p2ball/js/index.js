// 进入游戏, 就开始加载游戏资源
game.state.start("main"); //启动第一个场景

// 游戏提示内容板块
const gameContainer = document.querySelector(".game-tips-container");

const gameDesc = document.querySelector(".game-desc-container");

// 游戏整体区域dom
const gameDom = document.querySelector("#game-container");

// 点击游戏说明任意区域, 关闭说明
gameDesc.addEventListener("click", (e) => {
  e.currentTarget.classList.add("hidden");
  // 启动游戏
  game.paused = false;
  // 升级动画显示
  boxGroup.visible = true;
});

// 跳转到游戏启动页
function goGamePage(score, isLeave) {
  let isSuccess = score >= successScore ? 1 : 0;
  if (isLeave) isSuccess = 0;

  wx.miniProgram.redirectTo({
    url: `/packageD/pages/activity/25FathersDay/game/index?from=h5&issuccess=${isSuccess}&score=${score}`,
    success: (res) => {
      console.log(res); // 页面跳转成功
    },
    fail: (err) => {
      console.log(err); // 页面跳转失败
    },
  });
}

// 跳转到抽奖页面
function goRafflePage(score) {
  wx.miniProgram.redirectTo({
    url: `/packageD/pages/activity/25FathersDay/game/raffle/index?from=h5&issuccess=1&score=${score}`,
    success: (res) => {
      console.log(res); // 页面跳转成功
    },
    fail: (err) => {
      console.log(err); // 页面跳转失败
    },
  });
}

// 游戏失败, 有次数时候的开始游戏按钮
const startBtn = document.querySelector(".start-btn");
startBtn.addEventListener("click", () => {
  goGamePage(_score);
});

// 游戏通关的继续游戏
const continueText = document.querySelector(".continue-text");
continueText.addEventListener("click", () => {
  goGamePage(_score);
});

// 中断的继续游戏按钮
const continueBtn = document.querySelector(".continue-btn");
continueBtn.addEventListener("click", () => {
  // 游戏没有结束的情况下才恢复游戏
  if (!isGameOver) {
    // 恢复游戏
    game.paused = false;
  }

  // 关闭弹框
  document.querySelector(".pause-container").classList.add("hidden");
});

// 中断的忍痛离开按钮
const leaveBtn = document.querySelector(".leave-btn");
leaveBtn.addEventListener("click", () => {
  goGamePage(_score, true);
});

// 邀请好友
const inviteBtn = document.querySelector(".invite-btn");
inviteBtn.addEventListener("click", () => {
  goGamePage(_score);
});

// 去抽奖
const lotteryBtn = document.querySelector(".lottery-btn");
lotteryBtn.addEventListener("click", () => {
  goRafflePage(_score);
});

function navBackListener() {
  window.history.pushState(null, null, window.location.href);
  window.addEventListener("popstate", () => {
    // 用户点击后退, 导致游戏中断
    game.paused = true;
    const dom = document.querySelector(".pause-container");
    dom.classList.remove("hidden");
    dom.classList.add("toTop"); // 放在最顶层, 防止有弹框的情况下, 又后退路由出现
  });
}

navBackListener();
