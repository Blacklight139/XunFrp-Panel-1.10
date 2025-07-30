<template>
  <div class="login-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 半透明遮罩 -->
    <div class="background-overlay"></div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <n-icon size="48" :component="LogInOutline" />
          </div>
          <h1>XunFrp</h1>
          <p>登录到您的账户</p>
        </div>

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
        >
          <n-form-item path="username" label="用户名/邮箱">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名或邮箱"
              :input-props="{ autocomplete: 'username' }"
            >
              <template #prefix>
                <n-icon :component="PersonOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
              :input-props="{ autocomplete: 'current-password' }"
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <div class="form-options">
            <n-checkbox v-model:checked="formData.remember">
              记住我
            </n-checkbox>
            <router-link to="/reset-password" class="forgot-link">
              忘记密码？
            </router-link>
          </div>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-form>

        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">
            立即注册
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { 
  LogInOutline, 
  PersonOutline, 
  LockClosedOutline,
  ArrowBackOutline 
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)
const backgroundImage = ref('')

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const rules = {
  username: [
    {
      required: true,
      message: '请输入用户名或邮箱',
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

// 处理登录
const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 使用authStore的login方法
    await authStore.login({
      username: formData.username,
      password: formData.password,
      remember: formData.remember
    })

    message.success('登录成功')

    // 跳转到仪表板
    router.push('/dashboard')
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error && error.message) {
      message.error(error.message)
    } else {
      message.error('登录失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getBackgroundImage()
  
  // 检查是否已登录
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  color: #18a058;
  margin-bottom: 1rem;
}

.login-header h1 {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #18a058;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #36ad6a;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.register-link {
  color: #18a058;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.register-link:hover {
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
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
  }
  
  .login-header h1 {
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
</style>
