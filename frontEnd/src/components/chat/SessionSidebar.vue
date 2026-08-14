<template>
  <div class="session-sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <a-button type="primary" long class="new-chat-btn" @click="handleNewChat">
        <template #icon><icon-plus /></template>
        新对话
      </a-button>
    </div>

    <div class="session-list">
      <div class="list-title">最近对话</div>
      <div 
        v-for="session in sessions" 
        :key="session.id"
        class="session-item"
        :class="{ 'active': currentSessionId === session.id }"
        @click="handleSwitch(session.id)"
      >
        <icon-message class="session-icon" />
        <div class="session-info">
          <div class="session-title">{{ session.title }}</div>
          <div class="session-time">{{ formatTime(session.updatedAt) }}</div>
        </div>
        <a-dropdown trigger="hover" position="br">
          <a-button type="text" size="mini" class="session-more" @click.stop>
            <template #icon><icon-more /></template>
          </a-button>
          <template #content>
            <a-doption @click="handleRename(session)">重命名</a-doption>
            <a-doption @click="handleDelete(session)" style="color: #f53f3f">删除</a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>

    <div class="sidebar-footer">
      <a-button type="text" long class="collapse-btn" @click="handleCollapse">
        <template #icon>
          <icon-left v-if="!collapsed" />
          <icon-right v-else />
        </template>
        {{ collapsed ? '' : '收起侧边栏' }}
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  IconPlus,
  IconMessage,
  IconMore,
  IconLeft,
  IconRight
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  currentSessionId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['new', 'switch', 'rename', 'delete'])

const collapsed = ref(false)

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const handleNewChat = () => {
  emit('new')
}

const handleSwitch = (sessionId) => {
  emit('switch', sessionId)
}

const handleRename = (session) => {
  emit('rename', session)
}

const handleDelete = (session) => {
  emit('delete', session)
}

const handleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped lang="scss">
.session-sidebar {
  width: 260px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;

  &.collapsed {
    width: 60px;

    .sidebar-header,
    .session-list,
    .collapse-btn span {
      display: none;
    }
  }
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.new-chat-btn {
  background: #165dff;
  border-color: #165dff;

  &:hover {
    background: #4080ff;
    border-color: #4080ff;
  }
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.list-title {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
  padding-left: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;

  &:hover {
    background: #f7f8fa;

    .session-more {
      opacity: 1;
    }
  }

  &.active {
    background: #e8f4f8;

    .session-title {
      color: #165dff;
    }
  }
}

.session-icon {
  font-size: 16px;
  color: #86909c;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.session-title {
  font-size: 14px;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.session-time {
  font-size: 12px;
  color: #86909c;
}

.session-more {
  opacity: 0;
  color: #86909c;
  padding: 4px;

  &:hover {
    color: #165dff;
    background: transparent;
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e6eb;
}

.collapse-btn {
  color: #86909c;
  justify-content: flex-start;

  &:hover {
    color: #165dff;
    background: #f7f8fa;
  }
}
</style>