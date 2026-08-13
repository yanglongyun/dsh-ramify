<p align="center">
  <img src="media/ramify-logo.svg" alt="Ramify" width="96" />
</p>

# dsh-ramify

Ramify 是 DeepSeek Harness 的创意分支与可视化迭代插件。它让 Agent 把多个创作方向、真实作品和后续修订组织成一棵可实时查看、比较和继续分叉的树。

![Ramify 创意树画布](media/ramify-canvas.png)

## 特性

- 原生 DSH 工具：项目、树、批量节点、作品完成、节点更新和界面设置。
- 原生 DSH Client UI：侧栏 Ramify 入口与全屏工作台，不必离开 Harness。
- 安装后自动启动本地画布，不需要单独运行 CLI。
- HTML、Markdown、SVG、图片、视频和音频作品可直接预览。
- SQLite 本地持久化与 Server-Sent Events 实时更新。
- 服务固定绑定 `127.0.0.1`，不接收或存储模型 API Key。
- 插件卸载时清理自己启动的运行时；已有 Ramify 实例会被复用而不会被关闭。

## 环境要求

- Node.js 22.19 或更高版本
- DeepSeek Harness 0.1.0-rc.5 或兼容版本

## 安装

### 本地开发版本

```sh
git clone https://github.com/yanglongyun/dsh-ramify.git
cd dsh-ramify
npm install
npm run build

dsh plugin --profile web add "$PWD"
dsh web
```

### npm 发布后

```sh
dsh plugin --profile web add @ramify/dsh-ramify
dsh web
```

启动后可直接点击 DSH 左侧栏底部的 **Ramify** 打开内置工作台。Agent 的工具结果只引导用户使用这个内置入口，不暴露底层 loopback 地址。工作台顶部仍保留“在新窗口打开”按钮，作为可选的独立窗口模式。

## 使用

向 DSH Agent 描述一个适合比较多个方向的任务，例如：

> 使用 Ramify 为这个 AI 搜索产品探索三个明显不同的落地页方向，做出可预览页面让我比较。

插件向模型注册以下工具：

| 工具 | 用途 |
|---|---|
| `ramify_start` | 启动或连接画布 |
| `ramify_project_create` | 创建项目与根节点 |
| `ramify_project_list` | 列出项目 |
| `ramify_project_tree` | 读取完整创意树 |
| `ramify_node_add` | 添加单个节点或作品占位符 |
| `ramify_node_batch` | 原子化创建多层节点树 |
| `ramify_node_complete` | 写入 HTML、Markdown、SVG 或媒体作品 |
| `ramify_node_update` | 更新标题、文本或树位置 |
| `ramify_settings` | 切换主题和界面语言 |

## 配置

用户可以在 profile 的 `cordis.patch.yml` 中覆盖插件配置：

```yaml
- id: ramify
  name: '@ramify/dsh-ramify'
  config:
    port: 9519
    dataDir: '/absolute/path/to/ramify-data'
    startupTimeoutMs: 5000
    shutdownTimeoutMs: 3000
```

`dataDir` 省略时使用平台默认目录：

- macOS：`~/Library/Application Support/Ramify/`
- Windows：`%APPDATA%/Ramify/`
- Linux：`${XDG_DATA_HOME:-~/.local/share}/ramify/`

服务地址固定为 loopback，这是安全约束，不提供公网绑定配置。

## 开发

```sh
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

构建产物 `lib/` 与 `app/dist/` 会提交到仓库，因此从本地 checkout 或 Git 安装时不需要执行安装期构建脚本。

浏览器端通过包清单中的 `dsh.client` 声明加载，界面只注册 DSH 提供的 `sidebar.footer.action` 与 `shell.overlay` 插槽，并复用 Harness 提供的 React 运行时。

## 许可证

[MIT](LICENSE)。第三方依赖许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
