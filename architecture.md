# Architectural Notes

这里记录我关于项目技术架构及实现方案的思考。

技术上我们需要实现两个部分：
- Web Widgets：完全基于标准 Web 技术（HTML/CSS/JS）实现 sbs-ext 项目的各类 widgets，并打包为可复用的组件。
- Markdown 渲染器扩展：基于现有的 Markdown 渲染器实现 sbs-ext 自定义扩展，识别特定标记语法，并将其转换为对应的 widget。

## Web Widgets

- **技术选型**：采用 **Web Components (Custom Elements)** 标准开发。
- **优势**：原生支持，不依赖特定框架，可嵌入任何 Web 环境。
- **开发流程**：先在 `prototype` 目录使用静态 HTML/JS 进行预研和验证，确认效果后再封装为 Web Component 放入 `widgets` 目录。
- **特性**：
    - 可配置：通过 HTML 属性或子元素传递参数。
    - 模块化：独立分发，共享通用样式。

## Markdown 渲染器扩展

- **目标库**：首选 **`markdown-it-py`** 进行开发，保持与 CommonMark 生态的一致性。
- **设计目标**：保持扩展逻辑的通用性，以便未来适配其他渲染器（如 `python-markdown`）。
- **职责**：专注于解析 SBS 语法（`<!-- sbs-xxx -->` + 代码块），将其转换为对应的 Web Component 标签（如 `<sbs-bridge>...</sbs-bridge>`）。
- **代码结构**：Python 源码存放于 `src` 目录。

## 目录结构

- `src/`: Python 渲染器扩展源码。
- `widgets/`: Web Components 源码及资源。
- `prototype/`: Widget 功能预研与静态 HTML 验证环境。

## Widget 具体实现

在以上总体框架基本确定后，一个个实现具体的组件，顺序为：桥牌 Bridge、国际象棋 Chess、围棋 Go。