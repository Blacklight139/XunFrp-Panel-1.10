<template>
  <div class="node-selector">
    <n-card title="选择节点" size="large">
      <template #header-extra>
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索节点名称或ID..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
      </template>

      <n-spin :show="loading">
        <div v-if="filteredNodes.length === 0" class="empty-state">
          <n-empty description="暂无可用节点" />
        </div>
        
        <div v-else class="nodes-grid">
          <div
            v-for="node in filteredNodes"
            :key="node.id"
            class="node-card"
            :class="{ 
              'selected': selectedNodeId === node.id,
              'disabled': !node.is_active || node.is_banned || node.status !== 'online'
            }"
            @click="selectNode(node)"
          >
            <!-- 节点状态指示器 -->
            <div class="node-status">
              <n-tag
                :type="getNodeStatusType(node)"
                size="small"
                round
              >
                {{ getNodeStatusText(node) }}
              </n-tag>
            </div>

            <!-- 节点基本信息 -->
            <div class="node-header">
              <h3 class="node-name">{{ node.name }}</h3>
              <div class="node-id">ID: {{ node.id }}</div>
            </div>

            <!-- 节点详细信息 -->
            <div class="node-info">
              <div class="info-row">
                <span class="label">地址:</span>
                <span class="value">{{ node.server_addr }}:{{ node.server_port }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">位置:</span>
                <span class="value">{{ node.location || '未知' }}</span>
              </div>

              <div class="info-row">
                <span class="label">隧道数:</span>
                <span class="value">{{ node.tunnel_count || 0 }} / {{ node.max_tunnels || '∞' }}</span>
              </div>
            </div>

            <!-- 节点性能指标 -->
            <div class="node-metrics">
              <div class="metric">
                <div class="metric-label">CPU</div>
                <n-progress
                  type="line"
                  :percentage="node.cpu_usage || 0"
                  :color="getMetricColor(node.cpu_usage || 0)"
                  :show-indicator="false"
                  :height="6"
                />
                <div class="metric-value">{{ (node.cpu_usage || 0).toFixed(1) }}%</div>
              </div>

              <div class="metric">
                <div class="metric-label">内存</div>
                <n-progress
                  type="line"
                  :percentage="node.memory_usage || 0"
                  :color="getMetricColor(node.memory_usage || 0)"
                  :show-indicator="false"
                  :height="6"
                />
                <div class="metric-value">{{ (node.memory_usage || 0).toFixed(1) }}%</div>
              </div>

              <div class="metric">
                <div class="metric-label">负载</div>
                <n-progress
                  type="line"
                  :percentage="Math.min((node.load_average || 0) * 25, 100)"
                  :color="getLoadColor(node.load_average || 0)"
                  :show-indicator="false"
                  :height="6"
                />
                <div class="metric-value">{{ (node.load_average || 0).toFixed(2) }}</div>
              </div>
            </div>

            <!-- 选中指示器 -->
            <div v-if="selectedNodeId === node.id" class="selected-indicator">
              <n-icon :component="CheckmarkCircle" size="24" color="#18a058" />
            </div>

            <!-- 离线遮罩 -->
            <div v-if="!node.is_active || node.is_banned || node.status !== 'online'" class="offline-overlay">
              <div class="offline-text">
                <span v-if="!node.is_active">节点已禁用</span>
                <span v-else-if="node.is_banned">节点已封禁</span>
                <span v-else>节点离线</span>
              </div>
            </div>
          </div>
        </div>
      </n-spin>

      <template #footer>
        <div class="footer-actions">
          <n-button @click="$emit('cancel')">
            取消
          </n-button>
          <n-button
            type="primary"
            :disabled="!selectedNodeId"
            @click="nextStep"
          >
            下一步
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SearchOutline, CheckmarkCircle } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { useMessage } from 'naive-ui'

interface Node {
  id: number
  name: string
  server_addr: string
  server_port: number
  location?: string
  is_active: boolean
  is_banned: boolean
  status: string
  tunnel_count?: number
  max_tunnels?: number
  cpu_usage?: number
  memory_usage?: number
  load_average?: number
}

const emit = defineEmits(['next', 'cancel'])
const message = useMessage()

const loading = ref(false)
const nodes = ref<Node[]>([])
const selectedNodeId = ref<number | null>(null)
const searchQuery = ref('')

// 过滤节点
const filteredNodes = computed(() => {
  if (!searchQuery.value) return nodes.value
  
  const query = searchQuery.value.toLowerCase()
  return nodes.value.filter(node => 
    node.name.toLowerCase().includes(query) ||
    node.id.toString().includes(query) ||
    node.server_addr.toLowerCase().includes(query)
  )
})

// 获取节点状态类型
const getNodeStatusType = (node: Node) => {
  if (!node.is_active) return 'default'
  if (node.is_banned) return 'warning'
  if (node.status === 'online') return 'success'
  return 'error'
}

// 获取节点状态文本
const getNodeStatusText = (node: Node) => {
  if (!node.is_active) return '已禁用'
  if (node.is_banned) return '已封禁'
  if (node.status === 'online') return '在线'
  return '离线'
}

// 获取指标颜色
const getMetricColor = (value: number) => {
  if (value < 50) return '#18a058'
  if (value < 80) return '#f0a020'
  return '#d03050'
}

// 获取负载颜色
const getLoadColor = (value: number) => {
  if (value < 1) return '#18a058'
  if (value < 2) return '#f0a020'
  return '#d03050'
}

// 选择节点
const selectNode = (node: Node) => {
  if (!node.is_active || node.is_banned || node.status !== 'online') {
    message.warning('该节点不可用')
    return
  }
  selectedNodeId.value = node.id
}

// 下一步
const nextStep = () => {
  if (!selectedNodeId.value) {
    message.warning('请选择一个节点')
    return
  }
  
  const selectedNode = nodes.value.find(n => n.id === selectedNodeId.value)
  emit('next', selectedNode)
}

// 获取节点列表
const fetchNodes = async () => {
  try {
    loading.value = true
    const data = await ApiClient.get<Node[]>('/nodes')
    nodes.value = data
  } catch (error: any) {
    console.error('获取节点列表失败:', error)
    message.error('获取节点列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNodes()
})
</script>

<style scoped>
.node-selector {
  max-width: 1200px;
  margin: 0 auto;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.node-card {
  position: relative;
  border: 2px solid #e0e0e6;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.node-card:hover:not(.disabled) {
  border-color: #18a058;
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.15);
}

.node-card.selected {
  border-color: #18a058;
  background: #f6ffed;
}

.node-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.node-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.node-header {
  margin-bottom: 12px;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.node-id {
  font-size: 12px;
  color: #666;
}

.node-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.node-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.metric-value {
  width: 45px;
  font-size: 12px;
  color: #333;
  text-align: right;
}

.selected-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
}

.offline-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.offline-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>
