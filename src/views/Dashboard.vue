<template>
  <div class="dashboard">
    <!-- 顶部导航 -->
    <div class="dashboard-header" data-aos="fade-down" data-aos-duration="800">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h2>XunFrp</h2>
          </div>
          <div class="user-menu">
            <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
              <n-button text>
                <template #icon>
                  <n-icon><PersonOutline /></n-icon>
                </template>
                {{ authStore.user?.username }}
              </n-button>
            </n-dropdown>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="container">
        <div class="welcome" data-aos="fade-up" data-aos-delay="200">
          <h1>欢迎回来, {{ authStore.user?.username }}</h1>
          <p>管理您的隧道，查看统计信息</p>
        </div>

        <div class="dashboard-main-wrapper">
          <!-- 左侧广告位 -->
          <div class="left-ad-sidebar">
            <SystemAdvertisement position="left-sidebar" />
          </div>

          <!-- 中间主要内容 -->
          <div class="dashboard-layout">
          <!-- 左侧用户信息 -->
          <div class="left-panel" data-aos="fade-right" data-aos-delay="400">
            <n-card title="用户信息" class="user-info-card">
              <div class="user-info">
                <div class="info-item">
                  <span class="label">用户 ID:</span>
                  <span class="value">{{ authStore.user?.id }}</span>
                </div>
                <div class="info-item">
                  <span class="label">实名认证:</span>
                  <n-tag :type="authStore.user?.is_verified ? 'success' : 'warning'">
                    {{ authStore.user?.is_verified ? '已认证' : '未认证' }}
                  </n-tag>
                </div>
                <div class="info-item">
                  <span class="label">用户组:</span>
                  <n-tag :type="getUserGroupType(authStore.user?.user_group)">
                    {{ getUserGroupName(authStore.user?.user_group || '') }}
                  </n-tag>
                </div>
                <div class="info-item">
                  <span class="label">注册时间:</span>
                  <span class="value">{{ formatDateTime(authStore.user?.created_at || '') }}</span>
                </div>
                <div class="info-item">
                  <span class="label">注册邮箱:</span>
                  <span class="value">{{ authStore.user?.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">隧道数量:</span>
                  <span class="value">{{ tunnelCount }} / {{ authStore.user?.tunnel_limit || '无限制' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">剩余流量:</span>
                  <span class="value">{{ formatBytes((authStore.user?.traffic_limit || 0) - (authStore.user?.traffic_used || 0)) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">入站带宽:</span>
                  <span class="value">{{ formatBandwidth(authStore.user?.inbound_bandwidth || 0) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">出站带宽:</span>
                  <span class="value">{{ formatBandwidth(authStore.user?.outbound_bandwidth || 0) }}</span>
                </div>
              </div>

              <div class="user-actions">
                <n-button
                  type="primary"
                  :disabled="!authStore.canSignIn"
                  @click="handleSignIn"
                  :loading="signInLoading"
                  block
                >
                  {{ authStore.canSignIn ? '签到' : '今日已签到' }}
                </n-button>
              </div>
            </n-card>

            <!-- 访问密钥卡片 -->
            <n-card title="访问密钥" class="access-key-card">
              <div class="access-key">
                <n-input
                  :value="authStore.user?.access_key"
                  readonly
                  type="password"
                  show-password-on="click"
                />
                <div class="key-actions">
                  <n-button @click="copyAccessKey">复制</n-button>
                  <n-button @click="resetAccessKey" :loading="resetKeyLoading">重置</n-button>
                </div>
              </div>
            </n-card>
          </div>

          <!-- 右侧公告和快捷操作 -->
          <div class="right-panel" data-aos="fade-left" data-aos-delay="600">
            <!-- 快捷操作 -->
            <n-card title="快捷操作" class="quick-actions-card">
              <div class="quick-actions">
                <n-button type="primary" @click="$router.push('/dashboard/tunnels/create')" block>
                  创建隧道
                </n-button>
                <n-button @click="$router.push('/dashboard/tunnels')" block>
                  隧道管理
                </n-button>
                <n-button @click="$router.push('/dashboard/nodes')" block>
                  节点状态
                </n-button>
                <n-button @click="$router.push('/user-center')" block>
                  用户中心
                </n-button>
                <n-button @click="$router.push('/dashboard/downloads')" block>
                  客户端下载
                </n-button>
              </div>
            </n-card>

            <!-- 系统公告 -->
            <SystemAnnouncement position="dashboard" />

            <!-- 客户端 -->
            <n-card title="客户端" class="client-card">
              <div class="client-management">
                <div class="client-item" v-for="software in softwareList" :key="software.id">
                  <div class="client-info">
                    <div class="client-name">{{ software.name }}</div>
                    <div class="client-version">版本: {{ software.version }}</div>
                    <div class="client-platform">平台: {{ software.platform }}</div>
                  </div>
                  <div class="client-actions">
                    <n-button size="small" type="primary" @click="downloadSoftware(software)">
                      快捷下载
                    </n-button>
                  </div>
                </div>
                <div v-if="softwareList.length === 0" class="no-client">
                  暂无可用客户端
                </div>
                <div class="more-downloads">
                  <n-button text type="primary" @click="$router.push('/downloads')">
                    查看更多下载选项 →
                  </n-button>
                </div>
              </div>
            </n-card>

          </div>
          </div>

          <!-- 右侧广告位 -->
          <div class="right-ad-sidebar">
            <SystemAdvertisement position="right-sidebar" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { PersonOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { ApiClient } from '@/utils/api'
import SystemAnnouncement from '@/components/SystemAnnouncement.vue'
import SystemAdvertisement from '@/components/SystemAdvertisement.vue'
import { formatDateTime, formatBandwidth, formatBytes, getUserGroupName, copyToClipboard } from '@/utils'
import type { Announcement } from '@/types'

const router = useRouter()

const message = useMessage()
const authStore = useAuthStore()

const tunnelCount = ref(0)
const signInLoading = ref(false)
const resetKeyLoading = ref(false)

// 软件管理数据
const softwareList = ref<any[]>([])
const softwareLoading = ref(false)

// 用户菜单选项
const userMenuOptions = [
  {
    label: '用户中心',
    key: 'user-center',
  },
  {
    label: '隧道管理',
    key: 'tunnels',
  },
  {
    type: 'divider',
  },
  {
    label: '退出登录',
    key: 'logout',
  },
]

// 获取用户组类型
const getUserGroupType = (group?: string) => {
  const groupTypes: Record<string, string> = {
    unverified: 'warning',
    verified: 'info',
    sponsor: 'success',
    admin: 'error',
  }
  return groupTypes[group || ''] || 'default'
}

// 获取快捷下载列表
const fetchSoftwareList = async () => {
  try {
    softwareLoading.value = true
    const response = await ApiClient.get('/client/available')
    if (response.code === 200) {
      // 只显示主要平台的64位版本作为快捷下载
      const clients = response.data || []
      softwareList.value = clients
        .filter((client: any) =>
          (client.platform === 'windows' && client.architecture === 'amd64') ||
          (client.platform === 'linux' && client.architecture === 'amd64') ||
          (client.platform === 'darwin' && client.architecture === 'amd64')
        )
        .map((client: any) => ({
          id: `${client.platform}_${client.architecture}`,
          name: client.display_name.replace('darwin', 'macOS'),
          platform: client.platform === 'darwin' ? 'macos' : client.platform,
          architecture: client.architecture,
          filename: client.filename,
          size: formatFileSize(client.size),
          download_url: `/api/v1/client/download/${client.platform}/${client.architecture}`
        }))
    }
  } catch (error) {
    console.error('获取快捷下载列表失败:', error)
  } finally {
    softwareLoading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 下载软件
const downloadSoftware = (software: any) => {
  if (software.download_url) {
    window.open(software.download_url, '_blank')
    message.success(`开始下载 ${software.name}`)
  } else {
    message.error('下载链接不可用')
  }
}

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'user-center':
      router.push('/user-center')
      break
    case 'tunnels':
      router.push('/dashboard/tunnels')
      break
    case 'logout':
      authStore.logout()
      router.push('/')
      break
  }
}

// 签到
const handleSignIn = async () => {
  try {
    signInLoading.value = true
    const result = await authStore.signIn()
    message.success(`签到成功！获得 ${(result.reward / 1024 / 1024).toFixed(0)}MB 流量奖励`)
  } catch (error: any) {
    message.error(error.message || '签到失败')
  } finally {
    signInLoading.value = false
  }
}

// 复制访问密钥
const copyAccessKey = async () => {
  if (!authStore.user?.access_key) return
  
  const success = await copyToClipboard(authStore.user.access_key)
  if (success) {
    message.success('访问密钥已复制到剪贴板')
  } else {
    message.error('复制失败')
  }
}

// 重置访问密钥
const resetAccessKey = async () => {
  try {
    resetKeyLoading.value = true
    await authStore.resetAccessKey()
    message.success('访问密钥重置成功')
  } catch (error: any) {
    message.error(error.message || '重置失败')
  } finally {
    resetKeyLoading.value = false
  }
}

// 获取隧道数量
const fetchTunnelCount = async () => {
  try {
    const tunnels = await ApiClient.get('/tunnels')
    tunnelCount.value = Array.isArray(tunnels) ? tunnels.length : 0
  } catch (error) {
    console.error('获取隧道数量失败:', error)
  }
}

// 用户信息刷新定时器
let userRefreshInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  await fetchTunnelCount()
  await fetchSoftwareList()

  // 立即刷新用户信息
  try {
    await authStore.refreshUser()
    console.log('🔄 用户信息已刷新')
  } catch (error) {
    console.error('❌ 初始刷新用户信息失败:', error)
  }

  // 设置定期刷新用户信息（每30秒）
  userRefreshInterval = setInterval(async () => {
    try {
      await authStore.refreshUser()
      console.log('🔄 定期刷新用户信息成功')

      // 检查用户状态
      if (authStore.user?.is_banned) {
        console.log('🚫 检测到用户被封禁，跳转到登录页')
        message.error('您的账户已被封禁，请联系管理员')
        authStore.logout()
        router.push('/login')
        return
      }

      if (!authStore.user?.is_active) {
        console.log('🚫 检测到用户被禁用，跳转到登录页')
        message.error('您的账户已被禁用，请联系管理员')
        authStore.logout()
        router.push('/login')
        return
      }

    } catch (error: any) {
      console.error('❌ 定期刷新用户信息失败:', error)

      // 如果是401或403错误，可能是token过期或用户被封禁
      if (error.response?.status === 401) {
        console.log('🚫 Token过期，跳转到登录页')
        message.error('登录已过期，请重新登录')
        authStore.logout()
        router.push('/login')
      } else if (error.response?.status === 403) {
        console.log('🚫 用户被封禁，跳转到登录页')
        message.error('您的账户已被封禁，请联系管理员')
        authStore.logout()
        router.push('/login')
      }
    }
  }, 30000) // 30秒刷新一次
})

onUnmounted(() => {
  if (userRefreshInterval) {
    clearInterval(userRefreshInterval)
    userRefreshInterval = null
    console.log('🔄 用户信息刷新定时器已清除')
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-header {
  background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-menu {
  color: white;
}

.dashboard-content {
  padding: 2rem 0;
}

.container {
  max-width: 1800px; /* 进一步增加最大宽度 */
  margin: 0 auto;
  padding: 0 1.5rem; /* 增加左右内边距 */
}

/* 主要布局容器 */
.dashboard-main-wrapper {
  display: flex;
  gap: 1.5rem; /* 增加间距 */
  margin-top: 2rem;
  align-items: flex-start;
  max-width: 1800px; /* 进一步增加最大宽度 */
  margin-left: auto;
  margin-right: auto;
  padding: 0 0.5rem; /* 减少内边距，让内容有更多空间 */
}

.welcome {
  text-align: center;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.welcome h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.welcome p {
  color: #64748b;
  font-size: 1.1rem;
}

/* 左右侧边栏广告位样式 */
.left-ad-sidebar,
.right-ad-sidebar {
  width: 180px; /* 减小宽度，给主内容更多空间 */
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.left-ad-sidebar {
  order: 1;
}

/* 主内容区域 */
.dashboard-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem; /* 恢复较大间距 */
  flex: 1;
  order: 2;
  min-width: 0;
  max-width: 1400px; /* 增加最大宽度 */
}

.right-ad-sidebar {
  order: 3;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* 增加卡片间距 */
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* 增加卡片间距 */
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 增加信息项间距 */
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0; /* 添加垂直内边距 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05); /* 添加分隔线 */
}

.info-item:last-child {
  border-bottom: none; /* 最后一项不显示分隔线 */
}

.label {
  font-weight: 500;
  color: #374151;
}

.value {
  color: #6b7280;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.access-key {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.key-actions {
  display: flex;
  gap: 1rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-actions .n-button {
  height: 44px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.quick-actions .n-button:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}



@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem; /* 减少移动端间距 */
  }

  .container {
    padding: 0 1rem; /* 增加移动端内边距 */
  }

  .dashboard-main-wrapper {
    padding: 0; /* 移动端移除额外内边距 */
  }

  .key-actions {
    flex-direction: column;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .welcome h1 {
    font-size: 1.75rem; /* 移动端减小标题字体 */
  }

  .welcome p {
    font-size: 1rem; /* 移动端减小描述字体 */
  }

  .left-panel,
  .right-panel {
    gap: 1.5rem; /* 移动端减少卡片间距 */
  }
}

/* 客户端样式 */
.client-card {
  margin-bottom: 24px;
}

.client-management {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.client-item:hover {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.client-info {
  flex: 1;
}

.client-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.client-version {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.client-platform {
  font-size: 12px;
  color: #888;
}

.client-actions {
  margin-left: 12px;
}

.no-client {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.more-downloads {
  text-align: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}



/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-main-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .left-ad-sidebar,
  .right-ad-sidebar {
    width: 100%;
    order: 3;
    position: static;
    max-height: none;
  }

  .dashboard-layout {
    order: 1;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .left-ad-sidebar,
  .right-ad-sidebar {
    display: none;
  }
}

/* 全局卡片优化 */
.n-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  transition: all 0.3s ease !important;
}

.n-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px) !important;
}

/* 用户信息项优化 */
.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  margin: 0 -0.5rem;
  padding: 0.75rem 0.5rem;
}
</style>
