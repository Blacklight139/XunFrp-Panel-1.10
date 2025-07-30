<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-card">
        <div class="reset-header">
          <h1 class="reset-title">XunFrp</h1>
          <p class="reset-subtitle">{{ step === 1 ? '重置密码' : step === 2 ? '设置新密码' : '重置完成' }}</p>
        </div>

        <!-- 调试信息 -->
        <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-size: 12px;">
          <p>当前步骤: {{ step }}</p>
          <p>Token: {{ passwordForm.token || '无' }}</p>
          <p>Loading: {{ loading }}</p>
          <p>Route query: {{ JSON.stringify($route.query) }}</p>
        </div>

        <!-- 步骤1: 输入邮箱 -->
        <div v-if="step === 1">
          <n-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            size="large"
            @submit.prevent="handleSendReset"
          >
            <n-form-item path="email" label="邮箱地址">
              <n-input
                v-model:value="emailForm.email"
                placeholder="请输入注册时使用的邮箱"
                :disabled="loading"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button
                type="primary"
                size="large"
                :loading="loading"
                :disabled="loading"
                @click="handleSendReset"
                block
              >
                发送重置链接
              </n-button>
            </n-form-item>
          </n-form>
        </div>
        
        <!-- 步骤2: 设置新密码 -->
        <div v-if="step === 2">
          <n-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            size="large"
            @submit.prevent="handleResetPassword"
          >
            <n-form-item path="newPassword" label="新密码">
              <n-input
                v-model:value="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码 (至少6位)"
                :disabled="loading"
                show-password-on="mousedown"
              />
            </n-form-item>
            
            <n-form-item path="confirmPassword" label="确认密码">
              <n-input
                v-model:value="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                :disabled="loading"
                show-password-on="mousedown"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button
                type="primary"
                size="large"
                :loading="loading"
                :disabled="loading"
                @click="handleResetPassword"
                block
              >
                重置密码
              </n-button>
            </n-form-item>
          </n-form>
        </div>
        
        <!-- 成功提示 -->
        <div v-if="step === 3" class="success-message">
          <div class="success-icon">✅</div>
          <h3>密码重置成功</h3>
          <p>您的密码已成功重置，请使用新密码登录。</p>
          <n-button type="primary" @click="$router.push('/login')">
            前往登录
          </n-button>
        </div>
        
        <div class="reset-footer">
          <p>
            记起密码了？
            <router-link to="/login" class="login-link">
              立即登录
            </router-link>
          </p>
          <p>
            <router-link to="/" class="home-link">
              返回首页
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { isValidEmail, validatePassword } from '@/utils'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const emailFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)
const loading = ref(false)
const step = ref(1)

const emailForm = reactive({
  email: '',
})

const passwordForm = reactive({
  token: '',
  newPassword: '',
  confirmPassword: '',
})

const emailRules: FormRules = {
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: ['input', 'blur'],
    },
    {
      validator: (rule, value) => {
        if (!isValidEmail(value)) {
          return new Error('请输入有效的邮箱地址')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const passwordRules: FormRules = {
  newPassword: [
    {
      required: true,
      message: '请输入新密码',
      trigger: ['input', 'blur'],
    },
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
  confirmPassword: [
    {
      required: true,
      message: '请确认密码',
      trigger: ['input', 'blur'],
    },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const handleSendReset = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    loading.value = true
    
    await ApiClient.post('/password-reset', {
      email: emailForm.email,
    })
    
    message.success('重置链接已发送到您的邮箱，请查收')
  } catch (error: any) {
    console.error('发送重置链接失败:', error)
    if (error && error.message) {
      message.error(error.message)
    } else {
      message.error('发送重置链接失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    loading.value = true
    
    await ApiClient.post('/password-reset/confirm', {
      token: passwordForm.token,
      new_password: passwordForm.newPassword,
    })
    
    step.value = 3
    message.success('密码重置成功')
  } catch (error: any) {
    console.error('密码重置失败:', error)
    if (error && error.message) {
      message.error(error.message)
    } else {
      message.error('密码重置失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('ResetPassword component mounted')
  console.log('Route query:', route.query)

  // 检查URL中是否有重置令牌
  const token = route.query.token as string
  console.log('Token from route:', token)

  if (token) {
    passwordForm.token = token
    step.value = 2
    console.log('Step set to 2, token:', token)
  } else {
    console.log('No token found, staying on step 1')
  }
})
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.reset-container {
  width: 100%;
  max-width: 400px;
}

.reset-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.reset-subtitle {
  color: #64748b;
  margin: 0;
}

.success-message {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-message h3 {
  color: #10b981;
  margin-bottom: 1rem;
}

.success-message p {
  color: #64748b;
  margin-bottom: 2rem;
}

.reset-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.reset-footer p {
  margin: 0.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.login-link,
.home-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover,
.home-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .reset-card {
    padding: 1.5rem;
  }
  
  .reset-title {
    font-size: 1.5rem;
  }
}
</style>
