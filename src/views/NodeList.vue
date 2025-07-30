<template>
  <div class="node-list">
    <div class="container">
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
      <div class="nodes-section">
        <h2>节点列表</h2>
        <div class="node-grid">
          <n-card
            v-for="node in nodes"
            :key="node.id"
            class="node-card"
            :class="{ 
              online: node.status === 'online',
              offline: node.status === 'offline',
              banned: node.is_banned,
              disabled: !node.is_active
            }"
          >
            <template #header>
              <div class="node-header">
                <div class="node-info">
                  <h3>{{ node.name }}</h3>
                  <div class="node-location">
                    <n-icon><LocationOutline /></n-icon>
                    {{ node.country }} {{ node.region }} {{ node.city }}
                  </div>
                </div>
                <div class="node-status">
                  <n-tag :type="getNodeStatusType(node.status)" size="small">
                    {{ getNodeStatusName(node.status) }}
                  </n-tag>
                </div>
              </div>
            </template>

            <div class="node-details">
              <div class="detail-row">
                <span class="label">服务器地址:</span>
                <span class="value">{{ node.server_addr }}:{{ node.server_port }}</span>
              </div>
              <div class="detail-row">
                <span class="label">描述:</span>
                <span class="value">{{ node.description || '暂无描述' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">在线用户:</span>
                <span class="value">{{ node.online_users }}</span>
              </div>
              <div class="detail-row">
                <span class="label">在线隧道:</span>
                <span class="value">{{ node.online_tunnels }} / {{ node.max_tunnels || '无限制' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">最大带宽:</span>
                <span class="value">{{ formatBandwidth(node.max_bandwidth) }}</span>
              </div>
              <div class="detail-row" v-if="node.last_heartbeat">
                <span class="label">最后心跳:</span>
                <span class="value">{{ formatRelativeTime(node.last_heartbeat) }}</span>
              </div>
            </div>

            <template #footer>
              <div class="node-stats">
                <div class="stat-item">
                  <span class="stat-label">今日入站</span>
                  <span class="stat-value">{{ formatBytes(node.today_inbound) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">今日出站</span>
                  <span class="stat-value">{{ formatBytes(node.today_outbound) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">总入站</span>
                  <span class="stat-value">{{ formatBytes(node.total_inbound) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">总出站</span>
                  <span class="stat-value">{{ formatBytes(node.total_outbound) }}</span>
                </div>
              </div>
            </template>
          </n-card>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && nodes.length === 0" class="empty-state">
        <div class="empty-icon">🌐</div>
        <h3>暂无可用节点</h3>
        <p>请联系管理员添加节点</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { LocationOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { formatBytes, formatBandwidth, formatRelativeTime, getNodeStatusName } from '@/utils'
import type { Node, SystemStats } from '@/types'

const message = useMessage()

const loading = ref(false)
const nodes = ref<Node[]>([])
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

let refreshTimer: number | null = null

const getNodeStatusType = (status: string) => {
  const statusTypes: Record<string, string> = {
    online: 'success',
    offline: 'default',
    banned: 'error',
    disabled: 'warning',
  }
  return statusTypes[status] || 'default'
}

const fetchNodes = async () => {
  try {
    loading.value = true
    const data = await ApiClient.get<Node[]>('/nodes')
    nodes.value = data.filter(node => node.is_active && !node.is_banned)
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

onMounted(async () => {
  await refreshData()
  
  // 每30秒刷新一次数据
  refreshTimer = window.setInterval(refreshData, 30 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.node-list {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 12px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.nodes-section h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.node-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #e2e8f0;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.node-card.online {
  border-left-color: #10b981;
}

.node-card.offline {
  border-left-color: #6b7280;
}

.node-card.banned {
  border-left-color: #ef4444;
  opacity: 0.7;
}

.node-card.disabled {
  border-left-color: #f59e0b;
  opacity: 0.8;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.node-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.node-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.875rem;
}

.node-details {
  margin: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #64748b;
  font-size: 0.875rem;
}

.value {
  color: #1e293b;
  font-weight: 500;
  font-size: 0.875rem;
}

.node-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-item .stat-value {
  display: block;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
}

.loading-state p {
  margin-top: 1rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .node-grid {
    grid-template-columns: 1fr;
  }
  
  .node-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .node-stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}
</style>
