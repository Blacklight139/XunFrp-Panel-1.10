<template>
  <div class="dashboard-home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>{{ greeting }} {{ authStore.user?.username }}！</h1>
          <p>现在是 {{ currentTime }}，{{ greetingEmoji }} 欢迎使用 XunFrp 内网穿透服务</p>
        </div>
        <div class="checkin-section">
          <n-button
            type="primary"
            size="large"
            :disabled="checkinInfo.signed"
            @click="handleCheckin"
            :loading="checkinLoading"
          >
            {{ checkinInfo.signed ? '今日已签到' : '每日签到' }}
          </n-button>
          
          <!-- 签到信息提示 -->
          <n-popover trigger="hover" placement="bottom" v-if="!isMobile">
            <template #trigger>
              <n-icon size="20" class="info-icon">
                <InformationCircleOutline />
              </n-icon>
            </template>
            <div class="checkin-info">
              <p><strong>签到统计信息</strong></p>
              <p>上次签到时间：{{ checkinInfo.lastSignTime || '从未签到' }}</p>
              <p>累计签到积分：{{ checkinInfo.totalPoints || 0 }}</p>
              <p>累计签到次数：{{ checkinInfo.totalDays || 0 }}</p>
              <p>今日签到人数：{{ checkinInfo.todaySignCount || 0 }}</p>
            </div>
          </n-popover>
          
          <!-- 移动端点击显示 -->
          <n-modal v-model:show="showCheckinModal" v-if="isMobile">
            <n-card style="width: 90%; max-width: 400px;" title="签到统计信息">
              <div class="checkin-info">
                <p>上次签到时间：{{ checkinInfo.lastSignTime || '从未签到' }}</p>
                <p>累计签到积分：{{ checkinInfo.totalPoints || 0 }}</p>
                <p>累计签到次数：{{ checkinInfo.totalDays || 0 }}</p>
                <p>今日签到人数：{{ checkinInfo.todaySignCount || 0 }}</p>
              </div>
            </n-card>
          </n-modal>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 用户信息卡片 -->
      <n-card title="用户信息" class="user-info-card">
        <div class="user-info-grid">
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ authStore.user?.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">用户 ID</span>
            <span class="value">{{ authStore.user?.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">实名认证</span>
            <n-tag :type="authStore.user?.is_verified ? 'success' : 'warning'">
              {{ authStore.user?.is_verified ? '已认证' : '未认证' }}
            </n-tag>
          </div>
          <div class="info-item">
            <span class="label">用户组</span>
            <span class="value">{{ authStore.user?.user_group }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ formatDate(authStore.user?.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册邮箱</span>
            <span class="value">{{ authStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">隧道数量</span>
            <span class="value">{{ userStats.tunnelCount || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">剩余积分</span>
            <span class="value">{{ userStats.points || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">入站带宽</span>
            <span class="value">{{ userStats.inboundBandwidth || '无限制' }}</span>
          </div>
          <div class="info-item">
            <span class="label">出站带宽</span>
            <span class="value">{{ userStats.outboundBandwidth || '无限制' }}</span>
          </div>
        </div>
      </n-card>

      <!-- 官方广告卡片 -->
      <n-card title="官方公告" class="announcement-card">
        <div class="announcement-content" :class="{ collapsed: announcementCollapsed }">
          <div v-html="announcementContent"></div>
        </div>
        <n-button
          v-if="announcementLines > 10"
          text
          type="primary"
          @click="announcementCollapsed = !announcementCollapsed"
          class="toggle-btn"
        >
          {{ announcementCollapsed ? '展开' : '收起' }}
        </n-button>
      </n-card>

      <!-- 系统公告卡片 -->
      <n-card title="系统公告" class="system-notice-card">
        <div class="system-notice-content" :class="{ collapsed: systemNoticeCollapsed }">
          <div v-for="notice in systemNotices" :key="notice.id" class="notice-item">
            <div class="notice-header">
              <span class="notice-title">{{ notice.title }}</span>
              <span class="notice-date">{{ formatDate(notice.created_at) }}</span>
            </div>
            <div class="notice-content" v-html="notice.content"></div>
          </div>
        </div>
        <n-button
          v-if="systemNotices.length > 3"
          text
          type="primary"
          @click="systemNoticeCollapsed = !systemNoticeCollapsed"
          class="toggle-btn"
        >
          {{ systemNoticeCollapsed ? '展开' : '收起' }}
        </n-button>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { InformationCircleOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const authStore = useAuthStore()

// 响应式数据
const currentTime = ref('')
const isMobile = ref(false)
const showCheckinModal = ref(false)
const checkinLoading = ref(false)
const announcementCollapsed = ref(true)
const systemNoticeCollapsed = ref(true)

// 签到信息
const checkinInfo = ref({
  signed: false,
  lastSignTime: '',
  totalPoints: 0,
  totalDays: 0,
  todaySignCount: 0
})

// 用户统计
const userStats = ref({
  tunnelCount: 0,
  points: 0,
  inboundBandwidth: '',
  outboundBandwidth: ''
})

// 公告内容
const announcementContent = ref('')
const announcementLines = ref(0)
const systemNotices = ref([])

// 问候语和emoji
const greetingEmojis = ['🌞', '🌈', '😃', '✨', '🥳', '🎉', '🦄', '🍀', '😺', '🚀', '🌸', '🍉', '🧸', '🎈', '😎']

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const greetingEmoji = computed(() => {
  return greetingEmojis[Math.floor(Math.random() * greetingEmojis.length)]
})

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 处理签到
const handleCheckin = async () => {
  if (isMobile.value) {
    showCheckinModal.value = true
    return
  }
  
  checkinLoading.value = true
  try {
    const response = await ApiClient.post('/user/checkin')
    if (response.code === 200) {
      checkinInfo.value.signed = true
      checkinInfo.value.totalPoints += response.data.reward || 0
      checkinInfo.value.totalDays += 1
      window.$message?.success(`签到成功！获得 ${response.data.reward || 0} 积分`)
    }
  } catch (error) {
    console.error('签到失败:', error)
    window.$message?.error('签到失败，请稍后重试')
  } finally {
    checkinLoading.value = false
  }
}

// 获取签到信息
const fetchCheckinInfo = async () => {
  try {
    const response = await ApiClient.get('/user/checkin-info')
    if (response.code === 200) {
      checkinInfo.value = response.data
    }
  } catch (error) {
    console.error('获取签到信息失败:', error)
  }
}

// 获取用户统计
const fetchUserStats = async () => {
  try {
    const response = await ApiClient.get('/user/stats')
    if (response.code === 200) {
      userStats.value = response.data
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 获取公告
const fetchAnnouncements = async () => {
  try {
    const response = await ApiClient.get('/announcements')
    if (response.code === 200) {
      announcementContent.value = response.data.official || '暂无官方公告'
      systemNotices.value = response.data.system || []
      
      // 计算公告行数
      const lines = announcementContent.value.split('\n').length
      announcementLines.value = lines
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

let timeInterval: NodeJS.Timeout

onMounted(() => {
  updateTime()
  checkMobile()
  
  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000)
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkMobile)
  
  // 获取数据
  fetchCheckinInfo()
  fetchUserStats()
  fetchAnnouncements()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.dashboard-home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
}

.checkin-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.info-icon:hover {
  opacity: 1;
}

.checkin-info p {
  margin: 0.25rem 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.user-info-card {
  grid-column: 1 / 2;
}

.announcement-card {
  grid-column: 2 / 3;
}

.system-notice-card {
  grid-column: 1 / 3;
}

.user-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
}

.announcement-content,
.system-notice-content {
  max-height: 300px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.announcement-content.collapsed,
.system-notice-content.collapsed {
  max-height: 200px;
}

.notice-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notice-title {
  font-weight: 500;
  color: #333;
}

.notice-date {
  font-size: 0.875rem;
  color: #666;
}

.toggle-btn {
  margin-top: 1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info-card,
  .announcement-card,
  .system-notice-card {
    grid-column: 1;
  }
  
  .user-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
