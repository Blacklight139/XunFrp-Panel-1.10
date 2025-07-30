<template>
  <div class="user-center">
    <div class="container">
      <div class="page-header">
        <h1>用户中心</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>

      <div class="center-layout">
        <!-- 用户信息卡片 -->
        <n-card title="用户信息" class="user-info-card">
          <div class="user-info">
            <div class="info-item">
              <span class="label">用户名:</span>
              <span class="value">{{ authStore.user?.username }}</span>
            </div>
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

        <!-- 流量历史记录 -->
        <n-card title="流量历史记录" class="traffic-history-card">
          <div class="chart-container">
            <div ref="chartRef" class="traffic-chart"></div>
          </div>
          <div class="chart-info">
            <p class="chart-note">流量数据每 3 分钟自动更新, 请以实际为准</p>
          </div>
        </n-card>

        <!-- 账户与安全 -->
        <n-card title="账户与安全" class="security-card">
          <div class="security-sections">
            <!-- 实名认证 -->
            <div class="security-section">
              <div class="section-header">
                <h3>实名认证</h3>
                <n-tag :type="authStore.user?.is_verified ? 'success' : 'warning'" size="small">
                  {{ authStore.user?.is_verified ? '已认证' : '未认证' }}
                </n-tag>
              </div>
              <p class="section-description">
                {{ authStore.user?.is_verified ? '您已完成实名认证' : '完成实名认证可提升账户权限' }}
              </p>
              <n-button 
                v-if="!authStore.user?.is_verified" 
                @click="showVerificationModal = true"
                type="primary"
                size="small"
              >
                立即认证
              </n-button>
            </div>

            <!-- 账户密码 -->
            <div class="security-section">
              <div class="section-header">
                <h3>账户密码</h3>
              </div>
              <p class="section-description">定期更改密码可以提高账户安全性</p>
              <div class="section-actions">
                <n-button @click="showPasswordModal = true" size="small">更改密码</n-button>
                <n-button @click="$router.push('/reset-password')" size="small">找回密码</n-button>
              </div>
            </div>

            <!-- 访问密钥 -->
            <div class="security-section">
              <div class="section-header">
                <h3>访问密钥</h3>
              </div>
              <p class="section-description">32位字母加数字，用于客户端认证</p>
              <div class="access-key-display">
                <n-input
                  :value="authStore.user?.access_key"
                  readonly
                  type="password"
                  show-password-on="click"
                />
                <div class="key-actions">
                  <n-button @click="copyAccessKey" size="small">复制</n-button>
                  <n-button @click="resetAccessKey" :loading="resetKeyLoading" size="small">重置</n-button>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 实名认证模态框 -->
    <n-modal v-model:show="showVerificationModal" preset="card" title="实名认证" style="width: 500px">
      <n-form ref="verificationFormRef" :model="verificationForm" :rules="verificationRules">
        <n-form-item label="真实姓名" path="real_name">
          <n-input v-model:value="verificationForm.real_name" placeholder="请输入真实姓名" />
        </n-form-item>
        <n-form-item label="身份证号码" path="id_card">
          <n-input v-model:value="verificationForm.id_card" placeholder="请输入18位身份证号码" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showVerificationModal = false">取消</n-button>
          <n-button type="primary" @click="submitVerification" :loading="verificationLoading">
            提交认证
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 修改密码模态框 -->
    <n-modal v-model:show="showPasswordModal" preset="card" title="修改密码" style="width: 500px">
      <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules">
        <n-form-item label="当前密码" path="current_password">
          <n-input 
            v-model:value="passwordForm.current_password" 
            type="password" 
            placeholder="请输入当前密码"
            show-password-on="mousedown"
          />
        </n-form-item>
        <n-form-item label="新密码" path="new_password">
          <n-input 
            v-model:value="passwordForm.new_password" 
            type="password" 
            placeholder="请输入新密码"
            show-password-on="mousedown"
          />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirm_password">
          <n-input 
            v-model:value="passwordForm.confirm_password" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password-on="mousedown"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="primary" @click="changePassword" :loading="passwordLoading">
            修改密码
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import * as echarts from 'echarts'
import { useAuthStore } from '@/stores/auth'
import { ApiClient } from '@/utils/api'
import { formatDateTime, formatBandwidth, formatBytes, getUserGroupName, copyToClipboard, validatePassword } from '@/utils'

const message = useMessage()
const authStore = useAuthStore()

const chartRef = ref<HTMLElement>()
const verificationFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const signInLoading = ref(false)
const resetKeyLoading = ref(false)
const verificationLoading = ref(false)
const passwordLoading = ref(false)
const tunnelCount = ref(0)

const showVerificationModal = ref(false)
const showPasswordModal = ref(false)

let chart: echarts.ECharts | null = null
let updateTimer: number | null = null

const verificationForm = reactive({
  real_name: '',
  id_card: '',
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const verificationRules: FormRules = {
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: ['input', 'blur'] },
    { min: 2, max: 10, message: '姓名长度应在2-10个字符之间', trigger: ['input', 'blur'] },
  ],
  id_card: [
    { required: true, message: '请输入身份证号码', trigger: ['input', 'blur'] },
    { len: 18, message: '身份证号码必须为18位', trigger: ['input', 'blur'] },
    {
      validator: (rule, value) => {
        const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
        if (!idCardRegex.test(value)) {
          return new Error('请输入有效的身份证号码')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const passwordRules: FormRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: ['input', 'blur'] },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: ['input', 'blur'] },
    {
      validator: (rule, value) => {
        const result = validatePassword(value)
        if (!result.isValid) {
          return new Error(result.message)
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: ['input', 'blur'] },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.new_password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const getUserGroupType = (group?: string) => {
  const groupTypes: Record<string, string> = {
    unverified: 'warning',
    verified: 'info',
    sponsor: 'success',
    admin: 'error',
  }
  return groupTypes[group || ''] || 'default'
}

const handleSignIn = async () => {
  try {
    signInLoading.value = true
    await authStore.signIn()
    message.success('签到成功！')
  } catch (error: any) {
    console.error('签到失败:', error)
    message.error(error.message || '签到失败')
  } finally {
    signInLoading.value = false
  }
}

const copyAccessKey = async () => {
  if (!authStore.user?.access_key) return
  
  const success = await copyToClipboard(authStore.user.access_key)
  if (success) {
    message.success('访问密钥已复制到剪贴板')
  } else {
    message.error('复制失败')
  }
}

const resetAccessKey = async () => {
  try {
    resetKeyLoading.value = true
    await authStore.resetAccessKey()
    message.success('访问密钥重置成功')
  } catch (error: any) {
    console.error('重置访问密钥失败:', error)
    message.error(error.message || '重置失败')
  } finally {
    resetKeyLoading.value = false
  }
}

const submitVerification = async () => {
  if (!verificationFormRef.value) return
  
  try {
    await verificationFormRef.value.validate()
    verificationLoading.value = true
    
    await ApiClient.post('/user/verify-identity', verificationForm)
    
    message.success('实名认证提交成功，已自动通过认证')
    showVerificationModal.value = false
    
    // 刷新用户信息
    await authStore.initUser()
  } catch (error: any) {
    console.error('实名认证失败:', error)
    message.error(error.message || '认证失败')
  } finally {
    verificationLoading.value = false
  }
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await ApiClient.post('/user/change-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    })
    
    message.success('密码修改成功')
    showPasswordModal.value = false
    
    // 重置表单
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
  } catch (error: any) {
    console.error('修改密码失败:', error)
    message.error(error.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const initChart = async () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: '流量使用统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#1e293b'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>流量: ${formatBytes(data.value)}`
      }
    },
    xAxis: {
      type: 'category',
      data: ['1天前', '2天前', '3天前', '4天前', '5天前', '6天前', '今天'],
      axisLabel: {
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatBytes(value),
        color: '#64748b'
      }
    },
    series: [
      {
        data: [1024*1024*100, 1024*1024*150, 1024*1024*80, 1024*1024*200, 1024*1024*120, 1024*1024*180, 1024*1024*90],
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2563eb' },
            { offset: 1, color: '#10b981' }
          ])
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  chart.setOption(option)
}

const updateTrafficData = async () => {
  try {
    const history = await ApiClient.get('/user/traffic-history')
    if (chart && history) {
      // 更新图表数据
      chart.setOption({
        series: [{
          data: history.data || []
        }]
      })
    }
  } catch (error) {
    console.error('更新流量数据失败:', error)
  }
}

const fetchTunnelCount = async () => {
  try {
    const tunnels = await ApiClient.get('/tunnels')
    tunnelCount.value = Array.isArray(tunnels) ? tunnels.length : 0
  } catch (error) {
    console.error('获取隧道数量失败:', error)
  }
}

onMounted(async () => {
  await fetchTunnelCount()
  await nextTick()
  await initChart()
  
  // 每3分钟更新一次流量数据
  updateTimer = window.setInterval(updateTrafficData, 3 * 60 * 1000)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
  chart?.dispose()
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.center-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  color: #1e293b;
  font-weight: 600;
}

.user-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.chart-container {
  height: 300px;
  margin-bottom: 1rem;
}

.traffic-chart {
  width: 100%;
  height: 100%;
}

.chart-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.chart-note {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.security-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.security-section {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.section-description {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.access-key-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.key-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .user-info {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .section-actions {
    flex-direction: column;
  }
  
  .key-actions {
    flex-direction: column;
  }
}
</style>
