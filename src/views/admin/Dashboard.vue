<template>
  <div class="admin-dashboard">
    <div class="container">
      <div class="page-header">
        <h1>管理员面板</h1>
        <p>系统管理和监控</p>
      </div>

      <!-- 系统统计 -->
      <div class="stats-grid">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_users }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </n-card>
        
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🌐</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_nodes }}</div>
              <div class="stat-label">总节点数</div>
            </div>
          </div>
        </n-card>
        
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🚇</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total_tunnels }}</div>
              <div class="stat-label">总隧道数</div>
            </div>
          </div>
        </n-card>
        
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ formatBytes(stats.total_inbound + stats.total_outbound) }}</div>
              <div class="stat-label">总流量</div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 管理功能 -->
      <div class="admin-sections">
        <n-card title="用户管理" class="admin-section">
          <p>管理用户账户、权限和隧道配额</p>
          <n-button type="primary" @click="$router.push('/admin/users')">
            用户列表
          </n-button>
        </n-card>
        
        <n-card title="隧道管理" class="admin-section">
          <p>查看和管理所有用户的隧道</p>
          <n-button type="primary" @click="$router.push('/admin/tunnels')">
            隧道列表
          </n-button>
        </n-card>
        
        <n-card title="节点管理" class="admin-section">
          <p>添加、删除和管理服务器节点</p>
          <n-button type="primary" @click="$router.push('/admin/nodes')">
            节点管理
          </n-button>
        </n-card>

        <!-- 广告位管理已移至系统设置 -->

        <n-card title="系统设置" class="admin-section">
          <p>配置SMTP邮箱、签到系统等功能</p>
          <n-button type="primary" @click="$router.push('/admin/settings')">
            系统设置
          </n-button>
        </n-card>

        <n-card title="操作日志" class="admin-section">
          <p>查看管理员和用户的操作记录</p>
          <n-button type="primary" @click="$router.push('/admin/logs')">
            操作日志
          </n-button>
        </n-card>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatBytes } from '@/utils'
import type { SystemStats } from '@/types'

const message = useMessage()

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
  stat_date: '',
  created_at: '',
  updated_at: '',
})

const fetchStats = async () => {
  try {
    const data = await ApiClient.get<SystemStats>('/admin/stats')
    stats.value = data
  } catch (error: any) {
    console.error('获取统计信息失败:', error)
    message.error('获取统计信息失败')
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 12px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.admin-section {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.admin-section:hover {
  transform: translateY(-2px);
}

.admin-section p {
  color: #64748b;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .admin-sections {
    grid-template-columns: 1fr;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
}
</style>
