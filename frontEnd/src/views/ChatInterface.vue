<template>
  <div class="chat-layout">
    <!-- 会话侧边栏 -->
    <SessionSidebar
      :sessions="sessions"
      :current-session-id="currentSessionId"
      @new="createSession"
      @switch="switchSession"
      @rename="handleRename"
      @delete="handleDeleteSession"
    />

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 顶部标题栏 -->
      <header class="chat-header">
        <div class="header-title">
          <span class="title-text">主聊天窗口</span>
          <a-tag color="arcoblue" size="small" class="mode-tag">对话模式</a-tag>
        </div>
        <div class="header-actions">
          <a-tooltip content="查看代码" position="bottom">
            <a-button type="text" class="header-btn">
              <template #icon><icon-code /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="设置" position="bottom">
            <a-button type="text" class="header-btn">
              <template #icon><icon-settings /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="历史记录" position="bottom">
            <a-button type="text" class="header-btn">
              <template #icon><icon-history /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="更多" position="bottom">
            <a-button type="text" class="header-btn">
              <template #icon><icon-down /></template>
            </a-button>
          </a-tooltip>
        </div>
      </header>

      <!-- 聊天内容区 -->
      <div class="chat-container" ref="chatContainer">
        <div class="chat-messages">
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :is-streaming="message.id === streamingMessageId"
            @copy="handleCopy"
            @regenerate="handleRegenerate"
            @delete="handleDelete"
            @rate="handleRate"
            @quote="handleQuote"
            @jump-to-quote="jumpToQuote"
          />

          <!-- 快捷问题 -->
          <QuickQuestions
            v-if="showQuickQuestions && suggestedQuestions.length > 0"
            :questions="suggestedQuestions"
            @select="handleQuickQuestion"
          />
        </div>
      </div>

      <!-- 输入区域 -->
      <ChatInput
        ref="chatInputRef"
        :is-loading="isLoading"
        :quoted-message="quotedMessage"
        @send="handleSend"
        @like="handleLike"
        @upload="handleUpload"
        @clear-quote="clearQuote"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconHistory,
  IconDown,
  IconCode,
  IconSettings
} from '@arco-design/web-vue/es/icon'

import SessionSidebar from '../components/chat/SessionSidebar.vue'
import ChatMessage from '../components/chat/ChatMessage.vue'
import ChatInput from '../components/chat/ChatInput.vue'
import QuickQuestions from '../components/chat/QuickQuestions.vue'
import { useChat } from '../composables/useChat.js'

const chatContainer = ref(null)
const chatInputRef = ref(null)

const {
  messages,
  sessions,
  currentSessionId,
  isLoading,
  streamingMessageId,
  suggestedQuestions,
  initChat,
  sendChatMessage,
  regenerate,
  deleteMessage,
  copyMessage,
  rateMessage,
  createSession,
  switchSession
} = useChat()

const quotedMessage = ref(null)
const showQuickQuestions = computed(() => {
  return messages.value.length > 0 && 
         messages.value[messages.value.length - 1].role === 'assistant' &&
         !isLoading.value
})

// 初始化
onMounted(() => {
  initChat()
})

// 自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 发送消息
const handleSend = async (content) => {
  if (!content.trim()) return

  await sendChatMessage(content, { quoteMessage: quotedMessage.value })
  quotedMessage.value = null
}

// 引用消息
const handleQuote = (message) => {
  quotedMessage.value = message
  // 聚焦输入框
  nextTick(() => {
    const textarea = document.querySelector('.chat-textarea textarea')
    if (textarea) textarea.focus()
  })
}

// 清除引用
const clearQuote = () => {
  quotedMessage.value = null
}

// 跳转到引用的消息
const jumpToQuote = (quoteId) => {
  const element = document.querySelector(`[data-message-id="${quoteId}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.classList.add('highlight')
    setTimeout(() => element.classList.remove('highlight'), 2000)
  }
}

// 重新生成
const handleRegenerate = async (messageId) => {
  await regenerate(messageId)
}

// 删除消息
const handleDelete = (messageId) => {
  deleteMessage(messageId)
  Message.success('消息已删除')
}

// 复制消息
const handleCopy = async (content) => {
  const success = await copyMessage(content)
  if (success) {
    Message.success('已复制到剪贴板')
  } else {
    Message.error('复制失败')
  }
}

// 评分
const handleRate = (messageId, rating) => {
  rateMessage(messageId, rating)
  Message.success(rating === 'up' ? '感谢您的认可' : '我们会继续改进')
}

// 快捷问题
const handleQuickQuestion = (question) => {
  if (chatInputRef.value) {
    chatInputRef.value.fillInput(question)
  }
}

// 点赞
const handleLike = (liked) => {
  console.log('点赞状态:', liked)
}

// 上传文件
const handleUpload = (files) => {
  Message.success(`已选择 ${files.length} 个文件`)
}

// 重命名会话
const handleRename = (session) => {
  console.log('重命名会话:', session)
}

// 删除会话
const handleDeleteSession = (session) => {
  console.log('删除会话:', session)
}
</script>

<style scoped lang="scss">
.chat-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #fff;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

// 顶部标题栏
.chat-header {
  height: 56px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.mode-tag {
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-btn {
  color: #4e5969;
  width: 32px;
  height: 32px;
  padding: 0;

  &:hover {
    color: #165dff;
    background: #f2f3f5;
  }
}

// 聊天内容区
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  background: #fff;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
}

// 高亮动画
:deep(.highlight) {
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  0% { background: rgba(22, 93, 255, 0.1); }
  100% { background: transparent; }
}

// 滚动条样式
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c9cdd4;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #86909c;
}
</style>