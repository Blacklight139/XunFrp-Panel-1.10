<template>
  <div class="signin-center">
    <n-card title="签到中心" class="signin-card">
      <div class="signin-content">
        <!-- 签到状态 -->
        <div class="signin-status">
          <div class="status-card" :class="{ signed: todaySignedIn }">
            <div class="status-icon">
              <n-icon size="48" :color="todaySignedIn ? '#18a058' : '#909399'">
                <GiftOutline />
              </n-icon>
            </div>
            <div class="status-text">
              <h3>{{ todaySignedIn ? '今日已签到' : '今日未签到' }}</h3>
              <p>{{ todaySignedIn ? `获得 ${todayReward} 积分` : '点击下方按钮签到' }}</p>
            </div>
          </div>
        </div>

        <!-- 签到按钮 -->
        <div class="signin-action">
          <n-button
            type="primary"
            size="large"
            :disabled="todaySignedIn || signing"
            :loading="signing"
            @click="handleSignIn"
            class="signin-btn"
          >
            {{ todaySignedIn ? '今日已签到' : '立即签到' }}
          </n-button>
        </div>

        <!-- 签到统计 -->
        <div class="signin-stats">
          <n-grid :cols="3" :x-gap="16">
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalDays }}</div>
                <div class="stat-label">累计签到</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.continuousDays }}</div>
                <div class="stat-label">连续签到</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalRewards }}</div>
                <div class="stat-label">累计积分</div>
              </div>
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 签到记录 -->
        <div class="signin-history">
          <h4>最近签到记录</h4>
          <n-list>
            <n-list-item v-for="record in recentRecords" :key="record.date">
              <div class="record-item">
                <div class="record-date">{{ formatDate(record.date) }}</div>
                <div class="record-reward">+{{ record.reward }} 积分</div>
              </div>
            </n-list-item>
          </n-list>
        </div>
      </div>
    </n-card>

    <!-- 人机验证弹窗 -->
    <CaptchaModal
      v-model:show="showCaptcha"
      @success="handleCaptchaSuccess"
      @cancel="handleCaptchaCancel"
    />

    <!-- 签到成功弹窗 -->
    <n-modal
      v-model:show="showSuccessModal"
      preset="dialog"
      title="🎉 签到成功"
      :mask-closable="false"
      style="width: 400px"
    >
      <div class="success-content">
        <div class="success-icon">
          <n-icon size="64" color="#18a058">
            <GiftOutline />
          </n-icon>
        </div>
        <div class="success-text">
          <h3>恭喜你！</h3>
          <p>你今日签到了 <span class="reward-amount">{{ todayReward }}</span> 积分</p>
        </div>
      </div>

      <template #action>
        <n-button type="primary" @click="showSuccessModal = false">哇</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { GiftOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import CaptchaModal from '@/components/CaptchaModal.vue'

const message = useMessage()

// 响应式数据
const todaySignedIn = ref(false)
const todayReward = ref(0)
const signing = ref(false)
const showCaptcha = ref(false)
const showSuccessModal = ref(false)
let captchaToken = ''

const stats = ref({
  totalDays: 0,
  continuousDays: 0,
  totalRewards: 0
})

const recentRecords = ref<Array<{
  date: string
  reward: number
}>>([])

// 获取签到状态
const fetchSignInStatus = async () => {
  try {
    const response = await ApiClient.get('/signin/status')
    todaySignedIn.value = response.signed_today
    todayReward.value = response.today_reward || 0
    stats.value = {
      totalDays: response.total_days || 0,
      continuousDays: response.continuous_days || 0,
      totalRewards: response.total_rewards || 0
    }
    recentRecords.value = response.recent_records || []
  } catch (error: any) {
    console.error('获取签到状态失败:', error)
    message.error('获取签到状态失败')
  }
}

// 执行签到
const handleSignIn = async () => {
  if (todaySignedIn.value) return

  // 显示人机验证
  showCaptcha.value = true
}

// 人机验证成功
const handleCaptchaSuccess = async (token: string) => {
  captchaToken = token

  try {
    signing.value = true
    const response = await ApiClient.post('/signin', {
      captcha_token: captchaToken
    })

    todaySignedIn.value = true
    todayReward.value = response.reward
    stats.value.totalDays += 1
    stats.value.continuousDays = response.continuous_days
    stats.value.totalRewards += response.reward

    // 添加到最近记录
    recentRecords.value.unshift({
      date: new Date().toISOString(),
      reward: response.reward
    })

    // 显示成功弹窗
    showSuccessModal.value = true
  } catch (error: any) {
    console.error('签到失败:', error)
    message.error(error.message || '签到失败')
  } finally {
    signing.value = false
    captchaToken = ''
  }
}

// 人机验证取消
const handleCaptchaCancel = () => {
  captchaToken = ''
  signing.value = false
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchSignInStatus()
})
</script>

<style scoped>
.signin-center {
  max-width: 600px;
  margin: 0 auto;
}

.signin-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.signin-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.signin-status {
  text-align: center;
}

.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.status-card.signed {
  border-color: #18a058;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.status-card.signed .status-icon {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: white;
}

.status-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.status-text p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.signin-action {
  text-align: center;
}

.signin-btn {
  width: 200px;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 24px;
}

.signin-stats {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #18a058;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.signin-history h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.record-date {
  color: #666;
  font-size: 0.9rem;
}

.record-reward {
  color: #18a058;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .signin-center {
    margin: 0 1rem;
  }
  
  .status-card {
    padding: 1.5rem;
  }
  
  .status-icon {
    width: 60px;
    height: 60px;
  }
  
  .signin-btn {
    width: 100%;
  }
}

/* 签到成功弹窗样式 */
.success-content {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #18a058;
}

.success-text p {
  margin: 0;
  font-size: 1.1rem;
  color: #666;
}

.reward-amount {
  font-weight: bold;
  color: #18a058;
  font-size: 1.2rem;
}
</style>
