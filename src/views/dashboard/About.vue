<template>
  <div class="about-page">
    <n-card title="关于 XunFrp 1.1.0" class="about-card">
      <div class="about-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">面板版本</span>
            <span class="value">v1.1.0</span>
          </div>
          <div class="info-item">
            <span class="label">开发者</span>
            <span class="value">故事的末端k丨一诺</span>
          </div>
          <div class="info-item">
            <span class="label">维护</span>
            <span class="value">一诺</span>
          </div>
          <div class="info-item">
            <span class="label">技术栈</span>
            <div class="tech-stack">
              <n-tag type="info">Vue 3</n-tag>
              <n-tag type="info">TypeScript</n-tag>
              <n-tag type="info">Naive UI</n-tag>
              <n-tag type="info">Vite</n-tag>
            </div>
          </div>
        </div>
        
        <div class="description">
          <n-alert type="info" style="margin-top: 2rem;">
            <template #header>
              <strong>版权声明</strong>
            </template>
            XunFrp 1.1.0 除 设计框架/程序框架及 Frp 项目原有代码 以外, 其他所有组件均为自主研发, 受《中华人民共和国著作权法》保护。
          </n-alert>
        </div>

        <div class="features">
          <h3>主要特性</h3>
          <ul>
            <li>🚀 基于 Vue 3 + TypeScript 开发，性能优异</li>
            <li>🎨 使用 Naive UI 组件库，界面美观</li>
            <li>📱 响应式设计，支持移动端访问</li>
            <li>🔐 完善的用户认证和权限管理</li>
            <li>📊 实时的隧道状态监控</li>
            <li>⚡ 快速的隧道创建和管理</li>
            <li>🛡️ 安全的数据传输和存储</li>
            <li>🔧 灵活的系统配置选项</li>
          </ul>
        </div>

        <div class="system-info">
          <h3>系统信息</h3>
          <div class="system-grid">
            <div class="system-item">
              <span class="label">运行时间</span>
              <span class="value">{{ systemInfo.uptime }}</span>
            </div>
            <div class="system-item">
              <span class="label">服务器时间</span>
              <span class="value">{{ systemInfo.serverTime }}</span>
            </div>
            <div class="system-item">
              <span class="label">Go 版本</span>
              <span class="value">{{ systemInfo.goVersion }}</span>
            </div>
            <div class="system-item">
              <span class="label">系统版本</span>
              <span class="value">{{ systemInfo.osVersion }}</span>
            </div>
          </div>
        </div>

        <div class="links">
          <h3>相关链接</h3>
          <div class="link-grid">
            <n-button
              tag="a"
              href="https://github.com/fatedier/frp"
              target="_blank"
              type="primary"
              ghost
            >
              <template #icon>
                <n-icon><LogoGithub /></n-icon>
              </template>
              FRP 项目
            </n-button>
            <n-button
              tag="a"
              href="https://docs.yinuo8394.top"
              target="_blank"
              type="info"
              ghost
            >
              <template #icon>
                <n-icon><DocumentTextOutline /></n-icon>
              </template>
              使用文档
            </n-button>
            <n-button
              tag="a"
              href="mailto:support@xunfrp.com"
              type="warning"
              ghost
            >
              <template #icon>
                <n-icon><MailOutline /></n-icon>
              </template>
              技术支持
            </n-button>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  LogoGithub, 
  DocumentTextOutline, 
  MailOutline 
} from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

// 系统信息
const systemInfo = ref({
  uptime: '加载中...',
  serverTime: '加载中...',
  goVersion: '加载中...',
  osVersion: '加载中...'
})

// 获取系统信息
const fetchSystemInfo = async () => {
  try {
    const response = await ApiClient.get('/system/info')
    if (response.code === 200) {
      systemInfo.value = {
        uptime: formatUptime(response.data.uptime),
        serverTime: new Date(response.data.server_time).toLocaleString('zh-CN'),
        goVersion: response.data.go_version || 'Unknown',
        osVersion: response.data.os_version || 'Unknown'
      }
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    systemInfo.value = {
      uptime: '获取失败',
      serverTime: new Date().toLocaleString('zh-CN'),
      goVersion: 'Unknown',
      osVersion: 'Unknown'
    }
  }
}

// 格式化运行时间
const formatUptime = (seconds: number) => {
  if (!seconds) return '未知'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

onMounted(() => {
  fetchSystemInfo()
})
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.about-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.about-content {
  padding: 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.features {
  margin: 2rem 0;
}

.features h3 {
  margin-bottom: 1rem;
  color: #333;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.features li:last-child {
  border-bottom: none;
}

.system-info {
  margin: 2rem 0;
}

.system-info h3 {
  margin-bottom: 1rem;
  color: #333;
}

.system-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.system-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.links {
  margin: 2rem 0;
}

.links h3 {
  margin-bottom: 1rem;
  color: #333;
}

.link-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .info-grid,
  .system-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item,
  .system-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .tech-stack {
    margin-top: 0.5rem;
  }
  
  .link-grid {
    flex-direction: column;
  }
}
</style>
