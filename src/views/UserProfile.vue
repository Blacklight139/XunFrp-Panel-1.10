<template>
  <div class="user-profile">
    <n-grid :cols="1" :x-gap="24" :y-gap="24">
      <!-- 基本信息 -->
      <n-grid-item>
        <n-card title="基本信息" class="profile-card">
          <n-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
          >
            <n-grid :cols="2" :x-gap="24">
              <n-grid-item>
                <n-form-item label="用户名" path="username">
                  <n-input v-model:value="profileForm.username" disabled />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="邮箱" path="email">
                  <n-input v-model:value="profileForm.email" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="用户组">
                  <n-tag :type="getUserGroupType(profileForm.user_group)">
                    {{ getUserGroupText(profileForm.user_group) }}
                  </n-tag>
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="注册时间">
                  <n-input :value="formatDate(profileForm.created_at)" disabled />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-form-item>
              <n-button type="primary" @click="updateProfile" :loading="updating">
                更新信息
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <!-- 修改密码 -->
      <n-grid-item>
        <n-card title="修改密码" class="profile-card">
          <n-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
          >
            <n-form-item label="当前密码" path="current_password">
              <n-input
                v-model:value="passwordForm.current_password"
                type="password"
                show-password-on="click"
                placeholder="请输入当前密码"
              />
            </n-form-item>
            <n-form-item label="新密码" path="new_password">
              <n-input
                v-model:value="passwordForm.new_password"
                type="password"
                show-password-on="click"
                placeholder="请输入新密码"
              />
            </n-form-item>
            <n-form-item label="确认新密码" path="confirm_password">
              <n-input
                v-model:value="passwordForm.confirm_password"
                type="password"
                show-password-on="click"
                placeholder="请再次输入新密码"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button type="primary" @click="changePassword" :loading="changingPassword">
                修改密码
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <!-- 账户统计 -->
      <n-grid-item>
        <n-card title="账户统计" class="profile-card">
          <n-grid :cols="4" :x-gap="16">
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.tunnel_count }}</div>
                <div class="stat-label">隧道数量</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ formatTraffic(stats.total_traffic) }}</div>
                <div class="stat-label">总流量</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.signin_days }}</div>
                <div class="stat-label">签到天数</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ stats.points }}</div>
                <div class="stat-label">积分余额</div>
              </div>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { ApiClient } from '@/utils/api'

const message = useMessage()
const authStore = useAuthStore()

// 表单引用
const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

// 状态
const updating = ref(false)
const changingPassword = ref(false)

// 个人信息表单
const profileForm = reactive({
  username: '',
  email: '',
  user_group: '',
  created_at: ''
})

// 密码修改表单
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// 账户统计
const stats = ref({
  tunnel_count: 0,
  total_traffic: 0,
  signin_days: 0,
  points: 0
})

// 表单验证规则
const profileRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        return value === passwordForm.new_password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

// 获取用户组类型
const getUserGroupType = (group: string) => {
  const typeMap = {
    'admin': 'error',
    'vip': 'warning',
    'user': 'info'
  }
  return typeMap[group as keyof typeof typeMap] || 'info'
}

// 获取用户组文本
const getUserGroupText = (group: string) => {
  const textMap = {
    'admin': '管理员',
    'vip': 'VIP用户',
    'user': '普通用户'
  }
  return textMap[group as keyof typeof textMap] || '普通用户'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 格式化流量
const formatTraffic = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const user = authStore.user
    if (user) {
      profileForm.username = user.username
      profileForm.email = user.email || ''
      profileForm.user_group = user.user_group
      profileForm.created_at = user.created_at || ''
    }

    // 获取账户统计
    const statsData = await ApiClient.get('/user/stats')
    stats.value = {
      tunnel_count: statsData.tunnel_count || 0,
      total_traffic: statsData.total_traffic || 0,
      signin_days: statsData.signin_days || 0,
      points: statsData.points || 0
    }
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败')
  }
}

// 更新个人信息
const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    updating.value = true

    await ApiClient.put('/user/profile', {
      email: profileForm.email
    })

    // 更新本地用户信息
    if (authStore.user) {
      authStore.user.email = profileForm.email
    }

    message.success('个人信息更新成功')
  } catch (error: any) {
    console.error('更新个人信息失败:', error)
    message.error(error.message || '更新个人信息失败')
  } finally {
    updating.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    await ApiClient.put('/user/password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })

    // 清空表单
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''

    message.success('密码修改成功')
  } catch (error: any) {
    console.error('修改密码失败:', error)
    message.error(error.message || '修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #18a058;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile {
    margin: 0 1rem;
  }
  
  .stat-item {
    padding: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
}
</style>
