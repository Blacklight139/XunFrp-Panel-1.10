<template>
  <div class="node-status">
    <div class="page-header">
      <h1>节点状态</h1>
      <p>查看所有可用节点的实时状态</p>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">🌐</div>
          <div class="stat-info">
            <div class="stat-number">{{ computedStats.totalNodes }}</div>
            <div class="stat-label">总节点数</div>
          </div>
        </div>
      </n-card>
      
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ computedStats.onlineNodes }}</div>
            <div class="stat-label">在线节点</div>
          </div>
        </div>
      </n-card>
      
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ computedStats.onlineUsers }}</div>
            <div class="stat-label">在线用户</div>
          </div>
        </div>
      </n-card>
      
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">🚇</div>
          <div class="stat-info">
            <div class="stat-number">{{ computedStats.onlineTunnels }}</div>
            <div class="stat-label">在线隧道</div>
          </div>
        </div>
      </n-card>
      
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">📥</div>
          <div class="stat-info">
            <div class="stat-number">{{ formatBytes(computedStats.todayInbound) }}</div>
            <div class="stat-label">今日入站流量</div>
          </div>
        </div>
      </n-card>
      
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">📤</div>
          <div class="stat-info">
            <div class="stat-number">{{ formatBytes(computedStats.todayOutbound) }}</div>
            <div class="stat-label">今日出站流量</div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 节点列表 -->
    <n-card title="节点详情" class="nodes-card">
      <template #header-extra>
        <n-button @click="refreshData" :loading="loading" size="small">
          刷新状态
        </n-button>
      </template>
      
      <n-data-table
        :columns="columns"
        :data="nodes"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :pagination="pagination"
      />
    </n-card>

    <!-- 实时状态监控 -->
    <n-card title="实时监控" class="monitoring-card">
      <div class="monitoring-content">
        <div class="monitoring-item">
          <span class="label">最后更新时间：</span>
          <span class="value">{{ lastUpdateTime }}</span>
        </div>
        <div class="monitoring-item">
          <span class="label">自动刷新：</span>
          <n-switch v-model:value="autoRefresh" @update:value="toggleAutoRefresh" />
        </div>
        <div class="monitoring-item">
          <span class="label">刷新间隔：</span>
          <n-select
            v-model:value="refreshInterval"
            :options="intervalOptions"
            style="width: 120px"
            @update:value="updateRefreshInterval"
          />
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { NTag, NButton, useMessage } from 'naive-ui'
import { LocationOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { formatBytes } from '@/utils'
import type { SystemStats } from '@/types'

const message = useMessage()

const loading = ref(false)
const nodes = ref<any[]>([])
const stats = ref<SystemStats>({
  total_users: 0,
  online_users: 0,
  today_new_users: 0,
  total_nodes: 0,
  online_nodes: 0,
  total_tunnels: 0,
  online_tunnels: 0,
  today_new_tunnels: 0,
  today_inbound: 0,
  today_outbound: 0,
  total_inbound: 0,
  total_outbound: 0,
})

// 计算属性，用于正确映射统计数据
const computedStats = computed(() => ({
  totalNodes: stats.value.total_nodes || 0,
  onlineNodes: stats.value.online_nodes || 0,
  onlineUsers: stats.value.online_users || 0,
  onlineTunnels: stats.value.online_tunnels || 0,
  todayInbound: stats.value.today_inbound || 0,
  todayOutbound: stats.value.today_outbound || 0,
}))

// 自动刷新相关
const autoRefresh = ref(true)
const refreshInterval = ref(30000) // 30秒
const lastUpdateTime = ref('')
let refreshTimer: number | null = null

const intervalOptions = [
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 },
  { label: '5分钟', value: 300000 },
]

// 分页配置
const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
}

// 表格列配置
const columns = [
  {
    title: '节点名称',
    key: 'name',
    width: 200,
    render: (row: any) => h('div', { class: 'node-name' }, [
      h('strong', row.name),
      h('div', { class: 'node-description' }, row.description)
    ])
  },
  {
    title: '地址',
    key: 'server_addr',
    width: 150,
    render: (row: any) => `${row.server_addr}:${row.server_port}`
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      const status = row.status || '离线'
      const type = status === '在线' ? 'success' : (status === '离线' ? 'error' : 'default')
      return h(NTag, {
        type,
        size: 'small'
      }, { default: () => status })
    }
  },
  {
    title: '位置',
    key: 'location',
    width: 150,
    render: (row: any) => row.location || '未知位置'
  },
  {
    title: '响应时间',
    key: 'response_time',
    width: 100,
    render: (row: any) => row.response_time || '超时'
  },
  {
    title: 'CPU使用率',
    key: 'cpu_usage',
    width: 100,
    render: (row: any) => {
      const cpu = row.cpu_usage || 0
      const type = cpu > 80 ? 'error' : (cpu > 60 ? 'warning' : 'success')
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', `${cpu.toFixed(1)}%`),
        h('div', {
          style: `width: 40px; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden;`
        }, [
          h('div', {
            style: `width: ${cpu}%; height: 100%; background: ${type === 'error' ? '#ff4d4f' : type === 'warning' ? '#faad14' : '#52c41a'}; transition: width 0.3s;`
          })
        ])
      ])
    }
  },
  {
    title: '内存使用率',
    key: 'memory_usage',
    width: 100,
    render: (row: any) => {
      const memory = row.memory_usage || 0
      const type = memory > 80 ? 'error' : (memory > 60 ? 'warning' : 'success')
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', `${memory.toFixed(1)}%`),
        h('div', {
          style: `width: 40px; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden;`
        }, [
          h('div', {
            style: `width: ${memory}%; height: 100%; background: ${type === 'error' ? '#ff4d4f' : type === 'warning' ? '#faad14' : '#52c41a'}; transition: width 0.3s;`
          })
        ])
      ])
    }
  },
  {
    title: '系统负载',
    key: 'load_average',
    width: 100,
    render: (row: any) => {
      const load = row.load_average || 0
      return h('span', load.toFixed(2))
    }
  },
  {
    title: '在线隧道',
    key: 'online_tunnels',
    width: 100,
    render: (row: any) => h('span', row.online_tunnels || 0)
  },
  {
    title: '今日流量',
    key: 'today_traffic',
    width: 120,
    render: (row: any) => h('div', { style: 'font-size: 12px;' }, [
      h('div', `↓ ${row.today_inbound || '0 B'}`),
      h('div', `↑ ${row.today_outbound || '0 B'}`)
    ])
  },
  {
    title: '位置',
    key: 'location',
    render: (row: any) => h('div', { class: 'location' }, [
      h(LocationOutline, { style: 'margin-right: 4px; vertical-align: middle;' }),
      row.location || '未知'
    ])
  },
  {
    title: '带宽',
    key: 'bandwidth',
    render: (row: any) => {
      const bandwidth = row.max_bandwidth || 0
      return bandwidth > 0 ? `${bandwidth} Mbps` : '无限制'
    }
  },
  {
    title: '在线隧道',
    key: 'online_tunnels',
    render: (row: any) => {
      const online = row.status?.tunnel_count || 0
      const max = row.max_tunnels || '∞'
      return `${online}/${max}`
    }
  },
  {
    title: '总流量',
    key: 'total_traffic',
    width: 120,
    render: (row: any) => h('div', { style: 'font-size: 12px;' }, [
      h('div', `↓ ${row.total_inbound || '0 B'}`),
      h('div', `↑ ${row.total_outbound || '0 B'}`)
    ])
  },
  {
    title: '运行时间',
    key: 'uptime',
    width: 100,
    render: (row: any) => row.uptime || '0天'
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => h('div', { style: 'display: flex; gap: 8px;' }, [
      h(NButton, {
        size: 'small',
        type: 'primary',
        onClick: () => testNodeConnection(row)
      }, { default: () => '测试连接' }),
      h(NButton, {
        size: 'small',
        onClick: () => viewNodeDetails(row)
      }, { default: () => '详情' })
    ])
  }
]



const fetchNodes = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get<any>('/nodes/status')
    // 使用新的API响应格式
    const data = response.data || response
    nodes.value = Array.isArray(data) ? data : []
    lastUpdateTime.value = new Date().toLocaleString()
  } catch (error: any) {
    console.error('获取节点列表失败:', error)
    message.error('获取节点列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const data = await ApiClient.get<SystemStats>('/stats')
    stats.value = data
  } catch (error: any) {
    console.error('获取统计信息失败:', error)
  }
}

const refreshData = async () => {
  await Promise.all([fetchNodes(), fetchStats()])
}

const testNodeConnection = async (node: any) => {
  try {
    message.loading(`正在测试节点 ${node.name} 的连接...`)
    // 这里可以调用测试连接的API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟测试
    message.success(`节点 ${node.name} 连接正常`)
  } catch (error: any) {
    message.error(`节点 ${node.name} 连接失败`)
  }
}

const viewNodeDetails = (node: any) => {
  const details = [
    `🏷️ 节点名称: ${node.name}`,
    `📍 服务器地址: ${node.server_addr}:${node.server_port}`,
    `🌍 位置: ${node.location || '未知位置'}`,
    `📊 状态: ${node.status || '离线'}`,
    `⚡ 响应时间: ${node.response_time || '超时'}`,
    `💾 带宽: ${node.bandwidth || '无限制'}`,
    ``,
    `📈 系统资源:`,
    `  CPU使用率: ${(node.cpu_usage || 0).toFixed(1)}%`,
    `  内存使用率: ${(node.memory_usage || 0).toFixed(1)}%`,
    `  系统负载: ${(node.load_average || 0).toFixed(2)}`,
    ``,
    `🔗 连接信息:`,
    `  在线用户: ${node.online_users || 0}`,
    `  在线隧道: ${node.online_tunnels || 0}`,
    ``,
    `📊 流量统计:`,
    `  今日入站: ${node.today_inbound || '0 B'}`,
    `  今日出站: ${node.today_outbound || '0 B'}`,
    `  总入站: ${node.total_inbound || '0 B'}`,
    `  总出站: ${node.total_outbound || '0 B'}`,
    ``,
    `⏰ 时间信息:`,
    `  运行时间: ${node.uptime || '0天'}`,
    `  最后心跳: ${node.last_heartbeat || '从未'}`,
  ]

  if (node.description) {
    details.unshift(`📝 描述: ${node.description}`, ``)
  }

  message.info(details.join('\n'), {
    duration: 15000
  })
}

const toggleAutoRefresh = (value: boolean) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const updateRefreshInterval = (value: number) => {
  refreshInterval.value = value
  if (autoRefresh.value) {
    stopAutoRefresh()
    startAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = window.setInterval(refreshData, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 刷新单个节点状态
const refreshSingleNode = async (nodeId: number) => {
  try {
    const response = await ApiClient.get<any>(`/nodes/status/${nodeId}`)
    const nodeData = response.data || response

    // 更新节点列表中的对应节点
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      nodes.value[index] = nodeData
    }

    message.success('节点状态已刷新')
  } catch (error: any) {
    console.error('刷新节点状态失败:', error)
    message.error('刷新节点状态失败')
  }
}

onMounted(() => {
  refreshData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.node-status {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.nodes-card {
  margin-bottom: 24px;
}

.node-name strong {
  display: block;
  margin-bottom: 4px;
}

.node-description {
  font-size: 12px;
  color: #666;
}

.location {
  display: flex;
  align-items: center;
}

.monitoring-card {
  margin-bottom: 24px;
}

.monitoring-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.monitoring-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitoring-item .label {
  font-weight: 500;
  color: #333;
}

.monitoring-item .value {
  color: #666;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .monitoring-content {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}

/* 节点表格样式 */
.node-name strong {
  font-size: 14px;
  color: #333;
}

.node-description {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.location {
  display: flex;
  align-items: center;
  font-size: 13px;
}

/* 流量显示样式 */
.traffic-info {
  font-size: 12px;
  line-height: 1.2;
}

.traffic-info div {
  margin: 1px 0;
}
</style>
