# SBS Editor

## 目标

实现一个简明易用的 Web 页面，可以编辑支持 SBS 扩展的 Markdown 文本并预览效果。

## 需求与约束

- 编辑器主页面分为左右两栏，左边是编辑窗口，右边是预览区；
- 编辑器支持导入导出 Markdown 文件，支持 Markdown 语法高亮；可以选择 SBS widget 并插入代码；
- 点击预览或渲染按钮可以在预览区看到渲染后的效果；
- 后端直接调用 `sbs_renderer`，`sbs_renderer` 的一些定制选项参数可以方便地在页面上进行设定（如 `title` 和主题 *theme*）；
- 前端直接使用 `widgets` 内的前端代码；
- 整个 editor 可以作为一个 web app 方便的打包和部署；
- 编写一个简明的 shell 脚本，用于启动/停止 editor web app；
- 页面简洁、清晰、美观；
- 使用尽可能精简、主流、易于维护的技术栈。

## 技术方案

### 1. 技术栈 (Tech Stack)
- 后端：FastAPI (Python 3.11+)。
- 前端：Vanilla JS + CodeMirror 6。
- 预览：使用 `<iframe>` 隔离渲染环境，复用项目现有的 `sbs_renderer`。
- 依赖管理：使用 `uv`。

### 2. 系统架构 (Architecture)
- API 驱动：前端通过 API `/api/render` 获取渲染后的 HTML。
- 静态挂载：后端挂载 `widgets/` 目录，确保预览时能正确加载 SBS 组件。
- 隔离性：预览区采用 `<iframe>` 加载完整 HTML 文档，防止样式污染。

### 3. 核心 API
- `POST /api/render`: 接收 `text`, `theme`, `title`，返回完整的 HTML 字符串。
- 静态资源路由: 挂载编辑器的 UI 代码及项目的 `widgets` 目录。

### 4. 目录结构
```text
src/
  sbs_editor/
    static/         # 编辑器前端 (HTML, JS, CSS)
    main.py         # FastAPI 应用与接口
editor.sh           # 服务启动/停止脚本
```


