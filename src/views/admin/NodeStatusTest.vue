<template>
  <div class="node-status-test">
    <div class="page-header">
      <h1>节点状态监控测试</h1>
      <p>测试节点状态实时监控功能</p>
    </div>

    <!-- 控制面板 -->
    <n-card title="监控控制" class="control-panel">
      <n-space>
        <n-button 
          type="primary" 
          @click="startMonitoring" 
          :disabled="isMonitoring"
        >
          开始监控
        </n-button>
        <n-button 
          @click="stopMonitoring" 
          :disabled="!isMonitoring"
        >
          停止监控
        </n-button>
        <n-button @click="refreshStatus">
          手动刷新
        </n-button>
        <n-input-number 
          v-model:value="intervalSeconds" 
          :min="5" 
          :max="300" 
          suffix="秒"
          style="width: 120px"
        />
        <span>监控间隔</span>
      </n-space>
    </n-card>

    <!-- 状态总览 -->
    <n-card title="状态总览" class="status-overview">
      <n-grid :cols="4" :x-gap="16">
        <n-grid-item>
          <n-statistic label="总节点数" :value="totalNodes" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="在线节点" :value="onlineNodes" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="面板正常" :value="dashboardOkNodes" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="平均响应时间" :value="avgResponseTime + 'ms'" />
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 节点状态列表 -->
    <n-card title="节点状态详情">
      <n-data-table
        :columns="columns"
        :data="nodeStatusList"
        :loading="loading"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- 状态历史图表 -->
    <n-card title="状态历史" class="status-history">
      <div class="chart-container">
        <div v-if="statusHistory.length === 0" class="no-data">
          暂无历史数据
        </div>
        <div v-else class="history-list">
          <div 
            v-for="(record, index) in statusHistory.slice(-10)" 
            :key="index"
            class="history-item"
          >
            <span class="time">{{ formatTime(record.timestamp) }}</span>
            <span class="online">在线: {{ record.online }}</span>
            <span class="total">总数: {{ record.total }}</span>
            <span class="avg-time">平均: {{ record.avgResponseTime }}ms</span>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { 
  NCard, NButton, NSpace, NInputNumber, NGrid, NGridItem, 
  NStatistic, NDataTable, useMessage 
} from 'naive-ui'
import { nodeStatusService, type NodeStatusInfo } from '@/services/nodeStatusService'
import NodeStatusIndicator from '@/components/NodeStatusIndicator.vue'

const message = useMessage()

// 响应式数据
const loading = ref(false)
const isMonitoring = ref(false)
const intervalSeconds = ref(30)
const nodeStatusList = ref<NodeStatusInfo[]>([])
const statusHistory = ref<Array<{
  timestamp: number
  online: number
  total: number
  avgResponseTime: number
}>>([])

// 计算属性
const totalNodes = computed(() => nodeStatusList.value.length)
const onlineNodes = computed(() => 
  nodeStatusList.value.filter(node => node.status.online).length
)
const dashboardOkNodes = computed(() => 
  nodeStatusList.value.filter(node => node.status.dashboard).length
)
const avgResponseTime = computed(() => {
  const validTimes = nodeStatusList.value
    .map(node => node.status.response_time)
    .filter(time => time > 0)
  
  if (validTimes.length === 0) return 0
  return Math.round(validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length)
})

// 表格列定义
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '节点名称',
    key: 'name'
  },
  {
    title: '状态',
    key: 'status',
    width: 200,
    render: (row: NodeStatusInfo) => {
      return h(NodeStatusIndicator, {
        online: row.status.online,
        dashboard: row.status.dashboard,
        responseTime: row.status.response_time,
        error: row.status.error,
        lastCheck: row.status.last_check,
        showLastCheck: true,
        size: 'medium'
      })
    }
  },
  {
    title: '响应时间',
    key: 'response_time',
    width: 120,
    render: (row: NodeStatusInfo) => {
      return row.status.response_time > 0 ? `${row.status.response_time}ms` : '-'
    }
  },
  {
    title: '错误信息',
    key: 'error',
    render: (row: NodeStatusInfo) => {
      return row.status.error || '-'
    }
  },
  {
    title: '最后检查',
    key: 'last_check',
    width: 150,
    render: (row: NodeStatusInfo) => {
      return formatLastCheck(row.status.last_check)
    }
  }
]

// 方法
const startMonitoring = () => {
  if (isMonitoring.value) return
  
  isMonitoring.value = true
  
  // 添加状态监听器
  nodeStatusService.addListener('status-test', (statuses: NodeStatusInfo[]) => {
    nodeStatusList.value = statuses
    
    // 记录历史数据
    const now = Date.now()
    const online = statuses.filter(s => s.status.online).length
    const total = statuses.length
    const validTimes = statuses
      .map(s => s.status.response_time)
      .filter(t => t > 0)
    const avgTime = validTimes.length > 0 
      ? Math.round(validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length)
      : 0
    
    statusHistory.value.push({
      timestamp: now,
      online,
      total,
      avgResponseTime: avgTime
    })
    
    // 只保留最近50条记录
    if (statusHistory.value.length > 50) {
      statusHistory.value = statusHistory.value.slice(-50)
    }
  })
  
  // 开始监控
  nodeStatusService.startMonitoring(intervalSeconds.value * 1000)
  message.success('状态监控已启动')
}

const stopMonitoring = () => {
  if (!isMonitoring.value) return
  
  isMonitoring.value = false
  nodeStatusService.removeListener('status-test')
  nodeStatusService.stopMonitoring()
  message.info('状态监控已停止')
}

const refreshStatus = async () => {
  try {
    loading.value = true
    const statuses = await nodeStatusService.refreshStatus()
    nodeStatusList.value = statuses
    message.success('状态刷新成功')
  } catch (error: any) {
    console.error('刷新状态失败:', error)
    message.error(error.message || '刷新状态失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const formatLastCheck = (timestamp: number): string => {
  if (!timestamp) return '从未检查'
  
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else {
    return `${Math.floor(diff / 3600)}小时前`
  }
}

onMounted(() => {
  // 初始加载
  refreshStatus()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.node-status-test {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.control-panel {
  margin-bottom: 24px;
}

.status-overview {
  margin-bottom: 24px;
}

.status-history {
  margin-top: 24px;
}

.chart-container {
  min-height: 200px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.history-item .time {
  color: #666;
  min-width: 80px;
}

.history-item .online {
  color: #52c41a;
  font-weight: 500;
}

.history-item .total {
  color: #1890ff;
}

.history-item .avg-time {
  color: #fa8c16;
}
</style>
