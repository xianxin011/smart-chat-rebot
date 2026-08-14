# Coze Studio 完整版聊天界面

基于 Vite + Vue3 + Arco Design Vue 实现的 Coze Studio "预览与调试" 完整功能复刻。

## ✨ 完整功能列表

### 核心聊天功能
- ✅ **流式输出** - 打字机效果，逐字显示AI回复
- ✅ **Markdown渲染** - 支持代码高亮、表格、列表、引用等
- ✅ **代码块** - 带语言标识和复制按钮的代码展示
- ✅ **消息状态** - 发送中/流式中/完成/错误/重新生成中

### 消息操作
- ✅ **复制** - 复制消息内容到剪贴板
- ✅ **重新生成** - 重新生成AI回复
- ✅ **删除** - 删除单条消息
- ✅ **点赞/点踩** - 对消息进行评分
- ✅ **引用回复** - 引用某条消息进行回复

### 智能功能
- ✅ **插件调用展示** - 显示调用的插件（代码执行、工作流等）
- ✅ **知识库引用** - 显示知识库来源和置信度
- ✅ **快捷问题** - 三个预设问题，点击自动填充
- ✅ **Token消耗** - 显示延迟时间和Token使用量

### 会话管理
- ✅ **会话列表** - 左侧会话历史列表
- ✅ **新建会话** - 创建新对话
- ✅ **切换会话** - 在不同会话间切换
- ✅ **会话操作** - 重命名、删除会话

### 输入功能
- ✅ **多行输入** - 支持换行（Shift+Enter）
- ✅ **快捷发送** - Enter发送，Shift+Enter换行
- ✅ **文件上传** - 支持上传文件（弹窗选择）
- ✅ **输入状态** - 聚焦高亮、加载状态

## 🚀 快速开始

### 安装依赖
```bash
cd coze-chat-full
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:8888

## 📁 项目结构

```
coze-chat-full/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatMessage.vue      # 消息组件（核心）
│   │       ├── ChatInput.vue        # 输入组件
│   │       ├── QuickQuestions.vue   # 快捷问题
│   │       └── SessionSidebar.vue   # 会话侧边栏
│   ├── composables/
│   │   ├── useChat.js               # 聊天逻辑
│   │   └── useMarkdown.js           # Markdown渲染
│   ├── utils/
│   │   └── mockApi.js               # Mock API
│   ├── views/
│   │   └── ChatInterface.vue        # 主界面
│   ├── App.vue
│   └── main.js
├── package.json
├── vite.config.js
└── index.html
```

## 🎮 交互演示

### 1. 基础对话
- 在输入框输入文字，按 Enter 发送
- AI会逐字流式输出回复

### 2. Markdown支持
输入包含以下内容的提问：
- "code" / "python" - 展示代码块
- "知识" / "什么是" - 展示知识库引用
- "工作流" / "workflow" - 展示插件调用

### 3. 消息操作
- 鼠标悬停在AI消息上显示操作按钮
- 点击"重新生成"获取新的回复
- 点击"复制"复制消息内容
- 点击点赞/点踩进行评分

### 4. 快捷问题
- 点击底部的三个问题按钮
- 问题自动填入输入框

### 5. 会话管理
- 点击"新对话"创建会话
- 点击会话列表切换历史会话
- 悬停会话显示更多操作

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| Vite | 构建工具 |
| Arco Design Vue | UI组件库 |
| Markdown-it | Markdown解析 |
| Highlight.js | 代码高亮 |
| UUID | 生成唯一ID |

## 📝 Mock API说明

所有数据通过 `src/utils/mockApi.js` 模拟：

- `sendMessage()` - 模拟流式发送消息
- `regenerateMessage()` - 模拟重新生成
- `getSuggestedQuestions()` - 获取建议问题

根据用户输入的关键词返回不同的模拟回复：
- 代码相关 → 返回Python代码示例
- 知识相关 → 返回带知识库引用的回复
- 工作流相关 → 返回插件调用展示

## 🔧 扩展开发

### 添加新的消息类型
在 `ChatMessage.vue` 中添加新的展示逻辑：

```vue
<div v-if="message.type === 'newType'" class="new-type">
  <!-- 自定义展示 -->
</div>
```

### 添加新的插件展示
在 `mockApi.js` 的 `generateResponse` 中添加：

```javascript
if (lowerMsg.includes('新插件')) {
  return {
    content: '回复内容',
    plugins: ['new-plugin']
  }
}
```

## 📄 许可证

MIT License
