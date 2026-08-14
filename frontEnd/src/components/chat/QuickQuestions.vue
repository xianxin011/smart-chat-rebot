<template>
  <div class="quick-questions">
    <div class="questions-header">
      <icon-bulb class="header-icon" />
      <span>你可以这样问我</span>
    </div>
    <div class="questions-list">
      <div 
        v-for="(question, index) in questions" 
        :key="index"
        class="question-item"
        @click="handleClick(question)"
      >
        <span class="question-text">{{ question }}</span>
        <icon-right class="question-arrow" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconBulb, IconRight } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const handleClick = (question) => {
  emit('select', question)
}
</script>

<style scoped lang="scss">
.quick-questions {
  padding: 0 20px 20px 68px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.questions-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #86909c;

  .header-icon {
    font-size: 14px;
    color: #ffb800;
  }
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;

  &:hover {
    border-color: #165dff;
    background: #f7f8fa;

    .question-arrow {
      color: #165dff;
      transform: translateX(4px);
    }
  }
}

.question-text {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.5;
  flex: 1;
  margin-right: 12px;
}

.question-arrow {
  font-size: 14px;
  color: #c9cdd4;
  transition: all 0.2s;
  flex-shrink: 0;
}
</style>