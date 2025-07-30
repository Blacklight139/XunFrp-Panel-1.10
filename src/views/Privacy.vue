<template>
  <div class="privacy-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 半透明遮罩 -->
    <div class="background-overlay"></div>
    
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <div class="logo">
            <h2>XunFrp</h2>
          </div>
          <div class="nav-actions">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/login" class="nav-link">登录</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="content-container">
      <div class="document-card">
        <div class="document-header">
          <n-icon size="48" :component="ShieldCheckmarkOutline" />
          <h1>隐私政策</h1>
          <p>我们重视您的隐私权保护</p>
        </div>
        
        <div class="document-content" v-html="privacyContent"></div>
        
        <div class="document-footer">
          <n-button @click="goBack" type="primary">
            <template #icon>
              <n-icon :component="ArrowBackOutline" />
            </template>
            返回
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheckmarkOutline, ArrowBackOutline } from '@vicons/ionicons5'
import { marked } from 'marked'

const router = useRouter()
const backgroundImage = ref('')
const privacyContent = ref('')

// 获取背景图片
const getBackgroundImage = () => {
  const isMobileDevice = window.innerWidth <= 768
  const apiUrl = isMobileDevice 
    ? 'https://uapis.cn/api/imgapi/acg/mb.php'
    : 'https://uapis.cn/api/imgapi/acg/pc.php'
  
  backgroundImage.value = apiUrl
}

// 加载隐私政策内容
const loadPrivacyContent = async () => {
  try {
    const response = await fetch('/docs/privacy.md')
    const markdown = await response.text()
    privacyContent.value = marked(markdown)
  } catch (error) {
    console.error('加载隐私政策失败:', error)
    privacyContent.value = `
      <h1>隐私政策 - XunFrp</h1>
      <p>我们非常重视用户的隐私权保护。本隐私政策旨在向您解释我们如何收集、使用、共享以及保护您的个人信息。</p>
      <h2>1. 数据收集</h2>
      <p>我们可能收集并存储用户提供的个人信息和自动收集的设备信息。</p>
      <h2>2. 数据使用</h2>
      <p>我们收集的用户信息将被用于提供服务、个性化体验和通知沟通。</p>
      <h2>3. 数据安全</h2>
      <p>我们采取合理的安全措施，保护用户信息免受未经授权的访问、修改或泄露。</p>
      <p>如有任何问题或疑虑，请联系我们：admin@xunfrp.com</p>
    `
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  getBackgroundImage()
  loadPrivacyContent()
})
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.navbar {
  position: relative;
  z-index: 10;
  padding: 1rem 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.content-container {
  position: relative;
  z-index: 2;
  padding: 4rem 0;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.document-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
  margin: 0 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.document-header {
  text-align: center;
  margin-bottom: 3rem;
}

.document-header .n-icon {
  color: #18a058;
  margin-bottom: 1rem;
}

.document-header h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.document-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

.document-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 1rem;
}

.document-content :deep(h1) {
  color: white;
  font-size: 2rem;
  margin: 2rem 0 1rem 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.document-content :deep(h2) {
  color: white;
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem 0;
}

.document-content :deep(h3) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin: 1rem 0 0.5rem 0;
}

.document-content :deep(p) {
  margin: 1rem 0;
}

.document-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.document-content :deep(li) {
  margin: 0.5rem 0;
}

.document-content :deep(strong) {
  color: white;
  font-weight: 600;
}

.document-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 2rem 0;
}

.document-footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .document-card {
    padding: 2rem;
    margin: 0 1rem;
  }
  
  .document-header h1 {
    font-size: 2rem;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
