# 云开发访客记录

1. 在微信云开发控制台确认环境 ID 与 `App.vue` 中的云环境 ID 一致；如果不一致，替换为实际环境 ID。
2. 确认 `manifest.json` 的 `mp-weixin.cloudfunctionRoot` 为 `../../../../cloudfunctions/`。微信开发者工具打开 `unpackage/dist/dev/mp-weixin` 时，会从编译产物目录回指到项目根目录的 `cloudfunctions`，避免 HBuilderX 重新编译后丢失云函数目录。
3. 创建数据库集合 `keep_in_touch`，权限选择“所有用户不可读写”。
4. 将项目根目录的 `cloudfunctions/trackVisit` 上传并部署到云端。uni-app 编译产物不需要再复制一份 `unpackage/dist/dev/mp-weixin/cloudfunctions/trackVisit`。
5. HBuilderX 重新运行到微信开发者工具，首次点击信封并选择头像、填写昵称后即可产生一条记录；之后每次打开请柬都会异步更新同一条记录。

云函数使用微信上下文生成 `openId`（实际为 `OPENID`），并以 `openId` 作为数据库文档 key。记录字段包括头像 data URL `avatarUrl`、昵称 `nickname`、访问时间 `time`、首次访问时间 `firstVisitedAt`、最近访问时间 `lastVisitedAt`、微信唯一标识 `openId` 和访问次数 `count`。重复访问不会新增文档，只会更新同一个 `openId` 文档并将 `count` 加 1。

微信不再通过 `wx.getUserProfile` 返回真实头像昵称，当前流程使用 `button open-type="chooseAvatar"` 和 `input type="nickname"`。前端会把选择的头像读成 data URL 后缓存并通过云函数上报，因此不会被 `downloadFile` 合法域名配置阻塞。上报访问记录是异步执行的，不等待云函数返回即可进入主页面。
