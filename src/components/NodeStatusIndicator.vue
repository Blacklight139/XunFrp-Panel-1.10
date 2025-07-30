<template>
  <div class="node-status-indicator">
    <!-- 状态点 -->
    <div 
      :class="['status-dot', statusClass]"
      :title="statusTooltip"
    ></div>
    
    <!-- 状态文本 -->
    <span class="status-text">{{ statusText }}</span>
    
    <!-- 响应时间 -->
    <span v-if="showResponseTime && responseTime > 0" class="response-time">
      {{ formatResponseTime(responseTime) }}
    </span>
    
    <!-- 最后检查时间 -->
    <span v-if="showLastCheck" class="last-check">
      {{ formatLastCheck(lastCheck) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  online?: boolean
  dashboard?: boolean
  responseTime?: number
  error?: string
  lastCheck?: number
  showResponseTime?: boolean
  showLastCheck?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  online: false,
  dashboard: false,
  responseTime: 0,
  error: '',
  lastCheck: 0,
  showResponseTime: true,
  showLastCheck: false,
  size: 'medium'
})

// 状态类名
const statusClass = computed(() => {
  if (props.online && props.dashboard) {
    return 'status-online'
  } else if (props.online) {
    return 'status-warning'
  } else {
    return 'status-offline'
  }
})

// 状态文本
const statusText = computed(() => {
  if (props.online && props.dashboard) {
    return '正常'
  } else if (props.online) {
    return '服务正常'
  } else {
    return '离线'
  }
})

// 状态提示
const statusTooltip = computed(() => {
  if (props.error) {
    return `状态: ${statusText.value}\n错误: ${props.error}`
  }
  return `状态: ${statusText.value}`
})

// 格式化响应时间
const formatResponseTime = (time: number): string => {
  if (time < 100) {
    return `${time}ms`
  } else if (time < 1000) {
    return `${time}ms`
  } else {
    return `${(time / 1000).toFixed(1)}s`
  }
}

// 格式化最后检查时间
const formatLastCheck = (timestamp: number): string => {
  if (!timestamp) return '从未检查'
  
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`
  } else {
    return `${Math.floor(diff / 86400)}天前`
  }
}
</script>

<style scoped>
.node-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.status-dot.status-online {
  background-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.status-dot.status-online::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background-color: rgba(82, 196, 26, 0.3);
  animation: pulse 2s infinite;
}

.status-dot.status-warning {
  background-color: #faad14;
  box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
}

.status-dot.status-offline {
  background-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.status-text {
  font-weight: 500;
  color: #333;
}

.response-time {
  color: #666;
  font-size: 11px;
  background-color: #f5f5f5;
  padding: 1px 4px;
  border-radius: 2px;
}

.last-check {
  color: #999;
  font-size: 11px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 大小变体 */
.node-status-indicator[data-size="small"] {
  font-size: 11px;
  gap: 4px;
}

.node-status-indicator[data-size="small"] .status-dot {
  width: 6px;
  height: 6px;
}

.node-status-indicator[data-size="large"] {
  font-size: 14px;
  gap: 8px;
}

.node-status-indicator[data-size="large"] .status-dot {
  width: 10px;
  height: 10px;
}
</style>
