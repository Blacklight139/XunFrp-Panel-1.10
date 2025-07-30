<template>
  <div class="frp-node-management">
    <div class="page-header">
      <h1>FRP节点管理</h1>
      <p>管理和监控所有FRP服务节点</p>
    </div>

    <!-- 节点统计卡片 -->
    <div class="stats-cards">
      <n-card title="总节点数" class="stat-card">
        <div class="stat-number">{{ totalNodes }}</div>
        <div class="stat-label">个节点</div>
      </n-card>
      <n-card title="在线节点" class="stat-card">
        <div class="stat-number">{{ realTimeOnlineNodes }}</div>
        <div class="stat-label">个在线</div>
      </n-card>
      <n-card title="总隧道数" class="stat-card">
        <div class="stat-number">{{ totalTunnels }}</div>
        <div class="stat-label">条隧道</div>
      </n-card>
      <n-card title="活跃用户" class="stat-card">
        <div class="stat-number">{{ activeUsers }}</div>
        <div class="stat-label">个用户</div>
      </n-card>
    </div>

    <!-- 搜索和筛选 -->
    <n-card class="search-card">
      <n-space>
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索节点名称或地址"
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
        <n-select
          v-model:value="statusFilter"
          placeholder="筛选状态"
          style="width: 150px"
          :options="statusOptions"
          @update:value="handleStatusFilter"
        />
        <n-button type="primary" @click="refreshNodes">
          <template #icon>
            <n-icon :component="RefreshOutline" />
          </template>
          刷新节点
        </n-button>
        <n-button @click="refreshStatus">
          <template #icon>
            <n-icon :component="RefreshOutline" />
          </template>
          刷新状态
        </n-button>
      </n-space>
    </n-card>

    <!-- 节点列表 -->
    <n-card title="节点列表">
      <n-data-table
        :columns="columns"
        :data="filteredNodes"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row) => row.id"
      />
    </n-card>

    <!-- 节点详情模态框 -->
    <n-modal v-model:show="detailModalVisible" preset="card" title="节点详情" style="width: 800px">
      <div v-if="selectedNode">
        <n-tabs type="line" animated>
          <n-tab-pane name="info" tab="基本信息">
            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="节点名称">{{ selectedNode.name }}</n-descriptions-item>
              <n-descriptions-item label="服务器地址">{{ selectedNode.server_addr }}</n-descriptions-item>
              <n-descriptions-item label="服务端口">{{ selectedNode.server_port }}</n-descriptions-item>
              <n-descriptions-item label="管理端口">{{ selectedNode.dashboard_port }}</n-descriptions-item>
              <n-descriptions-item label="配置状态">
                <n-tag :type="selectedNode.is_active && !selectedNode.is_banned ? 'success' : 'error'">
                  {{ selectedNode.is_active && !selectedNode.is_banned ? '正常' : '异常' }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="实时状态">
                <NodeStatusIndicator
                  v-if="selectedNode && nodeStatuses.get(selectedNode.id)"
                  :online="nodeStatuses.get(selectedNode.id)?.status.online"
                  :dashboard="nodeStatuses.get(selectedNode.id)?.status.dashboard"
                  :response-time="nodeStatuses.get(selectedNode.id)?.status.response_time"
                  :error="nodeStatuses.get(selectedNode.id)?.status.error"
                  :last-check="nodeStatuses.get(selectedNode.id)?.status.last_check"
                  :show-last-check="true"
                  size="large"
                />
                <span v-else>检查中...</span>
              </n-descriptions-item>
              <n-descriptions-item label="创建时间">{{ formatDate(selectedNode.created_at) }}</n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>
          
          <n-tab-pane name="stats" tab="统计信息">
            <div v-if="nodeStats">
              <n-grid :cols="2" :x-gap="16" :y-gap="16">
                <n-grid-item>
                  <n-statistic label="总隧道数" :value="nodeStats.total_tunnels" />
                </n-grid-item>
                <n-grid-item>
                  <n-statistic label="活跃隧道" :value="nodeStats.active_tunnels" />
                </n-grid-item>
                <n-grid-item>
                  <n-statistic label="TCP隧道" :value="nodeStats.tcp_tunnels" />
                </n-grid-item>
                <n-grid-item>
                  <n-statistic label="HTTP隧道" :value="nodeStats.http_tunnels" />
                </n-grid-item>
                <n-grid-item>
                  <n-statistic label="使用用户" :value="nodeStats.total_users" />
                </n-grid-item>
                <n-grid-item>
                  <n-statistic label="总流量" :value="formatBytes(nodeStats.total_traffic)" />
                </n-grid-item>
              </n-grid>
            </div>
            <n-spin v-else />
          </n-tab-pane>
          
          <n-tab-pane name="config" tab="配置文件">
            <n-code
              :code="nodeConfig"
              language="ini"
              show-line-numbers
              style="max-height: 400px"
            />
            <n-space style="margin-top: 16px">
              <n-button type="primary" @click="downloadConfig">下载配置</n-button>
              <n-button @click="copyConfig">复制配置</n-button>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-modal>

    <!-- 连接测试模态框 -->
    <n-modal v-model:show="testModalVisible" preset="dialog" title="连接测试">
      <div v-if="testResult">
        <n-result
          :status="testResult.status === 'success' ? 'success' : 'error'"
          :title="testResult.status === 'success' ? '连接成功' : '连接失败'"
        >
          <template #footer>
            <n-space vertical>
              <div v-if="testResult.status === 'success'">
                <p>HTTP状态码: {{ testResult.http_code }}</p>
                <p>响应延迟: {{ testResult.latency }}</p>
              </div>
              <div v-else>
                <p>错误信息: {{ testResult.error }}</p>
              </div>
            </n-space>
          </template>
        </n-result>
      </div>
      <n-spin v-else />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, h } from 'vue'
import { 
  NCard, NDataTable, NButton, NTag, NSpace, NInput, NSelect, NIcon, 
  NModal, NTabs, NTabPane, NDescriptions, NDescriptionsItem, NGrid, 
  NGridItem, NStatistic, NCode, NSpin, NResult, useMessage 
} from 'naive-ui'
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { nodeStatusService, type NodeStatusInfo } from '@/services/nodeStatusService'
import NodeStatusIndicator from '@/components/NodeStatusIndicator.vue'

interface Node {
  id: number
  name: string
  server_addr: string
  server_port: number
  dashboard_port: number
  dashboard_user: string
  dashboard_password: string
  is_active: boolean
  is_banned: boolean
  created_at: string
  tunnel_count: number
  // 实时状态信息
  online?: boolean
  dashboard_online?: boolean
  response_time?: number
  status_error?: string
  last_check?: number
}

interface NodeStats {
  total_tunnels: number
  active_tunnels: number
  tcp_tunnels: number
  udp_tunnels: number
  http_tunnels: number
  https_tunnels: number
  total_users: number
  total_traffic: number
}

interface TestResult {
  status: string
  http_code?: number
  latency?: string
  error?: string
}

const message = useMessage()

// 响应式数据
const loading = ref(false)
const nodes = ref<Node[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const detailModalVisible = ref(false)
const testModalVisible = ref(false)
const selectedNode = ref<Node | null>(null)
const nodeStats = ref<NodeStats | null>(null)
const nodeConfig = ref('')
const testResult = ref<TestResult | null>(null)
const nodeStatuses = ref<Map<number, NodeStatusInfo>>(new Map())

// 状态筛选选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: 'active' },
  { label: '异常', value: 'inactive' }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

// 计算属性
const filteredNodes = computed(() => {
  let result = nodes.value

  if (searchQuery.value) {
    result = result.filter(node => 
      node.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      node.server_addr.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      result = result.filter(node => node.is_active && !node.is_banned)
    } else if (statusFilter.value === 'inactive') {
      result = result.filter(node => !node.is_active || node.is_banned)
    }
  }

  return result
})

const totalNodes = computed(() => nodes.value.length)
const onlineNodes = computed(() => nodes.value.filter(node => node.is_active && !node.is_banned).length)
const realTimeOnlineNodes = computed(() => {
  let count = 0
  nodeStatuses.value.forEach(statusInfo => {
    if (statusInfo.status.online) {
      count++
    }
  })
  return count
})
const totalTunnels = computed(() => nodes.value.reduce((sum, node) => sum + node.tunnel_count, 0))
const activeUsers = computed(() => {
  // 这里应该从API获取实际的活跃用户数
  return Math.floor(totalTunnels.value * 0.7) // 临时计算
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
    key: 'name',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '服务器地址',
    key: 'server_addr'
  },
  {
    title: '端口',
    key: 'server_port',
    width: 100
  },
  {
    title: '隧道数',
    key: 'tunnel_count',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 150,
    render: (row: Node) => {
      const statusInfo = nodeStatuses.value.get(row.id)
      if (!statusInfo) {
        return h(NTag, { type: 'default' }, { default: () => '检查中...' })
      }

      const { online, dashboard } = statusInfo.status
      let type: 'success' | 'warning' | 'error' = 'error'
      let text = '离线'

      if (online && dashboard) {
        type = 'success'
        text = '正常'
      } else if (online) {
        type = 'warning'
        text = '服务正常'
      }

      return h('div', { style: 'display: flex; flex-direction: column; gap: 2px;' }, [
        h(NTag, { type, size: 'small' }, { default: () => text }),
        statusInfo.status.response_time > 0 && h('span', {
          style: 'font-size: 11px; color: #666; text-align: center;'
        }, `${statusInfo.status.response_time}ms`)
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 300,
    render: (row: Node) => {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            onClick: () => showNodeDetail(row)
          }, { default: () => '详情' }),
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => testConnection(row)
          }, { default: () => '测试' }),
          h(NButton, {
            size: 'small',
            type: 'warning',
            onClick: () => restartNode(row)
          }, { default: () => '重启' })
        ]
      })
    }
  }
]

// 方法
const fetchNodes = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/admin/frp/nodes')
    nodes.value = response.data.data
  } catch (error: any) {
    console.error('获取节点列表失败:', error)
    message.error(error.message || '获取节点列表失败')
  } finally {
    loading.value = false
  }
}

const showNodeDetail = async (node: Node) => {
  selectedNode.value = node
  detailModalVisible.value = true
  
  // 获取节点统计信息
  try {
    const statsResponse = await ApiClient.get(`/admin/frp/nodes/${node.id}/stats`)
    nodeStats.value = statsResponse.data.data
  } catch (error) {
    console.error('获取节点统计失败:', error)
  }
  
  // 获取节点配置
  try {
    const configResponse = await ApiClient.get(`/admin/frp/nodes/${node.id}/config`)
    nodeConfig.value = configResponse.data.data.config
  } catch (error) {
    console.error('获取节点配置失败:', error)
  }
}

const testConnection = async (node: Node) => {
  selectedNode.value = node
  testModalVisible.value = true
  testResult.value = null
  
  try {
    const response = await ApiClient.post(`/admin/frp/nodes/${node.id}/test`)
    testResult.value = response.data.data
  } catch (error: any) {
    console.error('连接测试失败:', error)
    testResult.value = {
      status: 'failed',
      error: error.message || '测试失败'
    }
  }
}

const restartNode = async (node: Node) => {
  try {
    await ApiClient.post(`/admin/frp/nodes/${node.id}/restart`)
    message.success(`节点 ${node.name} 重启指令已发送`)
  } catch (error: any) {
    console.error('重启节点失败:', error)
    message.error(error.message || '重启失败')
  }
}

const refreshNodes = () => {
  fetchNodes()
}

const refreshStatus = async () => {
  try {
    await nodeStatusService.refreshStatus()
    message.success('状态刷新成功')
  } catch (error: any) {
    console.error('刷新状态失败:', error)
    message.error(error.message || '刷新状态失败')
  }
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleStatusFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadConfig = () => {
  const blob = new Blob([nodeConfig.value], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `frps_${selectedNode.value?.name}.ini`
  a.click()
  window.URL.revokeObjectURL(url)
}

const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(nodeConfig.value)
    message.success('配置已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 状态监控相关方法
const startStatusMonitoring = () => {
  // 添加状态变化监听器
  nodeStatusService.addListener('frp-node-management', (statuses: NodeStatusInfo[]) => {
    const statusMap = new Map<number, NodeStatusInfo>()
    statuses.forEach(status => {
      statusMap.set(status.id, status)
    })
    nodeStatuses.value = statusMap
  })

  // 开始监控（每30秒检查一次）
  nodeStatusService.startMonitoring(30000)
}

const stopStatusMonitoring = () => {
  nodeStatusService.removeListener('frp-node-management')
  nodeStatusService.stopMonitoring()
}

onMounted(() => {
  fetchNodes()
  startStatusMonitoring()
})

onUnmounted(() => {
  stopStatusMonitoring()
})
</script>

<style scoped>
.frp-node-management {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #18a058;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.search-card {
  margin-bottom: 24px;
}
</style>
