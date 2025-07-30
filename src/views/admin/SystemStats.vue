<template>
  <div class="system-stats">
    <n-grid :cols="1" :x-gap="24" :y-gap="24">
      <!-- 系统概览 -->
      <n-grid-item>
        <n-card title="系统概览" class="stats-card">
          <n-grid :cols="4" :x-gap="16">
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-icon user">
                  <n-icon size="32"><PeopleOutline /></n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.total_users }}</div>
                  <div class="stat-label">总用户数</div>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-icon tunnel">
                  <n-icon size="32"><ServerOutline /></n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.total_tunnels }}</div>
                  <div class="stat-label">总隧道数</div>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-icon node">
                  <n-icon size="32"><CloudOutline /></n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ overview.total_nodes }}</div>
                  <div class="stat-label">总节点数</div>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-icon traffic">
                  <n-icon size="32"><StatsChartOutline /></n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatTraffic(overview.total_traffic) }}</div>
                  <div class="stat-label">总流量</div>
                </div>
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- 实时状态 -->
      <n-grid-item>
        <n-card title="实时状态" class="stats-card">
          <n-grid :cols="3" :x-gap="16">
            <n-grid-item>
              <div class="status-item">
                <div class="status-label">在线用户</div>
                <div class="status-value online">{{ realtime.online_users }}</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="status-item">
                <div class="status-label">活跃隧道</div>
                <div class="status-value active">{{ realtime.active_tunnels }}</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="status-item">
                <div class="status-label">在线节点</div>
                <div class="status-value success">{{ realtime.online_nodes }}</div>
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- 用户统计 -->
      <n-grid-item>
        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-card title="用户组分布" class="stats-card">
              <div class="chart-container">
                <div v-for="group in userGroups" :key="group.name" class="group-item">
                  <div class="group-info">
                    <span class="group-name">{{ group.name }}</span>
                    <span class="group-count">{{ group.count }}</span>
                  </div>
                  <div class="group-bar">
                    <div 
                      class="group-progress" 
                      :style="{ width: `${(group.count / overview.total_users) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="隧道类型分布" class="stats-card">
              <div class="chart-container">
                <div v-for="type in tunnelTypes" :key="type.name" class="type-item">
                  <div class="type-info">
                    <span class="type-name">{{ type.name }}</span>
                    <span class="type-count">{{ type.count }}</span>
                  </div>
                  <div class="type-bar">
                    <div 
                      class="type-progress" 
                      :style="{ width: `${(type.count / overview.total_tunnels) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-grid-item>

      <!-- 系统资源 -->
      <n-grid-item>
        <n-card title="系统资源" class="stats-card">
          <n-grid :cols="4" :x-gap="16">
            <n-grid-item>
              <div class="resource-item">
                <div class="resource-label">CPU使用率</div>
                <n-progress
                  type="circle"
                  :percentage="systemResources.cpu_usage"
                  :color="getProgressColor(systemResources.cpu_usage)"
                />
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="resource-item">
                <div class="resource-label">内存使用率</div>
                <n-progress
                  type="circle"
                  :percentage="systemResources.memory_usage"
                  :color="getProgressColor(systemResources.memory_usage)"
                />
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="resource-item">
                <div class="resource-label">磁盘使用率</div>
                <n-progress
                  type="circle"
                  :percentage="systemResources.disk_usage"
                  :color="getProgressColor(systemResources.disk_usage)"
                />
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="resource-item">
                <div class="resource-label">网络负载</div>
                <n-progress
                  type="circle"
                  :percentage="systemResources.network_load"
                  :color="getProgressColor(systemResources.network_load)"
                />
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  PeopleOutline,
  ServerOutline,
  CloudOutline,
  StatsChartOutline
} from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const message = useMessage()

// 响应式数据
const overview = ref({
  total_users: 0,
  total_tunnels: 0,
  total_nodes: 0,
  total_traffic: 0
})

const realtime = ref({
  online_users: 0,
  active_tunnels: 0,
  online_nodes: 0
})

const userGroups = ref([
  { name: '管理员', count: 0 },
  { name: 'VIP用户', count: 0 },
  { name: '普通用户', count: 0 }
])

const tunnelTypes = ref([
  { name: 'TCP', count: 0 },
  { name: 'UDP', count: 0 },
  { name: 'HTTP', count: 0 },
  { name: 'HTTPS', count: 0 }
])

const systemResources = ref({
  cpu_usage: 0,
  memory_usage: 0,
  disk_usage: 0,
  network_load: 0
})

let refreshTimer: NodeJS.Timeout | null = null

// 格式化流量
const formatTraffic = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#18a058'
  if (percentage < 80) return '#f0a020'
  return '#d03050'
}

// 获取系统统计
const fetchSystemStats = async () => {
  try {
    const response = await ApiClient.get('/admin/stats/overview')
    
    overview.value = {
      total_users: response.total_users || 0,
      total_tunnels: response.total_tunnels || 0,
      total_nodes: response.total_nodes || 0,
      total_traffic: response.total_traffic || 0
    }

    realtime.value = {
      online_users: response.online_users || 0,
      active_tunnels: response.active_tunnels || 0,
      online_nodes: response.online_nodes || 0
    }

    // 用户组分布
    if (response.user_groups) {
      userGroups.value = [
        { name: '管理员', count: response.user_groups.admin || 0 },
        { name: 'VIP用户', count: response.user_groups.vip || 0 },
        { name: '普通用户', count: response.user_groups.user || 0 }
      ]
    }

    // 隧道类型分布
    if (response.tunnel_types) {
      tunnelTypes.value = [
        { name: 'TCP', count: response.tunnel_types.tcp || 0 },
        { name: 'UDP', count: response.tunnel_types.udp || 0 },
        { name: 'HTTP', count: response.tunnel_types.http || 0 },
        { name: 'HTTPS', count: response.tunnel_types.https || 0 }
      ]
    }

    // 系统资源
    if (response.system_resources) {
      systemResources.value = {
        cpu_usage: Math.round(response.system_resources.cpu_usage || 0),
        memory_usage: Math.round(response.system_resources.memory_usage || 0),
        disk_usage: Math.round(response.system_resources.disk_usage || 0),
        network_load: Math.round(response.system_resources.network_load || 0)
      }
    }
  } catch (error: any) {
    console.error('获取系统统计失败:', error)
    message.error('获取系统统计失败')
  }
}

// 开始定时刷新
const startRefresh = () => {
  fetchSystemStats()
  refreshTimer = setInterval(fetchSystemStats, 30000) // 每30秒刷新一次
}

// 停止定时刷新
const stopRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  startRefresh()
})

onUnmounted(() => {
  stopRefresh()
})
</script>

<style scoped>
.system-stats {
  padding: 0;
}

.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.user { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.tunnel { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.node { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.traffic { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.status-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 2rem;
  font-weight: 700;
}

.status-value.online { color: #18a058; }
.status-value.active { color: #2080f0; }
.status-value.success { color: #36ad6a; }

.chart-container {
  padding: 1rem 0;
}

.group-item, .type-item {
  margin-bottom: 1rem;
}

.group-info, .type-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.group-name, .type-name {
  font-weight: 500;
  color: #333;
}

.group-count, .type-count {
  font-weight: 600;
  color: #18a058;
}

.group-bar, .type-bar {
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.group-progress, .type-progress {
  height: 100%;
  background: linear-gradient(90deg, #18a058 0%, #36ad6a 100%);
  transition: width 0.3s ease;
}

.resource-item {
  text-align: center;
  padding: 1rem;
}

.resource-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .status-value {
    font-size: 1.5rem;
  }
}
</style>
