<template>
  <div 
    class="message-item" 
    :class="[message.role === 'assistant' ? 'ai-message' : 'user-message', { 'streaming': isStreaming }]"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- 头像 -->
    <div class="message-avatar">
      <div class="avatar-wrapper" :class="message.avatar === 'ai' ? 'ai-avatar' : 'user-avatar'">
        <icon-robot v-if="message.avatar === 'ai'" class="avatar-icon" />
        <icon-user v-else class="avatar-icon" />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="message-content">
      <!-- 发送者名称 -->
      <div class="message-sender">{{ message.sender }}</div>

      <!-- 引用消息（如果是回复） -->
      <div v-if="message.quote" class="message-quote-preview" @click="jumpToQuote(message.quote.id)">
        <div class="quote-line"></div>
        <div class="quote-info">
          <div class="quote-sender">{{ message.quote.sender }}</div>
          <div class="quote-text">{{ message.quote.content }}</div>
        </div>
      </div>

      <!-- 消息气泡 -->
      <div class="message-bubble" :class="message.role === 'assistant' ? 'ai-bubble' : 'user-bubble'">
        <!-- Markdown 内容 -->
        <div 
          v-if="message.role === 'assistant'" 
          class="bubble-content markdown-body"
          v-html="renderedContent"
        ></div>
        <div v-else class="bubble-content">{{ message.content }}</div>

        <!-- 流式输出光标 -->
        <span v-if="isStreaming" class="streaming-cursor">▋</span>
      </div>

      <!-- 插件调用展示 -->
      <div v-if="message.plugins && message.plugins.length > 0" class="message-plugins">
        <div v-for="plugin in message.plugins" :key="plugin" class="plugin-tag">
          <icon-tool class="plugin-icon" />
          <span>{{ getPluginName(plugin) }}</span>
        </div>
      </div>

      <!-- 知识库引用 -->
      <div v-if="message.knowledge" class="message-knowledge">
        <div class="knowledge-header">
          <icon-book class="knowledge-icon" />
          <span>引用自：{{ message.knowledge.source }}</span>
          <span class="knowledge-confidence">置信度：{{ (message.knowledge.confidence * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <!-- 元信息和操作 -->
      <div v-if="message.role === 'assistant' && message.status !== 'error'" class="message-meta">
        <div class="meta-left">
          <span v-if="message.latency" class="meta-info">{{ message.latency }}s</span>
          <span v-if="message.tokens" class="meta-info">{{ message.tokens }} Tokens</span>
          <span v-if="message.regenerated" class="regenerated-tag">已重新生成</span>
        </div>

        <div class="message-actions" :class="{ 'visible': showActions }">
          <a-tooltip content="引用" position="top">
            <a-button type="text" size="mini" class="action-btn" @click="handleQuote">
              <template #icon><icon-quote /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="复制" position="top">
            <a-button type="text" size="mini" class="action-btn" @click="handleCopy">
              <template #icon><icon-copy /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="重新生成" position="top">
            <a-button 
              type="text" 
              size="mini" 
              class="action-btn"
              :loading="message.status === 'regenerating'"
              @click="handleRegenerate"
            >
              <template #icon><icon-refresh /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="删除" position="top">
            <a-button type="text" size="mini" class="action-btn delete-btn" @click="handleDelete">
              <template #icon><icon-delete /></template>
            </a-button>
          </a-tooltip>

          <a-divider direction="vertical" class="action-divider" />

          <a-tooltip content="有用" position="top">
            <a-button 
              type="text" 
              size="mini" 
              class="action-btn"
              :class="{ 'active': message.rating === 'up' }"
              @click="handleRate('up')"
            >
              <template #icon><icon-thumb-up /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="无用" position="top">
            <a-button 
              type="text" 
              size="mini" 
              class="action-btn"
              :class="{ 'active': message.rating === 'down' }"
              @click="handleRate('down')"
            >
              <template #icon><icon-thumb-down /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 用户消息的操作（只有引用和删除） -->
      <div v-if="message.role === 'user'" class="message-meta user-meta">
        <div class="message-actions" :class="{ 'visible': showActions }">
          <a-tooltip content="引用" position="top">
            <a-button type="text" size="mini" class="action-btn" @click="handleQuote">
              <template #icon><icon-quote /></template>
            </a-button>
          </a-tooltip>

          <a-tooltip content="删除" position="top">
            <a-button type="text" size="mini" class="action-btn delete-btn" @click="handleDelete">
              <template #icon><icon-delete /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-if="message.status === 'error'" class="message-error">
        <icon-exclamation-circle class="error-icon" />
        <span>发送失败，请重试</span>
        <a-button type="text" size="small" @click="handleRegenerate">重试</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMarkdown } from '../../composables/useMarkdown.js'
import {
  IconRobot,
  IconUser,
  IconCopy,
  IconRefresh,
  IconDelete,
  IconThumbUp,
  IconThumbDown,
  IconTool,
  IconBook,
  IconExclamationCircle,
  IconQuote
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['copy', 'regenerate', 'delete', 'rate', 'quote', 'jump-to-quote'])

const { render } = useMarkdown()
const showActions = ref(false)

const renderedContent = computed(() => {
  return render(props.message.content)
})

const getPluginName = (pluginId) => {
  const pluginNames = {
    'code-interpreter': '代码执行',
    'workflow-engine': '工作流',
    'web-search': '网页搜索'
  }
  return pluginNames[pluginId] || pluginId
}

const handleQuote = () => {
  emit('quote', {
    id: props.message.id,
    content: props.message.content,
    sender: props.message.sender,
    role: props.message.role
  })
}

const handleCopy = () => {
  emit('copy', props.message.content)
}

const handleRegenerate = () => {
  emit('regenerate', props.message.id)
}

const handleDelete = () => {
  emit('delete', props.message.id)
}

const handleRate = (rating) => {
  emit('rate', props.message.id, rating)
}

const jumpToQuote = (quoteId) => {
  emit('jump-to-quote', quoteId)
}
</script>

<style scoped lang="scss">
.message-item {
  display: flex;
  gap: 12px;
  padding: 8px 20px;
  animation: fadeIn 0.3s ease-in-out;
  position: relative;

  &:hover {
    .message-actions {
      opacity: 1;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// 头像
.message-avatar {
  flex-shrink: 0;
}

.avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar {
  background: linear-gradient(135deg, #a8d8ea 0%, #7fcdbb 100%);
}

.user-avatar {
  background: #4c6ef5;
}

.avatar-icon {
  font-size: 20px;
  color: #fff;
}

// 内容区
.message-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-size: 13px;
  color: #86909c;
  font-weight: 500;
}

// 引用预览（消息中的引用）
.message-quote-preview {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8f4f8;
  }

  .quote-line {
    width: 3px;
    background: #165dff;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .quote-info {
    flex: 1;
    min-width: 0;
  }

  .quote-sender {
    font-size: 12px;
    color: #165dff;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .quote-text {
    font-size: 13px;
    color: #4e5969;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
  }
}

// 消息气泡
.message-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.6;
  position: relative;
}

.ai-bubble {
  background: #f2f3f5;
  color: #1d2129;
}

.user-bubble {
  background: #4c6ef5;
  color: #fff;
  align-self: flex-start;
}

.bubble-content {
  font-size: 14px;
  line-height: 1.6;
}

// Markdown 样式
:deep(.markdown-body) {
  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 { font-size: 20px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }

  p {
    margin: 8px 0;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
  }

  pre {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
  }

  blockquote {
    margin: 12px 0;
    padding: 12px 16px;
    background: #e8f4f8;
    border-left: 4px solid #165dff;
    border-radius: 4px;
    color: #4e5969;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;

    th, td {
      border: 1px solid #e5e6eb;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #f7f8fa;
      font-weight: 600;
    }
  }

  a {
    color: #165dff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 代码块样式
:deep(.code-block-wrapper) {
  margin: 12px 0;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;

  .code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f7f8fa;
    border-bottom: 1px solid #e5e6eb;

    .code-lang {
      font-size: 12px;
      color: #86909c;
      text-transform: uppercase;
    }

    .copy-code-btn {
      font-size: 12px;
      color: #165dff;
      background: transparent;
      border: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .code-block {
    margin: 0;
    padding: 16px;
    background: #fafafa;
    overflow-x: auto;

    code {
      background: transparent;
      padding: 0;
      font-size: 13px;
      line-height: 1.6;
    }
  }
}

// 流式光标
.streaming-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  background: #165dff;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 插件标签
.message-plugins {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.plugin-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e8f4f8;
  border-radius: 4px;
  font-size: 12px;
  color: #165dff;

  .plugin-icon {
    font-size: 12px;
  }
}

// 知识库引用
.message-knowledge {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #bae0fd;
}

.knowledge-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #165dff;

  .knowledge-icon {
    font-size: 14px;
  }

  .knowledge-confidence {
    margin-left: auto;
    color: #86909c;
  }
}

// 元信息
.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-left: 4px;

  &.user-meta {
    justify-content: flex-end;
  }
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-info {
  font-size: 12px;
  color: #86909c;
}

.regenerated-tag {
  font-size: 12px;
  color: #165dff;
  background: #e8f4f8;
  padding: 2px 6px;
  border-radius: 4px;
}

// 操作按钮
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  &.visible {
    opacity: 1;
  }
}

.action-btn {
  color: #86909c;
  width: 28px;
  height: 28px;
  padding: 0;

  &:hover {
    color: #165dff;
    background: #f2f3f5;
  }

  &.active {
    color: #165dff;
    background: #e8f4f8;
  }
}

.delete-btn:hover {
  color: #f53f3f;
  background: #ffece8;
}

.action-divider {
  height: 16px;
  margin: 0 4px;
}

// 错误状态
.message-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffece8;
  border-radius: 6px;
  color: #f53f3f;
  font-size: 13px;
  margin-top: 8px;

  .error-icon {
    font-size: 16px;
  }
}
</style>