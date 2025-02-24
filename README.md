# 瑞诺家智能家居/或其他难缠的智能家居的自动化脚本

简而言之，这是一个基于 AutoJs6 的自动化脚本，用于通过企业微信通知控制瑞诺家智能家居应用，也可以作为通过闲置安卓手机控制其他只有原生 APP 的智能家居的解决方案参考。以下是由 Claude 代笔的 README.md。

## 功能特点

- 监听系统通知，自动识别并执行各种模式指令
- 智能等待和重试机制，自动处理登录状态

## 使用方法

1. 安装 AutoJs6 应用（由于自动化应用存在滥用风险，这里不作详细说明。脚本基于版本 6.6.1。）
2. 授予必要权限：
   - 无障碍服务权限
   - 通知访问权限
3. 导入脚本并运行（也即，把 main.js 复制粘贴到 AutoJs6 中）
4. 通过企业微信发送指令，脚本将根据监控通知提醒的文本自动执行对应模式

## 指令格式

发送格式为：`瑞诺家-{模式名称}模式`，这里的模式指瑞诺家智能家居应用中自定义的“场景”。

例如：

- 瑞诺家-睡觉模式
- 瑞诺家-卧室浪漫阅读模式
- 瑞诺家-起床模式

## 通知配置

1. 注册一个企业微信，或其他存在稳定支持 webhook 向安卓发送通知之路径的 App
2. 在企业微信中创建机器人，并获取 Webhook 地址
3. 在其他需要的地方，例如 NodeRED 使用以下格式发送消息：
   ```curl
   curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY' \
       -H 'Content-Type: application/json' \
       -d '
           {
               "msgtype": "text",
               "text": {
                   "content": "瑞诺家-睡觉模式"
               }
           }'
   ```

## 注意事项

- 确保手机已安装瑞诺家智能家居应用
- 保持 AutoJs6 在后台运行
- 确保企业微信通知正常显示
- 如遇登录问题，脚本会自动处理，并尝试在 5 秒后继续工作

## 许可证

Made by 千啾略 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)

Thanks to Cursor -> Claude 3.5 Sonnet for helping me 瞬间写完了这个 README.md and make this script.

## 免责声明

本脚本仅供学习或个人懒疾治疗使用，使用本脚本导致的任何问题由使用者自行承担。
