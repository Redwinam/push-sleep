// 启动通知监听
auto();
events.observeNotification();
toast("启动通知监听");

// 智能等待并点击按钮
function smartClick(buttonText, maxRetry = 3, interval = 1000) {
  for (let i = 0; i < maxRetry; i++) {
    let button = text(buttonText).findOnce();
    if (button) {
      click(button.bounds().centerX(), button.bounds().centerY());
      log("已点击'" + buttonText + "'按钮");
      return true;
    }

    // 检查是否需要登录
    let loginButton = text("登录").findOnce();
    if (loginButton) {
      log("检测到登录按钮，尝试登录");
      click(loginButton.bounds().centerX(), loginButton.bounds().centerY());
      sleep(5000); // 等待登录完成
      continue; // 重新尝试查找目标按钮
    }

    if (i < maxRetry - 1) {
      // 最后一次不需要sleep
      sleep(interval);
      log("未找到'" + buttonText + "'按钮，等待后重试...");
    }
  }
  log("未能找到'" + buttonText + "'按钮");
  return false;
}

// 监听通知事件
events.onNotification(function (notification) {
  // 获取额外信息中的实际文本
  let extras = notification.extras;
  if (extras) {
    let androidText = extras.get("android.text");
    log("android.text: " + androidText);

    // 确保androidText是字符串
    let textContent = String(androidText || "");

    // 去除可能的[数字条]前缀
    let actualText = textContent.replace(/^\[\d+条\]/, "").trim();
    log("处理后的文本: " + actualText);

    // 匹配"瑞诺家-xx模式"格式
    let modeMatch = actualText.match(/瑞诺家-(.+?)模式/);
    if (modeMatch) {
      // 提取模式名称（如"睡觉"或"卧室浪漫阅读"）
      let modeName = modeMatch[1];
      log("检测到模式指令：" + modeName);

      // 在新线程中执行UI操作
      threads.start(function () {
        try {
          // 启动应用
          launchApp("瑞诺家智能家居");
          log("已启动应用");

          // 智能点击按钮序列
          if (smartClick("我的")) {
            smartClick(modeName);
          }
        } catch (error) {
          log("执行过程出错: " + error);
        }
      });
    }
  }
});
