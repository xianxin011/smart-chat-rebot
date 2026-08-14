<template>
  <div class="chat-input-area">
    <!-- 引用消息条 -->
    <div v-if="quotedMessage" class="quoted-message-bar">
      <div class="quote-content-wrapper">
        <div class="quote-icon-wrapper">
          <icon-quote class="quote-icon" />
        </div>
        <div class="quote-details">
          <div class="quote-header">
            <span class="quote-label">引用</span>
            <span class="quote-sender">{{ quotedMessage.sender }}</span>
          </div>
          <div class="quote-text">{{ quotedMessage.content }}</div>
        </div>
      </div>
      <a-button type="text" size="mini" class="close-quote" @click="clearQuote">
        <template #icon><icon-close /></template>
      </a-button>
    </div>

    <!-- 输入框主体 -->
    <div class="input-wrapper" :class="{ 'focused': isFocused }">
      <!-- 左侧操作按钮 -->
      <div class="input-left-actions">
        <a-tooltip content="点赞" position="top">
          <a-button type="text" class="action-btn" @click="handleLike">
            <template #icon>
              <icon-thumb-up class="action-icon" :class="{ 'active': liked }" />
            </template>
          </a-button>
        </a-tooltip>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <a-textarea
          v-model="inputValue"
          :placeholder="placeholder"
          :auto-size="{ minRows: 1, maxRows: 6 }"
          class="chat-textarea"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown="handleKeydown"
        />
      </div>

      <!-- 右侧操作按钮 -->
      <div class="input-right-actions">
        <a-tooltip content="添加附件" position="top">
          <a-button type="text" class="action-btn" @click="showUpload = true">
            <template #icon><icon-plus class="action-icon" /></template>
          </a-button>
        </a-tooltip>

        <a-divider direction="vertical" class="input-divider" />

        <a-button 
          type="primary" 
          shape="circle" 
          size="small"
          class="send-btn"
          :disabled="!canSend"
          :loading="isLoading"
          @click="handleSend"
        >
          <template #icon>
            <icon-send class="send-icon" />
          </template>
        </a-button>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="input-footer">
      <span class="footer-text">内容由AI生成，无法确保真实准确，仅供参考</span>
    </div>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:visible="showUpload"
      title="上传文件"
      @ok="handleUpload"
      @cancel="showUpload = false"
    >
      <a-upload
        drag
        :auto-upload="false"
        :limit="5"
        @change="handleFileChange"
      >
        <template #upload-button>
          <div class="upload-area">
            <icon-upload class="upload-icon" />
            <div class="upload-text">点击或拖拽文件到此处上传</div>
            <div class="upload-hint">支持 PDF、Word、TXT、图片等格式</div>
          </div>
        </template>
      </a-upload>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  IconThumbUp,
  IconPlus,
  IconSend,
  IconClose,
  IconQuote,
  IconUpload
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  placeholder: {
    type: String,
    default: '继续对话...'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  quotedMessage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['send', 'like', 'upload', 'clear-quote'])

const inputValue = ref('')
const isFocused = ref(false)
const liked = ref(false)
const showUpload = ref(false)
const uploadFiles = ref([])

const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !props.isLoading
})

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (!canSend.value) return

  emit('send', inputValue.value)
  inputValue.value = ''
}

const handleLike = () => {
  liked.value = !liked.value
  emit('like', liked.value)
}

const clearQuote = () => {
  emit('clear-quote')
}

const handleFileChange = (files) => {
  uploadFiles.value = files
}

const handleUpload = () => {
  if (uploadFiles.value.length > 0) {
    emit('upload', uploadFiles.value)
  }
  showUpload.value = false
  uploadFiles.value = []
}

// 快捷填充
const fillInput = (text) => {
  inputValue.value = text
}

defineExpose({
  fillInput
})
</script>

<style scoped lang="scss">
.chat-input-area {
  border-top: 1px solid #e5e6eb;
  background: #fff;
  flex-shrink: 0;
}

// 引用消息条 - Coze Studio 风格
.quoted-message-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quote-content-wrapper {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.quote-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quote-icon {
  font-size: 16px;
  color: #165dff;
}

.quote-details {
  flex: 1;
  min-width: 0;
}

.quote-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.quote-label {
  font-size: 12px;
  color: #165dff;
  background: #e8f4f8;
  padding: 2px 6px;
  border-radius: 4px;
}

.quote-sender {
  font-size: 13px;
  color: #1d2129;
  font-weight: 500;
}

.quote-text {
  font-size: 13px;
  color: #4e5969;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-quote {
  color: #86909c;
  flex-shrink: 0;
  margin-left: 8px;

  &:hover {
    color: #f53f3f;
  }
}

// 输入框包装
.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin: 12px 20px;
  padding: 8px 12px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  transition: all 0.2s;

  &.focused {
    border-color: #165dff;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
  }
}

// 左侧操作
.input-left-actions {
  display: flex;
  align-items: center;
  padding-bottom: 4px;
}

.action-btn {
  color: #86909c;
  width: 32px;
  height: 32px;
  padding: 0;

  &:hover {
    color: #165dff;
    background: transparent;
  }
}

.action-icon {
  font-size: 20px;

  &.active {
    color: #165dff;
  }
}

// 输入区域
.input-container {
  flex: 1;
  min-height: 36px;
}

:deep(.chat-textarea) {
  background: transparent;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  padding: 6px 0;

  &::placeholder {
    color: #86909c;
  }

  &:focus {
    box-shadow: none;
  }
}

// 右侧操作
.input-right-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 4px;
}

.input-divider {
  height: 20px;
  margin: 0 4px;
  background: #e5e6eb;
}

.send-btn {
  background: #165dff;
  border-color: #165dff;
  width: 32px;
  height: 32px;

  &:hover:not(:disabled) {
    background: #4080ff;
    border-color: #4080ff;
  }

  &:disabled {
    background: #c9cdd4;
    border-color: #c9cdd4;
    cursor: not-allowed;
  }
}

.send-icon {
  font-size: 16px;
}

// 底部提示
.input-footer {
  text-align: center;
  padding-bottom: 12px;
}

.footer-text {
  font-size: 12px;
  color: #c9cdd4;
}

// 上传区域
.upload-area {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #e5e6eb;
  border-radius: 8px;

  .upload-icon {
    font-size: 48px;
    color: #c9cdd4;
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: 14px;
    color: #1d2129;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 12px;
    color: #86909c;
  }
}
</style>