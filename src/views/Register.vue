<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 注册关闭提示 -->
      <div v-if="!registrationEnabled" class="register-disabled">
        <n-result status="warning" title="注册已关闭" description="系统管理员已关闭用户注册功能">
          <template #footer>
            <n-button @click="$router.push('/login')">返回登录</n-button>
          </template>
        </n-result>
      </div>

      <div v-else class="register-card" data-aos="fade-up" data-aos-duration="1000">
        <div class="register-header" data-aos="fade-down" data-aos-delay="200">
          <h1 class="register-title">XunFrp</h1>
          <p class="register-subtitle">创建您的账户</p>
        </div>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
          @submit.prevent="handleSubmit"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <n-form-item path="username" label="用户名">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名 (3-20位字母数字)"
              :disabled="loading"
            />
          </n-form-item>
          
          <n-form-item path="email" label="邮箱">
            <n-input
              v-model:value="formData.email"
              placeholder="请输入邮箱地址"
              :disabled="loading"
            />
          </n-form-item>
          
          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码 (至少6位)"
              :disabled="loading"
              show-password-on="mousedown"
            />
          </n-form-item>
          
          <n-form-item path="confirmPassword" label="确认密码">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :disabled="loading"
              show-password-on="mousedown"
            />
          </n-form-item>

          <n-form-item path="verifyCode" label="邮箱验证码">
            <n-input-group>
              <n-input
                v-model:value="formData.verifyCode"
                placeholder="请输入6位验证码"
                :disabled="loading"
                maxlength="6"
                style="flex: 1"
              />
              <n-button
                type="primary"
                ghost
                :disabled="!formData.email || !isValidEmail(formData.email) || sendingCode || countdown > 0"
                :loading="sendingCode"
                @click="sendVerifyCode"
                style="width: 120px"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </n-button>
            </n-input-group>
          </n-form-item>

          <n-form-item>
            <n-checkbox v-model:checked="agreeTerms" :disabled="loading">
              我已阅读并同意
              <a href="#" class="terms-link" @click.prevent="showTerms">《服务条款》</a>
              和
              <a href="#" class="terms-link" @click.prevent="showPrivacy">《隐私政策》</a>
            </n-checkbox>
          </n-form-item>
          
          <n-form-item>
            <n-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="loading || !agreeTerms"
              @click="handleSubmit"
              block
            >
              注册账户
            </n-button>
          </n-form-item>
        </n-form>
        
        <div class="register-footer">
          <p>
            已有账户？
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

    <!-- 人机验证弹窗 -->
    <CaptchaModal
      v-model:show="showCaptcha"
      @success="handleCaptchaSuccess"
      @cancel="handleCaptchaCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import CaptchaModal from '@/components/CaptchaModal.vue'
import { ApiClient } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { isValidEmail, isValidUsername, validatePassword } from '@/utils'
import type { RegisterRequest } from '@/types'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const agreeTerms = ref(false)
const registrationEnabled = ref(true)
const showCaptcha = ref(false)
let captchaToken = ''
let captchaAction = '' // 'sendCode' 或 'register'

const formData = reactive<RegisterRequest & { confirmPassword: string }>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
})

const rules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur'],
    },
    {
      validator: (rule, value) => {
        if (!isValidUsername(value)) {
          return new Error('用户名只能包含字母、数字、下划线和连字符，长度3-20位')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
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
  password: [
    {
      required: true,
      message: '请输入密码',
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
        if (value !== formData.password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
  verifyCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: ['input', 'blur'],
    },
    {
      validator: (rule, value) => {
        if (!/^\d{6}$/.test(value)) {
          return new Error('验证码必须为6位数字')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return

  if (!agreeTerms.value) {
    message.error('请先同意服务条款和隐私政策')
    return
  }

  try {
    await formRef.value.validate()

    // 显示人机验证
    captchaAction = 'register'
    showCaptcha.value = true
  } catch (error: any) {
    console.error('表单验证失败:', error)
  }
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!formData.email || !isValidEmail(formData.email)) {
    message.error('请先输入有效的邮箱地址')
    return
  }

  // 显示人机验证
  captchaAction = 'sendCode'
  showCaptcha.value = true
}

// 注册功能始终开启
const checkRegistrationStatus = async () => {
  // 注册功能始终开启，不再检查后台设置
  registrationEnabled.value = true
  console.log('✅ 注册功能已启用')
}

// 人机验证成功
const handleCaptchaSuccess = async (token: string) => {
  captchaToken = token

  if (captchaAction === 'sendCode') {
    // 发送验证码
    await doSendVerifyCode()
  } else if (captchaAction === 'register') {
    // 执行注册
    await doRegister()
  }
}

// 人机验证取消
const handleCaptchaCancel = () => {
  captchaToken = ''
  captchaAction = ''
  loading.value = false
  sendingCode.value = false
}

// 实际发送验证码
const doSendVerifyCode = async () => {
  try {
    sendingCode.value = true

    const response = await fetch('/api/v1/send-verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        captcha_token: captchaToken
      }),
    })

    const data = await response.json()

    if (data.code === 200) {
      message.success('验证码已发送，请查收邮件')
      startCountdown()
    } else {
      message.error(data.message || '发送失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    message.error('发送失败，请稍后重试')
  } finally {
    sendingCode.value = false
    captchaToken = ''
  }
}

// 实际执行注册
const doRegister = async () => {
  try {
    loading.value = true

    const response = await fetch('/api/v1/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        verify_code: formData.verifyCode
      }),
    })

    const data = await response.json()

    if (data.code === 200) {
      message.success('注册成功，请登录', {
        duration: 3000
      })
      router.push('/login')
    } else {
      message.error(data.message || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    message.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
    captchaToken = ''
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const showTerms = () => {
  message.info('服务条款功能待完善')
}

const showPrivacy = () => {
  message.info('隐私政策功能待完善')
}

// 页面加载时检查注册状态
onMounted(() => {
  checkRegistrationStatus()
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.register-disabled {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #64748b;
  margin: 0;
}

.terms-link {
  color: #2563eb;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.register-footer p {
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
  .register-card {
    padding: 1.5rem;
  }
  
  .register-title {
    font-size: 1.5rem;
  }
}
</style>
