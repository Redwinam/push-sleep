// 启动自动化服务
auto();
// events.observeNotification(); // 注释掉原有的通知监听
toast("启动TCP连接");

// 配置信息
const CONFIG = {
  host: "bemfa.com",
  port: 8344,
  uid: "API_KEY", // 替换为你的巴法云uid
  topics: {
    sleep: "sleep006",
    meal: "meal006",
    leave: "leave006",
    welcome: "wel006",
    read: "read006",
  },
  actions: {
    sleep: "睡觉",
    meal: "吃饭",
    leave: "离家",
    welcome: "迎宾",
    read: "卧室浪漫阅读",
  },
  heartbeatInterval: 50000, // 心跳间隔，建议小于60秒
};

// TCP连接函数
function startTcpClient() {
  threads.start(function () {
    try {
      let socket = new java.net.Socket(CONFIG.host, CONFIG.port);
      let output = new java.io.PrintWriter(socket.getOutputStream(), true);
      let input = new java.io.BufferedReader(new java.io.InputStreamReader(socket.getInputStream()));

      log("TCP连接成功");

      // 发送订阅指令，同时订阅多个主题
      let topics = Object.values(CONFIG.topics).join(",");
      let subscribeCmd = "cmd=1&uid=" + CONFIG.uid + "&topic=" + topics + "\r\n";
      output.write(subscribeCmd);
      output.flush();
      log("已发送订阅指令，监听主题：" + topics);

      // 启动心跳线程
      threads.start(function () {
        while (true) {
          try {
            output.write("ping\r\n");
            output.flush();
            log("发送心跳");
            sleep(CONFIG.heartbeatInterval);
          } catch (error) {
            log("心跳发送失败: " + error);
            break;
          }
        }
      });

      // 监听数据
      while (true) {
        let line = input.readLine();
        if (line) {
          log("收到数据: " + line);
          // 解析数据
          if (line.indexOf("topic=") !== -1) {
            // 提取主题
            let topic = line.match(/topic=([^&]+)/)[1];
            log("收到主题：" + topic);

            // 根据主题执行不同操作
            let actionTaken = false;
            for (let [key, topicValue] of Object.entries(CONFIG.topics)) {
              if (topic === topicValue) {
                log("执行" + CONFIG.actions[key] + "模式");
                actionTaken = true;
                threads.start(function () {
                  switchMode(CONFIG.actions[key]);
                });
                break;
              }
            }
            if (!actionTaken) {
              log("收到未知主题：" + topic);
            }
          }
        }
      }
    } catch (error) {
      log("TCP连接错误: " + error);
      // 重新连接
      sleep(5000);
      startTcpClient();
    }
  });
}

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
      sleep(interval);
      log("未找到'" + buttonText + "'按钮，等待后重试...");
    }
  }
  log("未能找到'" + buttonText + "'按钮");
  return false;
}

// 尝试执行模式切换
function switchMode(modeName) {
  try {
    // 先尝试直接点击模式按钮（假设已在"我的"页面）
    if (smartClick(modeName)) {
      log("直接切换到" + modeName + "模式成功");
      return true;
    }

    // 如果直接点击失败，尝试完整流程
    log("直接切换失败，尝试完整流程");
    launchApp("瑞诺家智能家居");
    log("已启动应用");

    // 智能点击按钮序列
    if (smartClick("我的")) {
      return smartClick(modeName);
    }
    return false;
  } catch (error) {
    log("执行过程出错: " + error);
    return false;
  }
}

// 启动TCP客户端
startTcpClient();
