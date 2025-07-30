<template>
  <div class="register-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 半透明遮罩 -->
    <div class="background-overlay"></div>
    
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo">
            <n-icon size="48" :component="PersonAddOutline" />
          </div>
          <h1>XunFrp</h1>
          <p>创建您的账户</p>
        </div>

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
        >
          <n-form-item path="username" label="用户名">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名"
              :input-props="{ autocomplete: 'username' }"
            >
              <template #prefix>
                <n-icon :component="PersonOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="email" label="邮箱">
            <n-input
              v-model:value="formData.email"
              placeholder="请输入邮箱地址"
              :input-props="{ autocomplete: 'email' }"
            >
              <template #prefix>
                <n-icon :component="MailOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="confirmPassword" label="确认密码">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password-on="click"
              :input-props="{ autocomplete: 'new-password' }"
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="verificationCode" label="验证码">
            <n-input-group>
              <n-input
                v-model:value="formData.verificationCode"
                placeholder="请输入邮箱验证码"
                style="flex: 1"
              >
                <template #prefix>
                  <n-icon :component="ShieldCheckmarkOutline" />
                </template>
              </n-input>
              <n-button
                type="primary"
                :disabled="!canSendCode || sendingCode"
                :loading="sendingCode"
                @click="sendVerificationCode"
              >
                {{ codeButtonText }}
              </n-button>
            </n-input-group>
          </n-form-item>

          <div class="form-options">
            <n-checkbox v-model:checked="formData.agreeTerms">
              我已阅读并同意
              <router-link to="/terms" class="link">服务条款</router-link>
              和
              <router-link to="/privacy" class="link">隐私政策</router-link>
            </n-checkbox>
          </div>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            :disabled="!formData.agreeTerms"
            @click="handleRegister"
          >
            注册
          </n-button>
        </n-form>

        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">
            立即登录
          </router-link>
        </div>

        <div class="back-home">
          <router-link to="/" class="home-link">
            <n-icon :component="ArrowBackOutline" />
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { 
  PersonAddOutline,
  PersonOutline, 
  MailOutline,
  LockClosedOutline,
  ShieldCheckmarkOutline,
  ArrowBackOutline 
} from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const router = useRouter()
const message = useMessage()
const formRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const backgroundImage = ref('')

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  agreeTerms: false
})

// 验证码按钮文本
const codeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s` : '发送验证码'
})

// 是否可以发送验证码
const canSendCode = computed(() => {
  return formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && countdown.value === 0
})

// 表单验证规则
const rules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur']
    },
    {
      min: 3,
      max: 20,
      message: '用户名长度为3-20个字符',
      trigger: ['input', 'blur']
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: ['input', 'blur']
    }
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱地址',
      trigger: ['input', 'blur']
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur']
    },
    {
      min: 6,
      message: '密码长度不能少于6位',
      trigger: ['input', 'blur']
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: '请确认密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (rule: any, value: string) => {
        return value === formData.password
      },
      message: '两次输入的密码不一致',
      trigger: ['input', 'blur']
    }
  ],
  verificationCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: ['input', 'blur']
    },
    {
      len: 6,
      message: '验证码为6位数字',
      trigger: ['input', 'blur']
    }
  ]
}

// 获取背景图片
const getBackgroundImage = () => {
  const isMobileDevice = window.innerWidth <= 768
  const apiUrl = isMobileDevice 
    ? 'https://uapis.cn/api/imgapi/acg/mb.php'
    : 'https://uapis.cn/api/imgapi/acg/pc.php'
  
  backgroundImage.value = apiUrl
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!canSendCode.value) return

  try {
    sendingCode.value = true
    
    const response = await ApiClient.post('/send-verify-code', {
      email: formData.email,
      type: 'register'
    })

    if (response.code === 200) {
      message.success('验证码已发送到您的邮箱')
      
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      message.error(response.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    message.error(error.response?.data?.message || '发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const response = await ApiClient.post('/register', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      verification_code: formData.verificationCode
    })

    if (response.code === 200) {
      message.success('注册成功，请登录')
      router.push('/login')
    } else {
      message.error(response.message || '注册失败')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('注册失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getBackgroundImage()
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem 0;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.register-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

.register-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  color: #18a058;
  margin-bottom: 1rem;
}

.register-header h1 {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.register-header p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.form-options {
  margin-bottom: 1.5rem;
}

.link {
  color: #18a058;
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: #36ad6a;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.login-link {
  color: #18a058;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #36ad6a;
}

.back-home {
  text-align: center;
  margin-top: 1.5rem;
}

.home-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.home-link:hover {
  color: white;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-card {
    padding: 2rem;
  }
  
  .register-header h1 {
    font-size: 1.75rem;
  }
}

/* 表单项样式覆盖 */
:deep(.n-form-item-label) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.n-input) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.n-input:hover) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.n-input:focus-within) {
  border-color: #18a058 !important;
}

:deep(.n-input .n-input__input-el) {
  color: white !important;
}

:deep(.n-input .n-input__placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.n-checkbox .n-checkbox__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.n-input-group .n-input-group__suffix) {
  background: transparent !important;
}
</style>
