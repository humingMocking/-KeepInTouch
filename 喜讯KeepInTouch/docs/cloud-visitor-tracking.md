# 云开发访客记录

1. 在微信云开发控制台确认环境 ID 与 `App.vue` 中的 `cloud1` 一致；如果不一致，替换为实际环境 ID。
2. 创建数据库集合 `keep_in_touch`，权限选择“所有用户不可读写”。
3. 将 `cloudfunctions/trackVisit` 上传并部署到云端。
4. HBuilderX 重新运行到微信开发者工具，打开主页即可产生一条记录。

云函数使用微信上下文生成 `openid`，使用数据库服务器时间生成 `visitedAt`；用户主动提供的 `nickname`、`avatarUrl` 以及页面的 `page`、`scene`、`referrer` 由页面调用时传入。未完成授权时不会打开请柬。
