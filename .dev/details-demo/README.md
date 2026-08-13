# DSH Details demo

一次性开发夹具，用来观察 DSH `details` single/session 插槽的真实行为。

```sh
npm run build
cd /Users/woodchange/Desktop/deepseek-harness
pnpm dsh plugin --profile web add /Users/woodchange/Desktop/dsh-ramify/.dev/details-demo
pnpm dsh web --port 3099
```

点击侧栏底部的 **Details 测试**。测试结束后卸载：

```sh
pnpm dsh plugin --profile web remove @ramify/dsh-details-demo
```
