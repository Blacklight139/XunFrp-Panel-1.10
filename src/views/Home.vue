<template>
  <div class="home">
    <!-- 导航栏 -->
    <header class="header">
      <div class="container">
        <div class="nav">
          <div class="logo">
            <h1>XunFrp</h1>
            <span class="tagline">高速稳定的内网穿透服务</span>
          </div>
          <div class="nav-links">
            <router-link to="/nodes" class="nav-link">节点状态</router-link>
            <router-link to="/downloads" class="nav-link">客户端下载</router-link>
            <a href="#" class="nav-link" @click.prevent="handleDocs">使用文档</a>
            <router-link to="/login" class="nav-link" v-if="!authStore.isAuthenticated">登录</router-link>
            <router-link to="/register" class="nav-link" v-if="!authStore.isAuthenticated">注册</router-link>
            <router-link to="/dashboard" class="nav-link" v-if="authStore.isAuthenticated">用户面板</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <!-- Hero区域 -->
      <section class="hero" id="hero-section">
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">XunFrp</h1>
              <h2 class="hero-subtitle">高速稳定的内网穿透服务</h2>
              <p class="hero-description">
                为开发者和企业提供专业、稳定、高速的内网穿透解决方案<br>
                支持TCP、UDP、HTTP、HTTPS多种协议，让您的本地服务轻松对外访问
              </p>
              <div class="hero-actions">
                <n-button
                  type="primary"
                  size="large"
                  @click="handleGetStarted"
                  class="get-started-btn"
                >
                  开始使用
                </n-button>
                <n-button
                  size="large"
                  @click="handleDocs"
                  class="docs-btn"
                >
                  使用文档
                </n-button>
              </div>
            </div>
            <div class="hero-image">
              <div class="hero-graphic">
                <div class="network-node"></div>
                <div class="network-lines"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 统计信息 -->
      <section class="stats">
        <div class="container">
          <h2 class="section-title">实时统计</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">👥</div>
              <div class="stat-number">{{ stats.total_users || 0 }}</div>
              <div class="stat-label">注册用户</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🌐</div>
              <div class="stat-number">{{ stats.total_nodes || 0 }}</div>
              <div class="stat-label">服务节点</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🚇</div>
              <div class="stat-number">{{ stats.total_tunnels || 0 }}</div>
              <div class="stat-label">活跃隧道</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-number">{{ stats.online_nodes || 0 }}</div>
              <div class="stat-label">在线节点</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>XunFrp</h3>
            <p>专业的内网穿透服务平台</p>
          </div>
          <div class="footer-section">
            <h4>服务</h4>
            <ul>
              <li><router-link to="/nodes">节点状态</router-link></li>
              <li><router-link to="/downloads">客户端下载</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>支持</h4>
            <ul>
              <li><a href="https://docs.yinuo8394.top" target="_blank" rel="noopener">使用文档</a></li>
              <li><a href="#">联系我们</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 XunFrp. All rights reserved. | <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">浙ICP备2025165647号</a></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiClient } from '@/utils/api'
import { formatBytes } from '@/utils'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  total_users: 0,
  total_nodes: 0,
  total_tunnels: 0,
  online_nodes: 0
})

// 处理开始使用按钮
const handleGetStarted = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

// 处理使用文档
const handleDocs = () => {
  // 跳转到使用文档
  window.open('https://docs.yinuo8394.top', '_blank')
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await ApiClient.get('/stats')
    console.log('统计数据响应:', response) // 调试日志
    stats.value = response
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 设置背景图
const setBackgroundImage = () => {
  const isMobileDevice = window.innerWidth <= 768
  const bgUrl = isMobileDevice
    ? 'https://uapis.cn/api/imgapi/acg/mb.php'
    : 'https://uapis.cn/api/imgapi/acg/pc.php'

  const heroEl = document.querySelector('#hero-section') as HTMLElement
  if (heroEl) {
    heroEl.style.backgroundImage = `url('${bgUrl}')`
    heroEl.style.backgroundSize = 'cover'
    heroEl.style.backgroundPosition = 'center'
    heroEl.style.backgroundAttachment = 'fixed'
  }
}

onMounted(() => {
  fetchStats()
  setBackgroundImage()

  // 监听窗口大小变化
  window.addEventListener('resize', setBackgroundImage)
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(45deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.tagline {
  font-size: 0.8rem;
  color: #64748b;
  margin-left: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #2563eb;
}

/* Hero区域样式 */
.hero {
  background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
  color: white;
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero .container {
  position: relative;
  z-index: 2;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
}

.hero-text {
  text-align: left;
}

.hero-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  font-weight: 500;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-graphic {
  width: 300px;
  height: 300px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.network-node {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #ffffff, #e0f2fe);
  border-radius: 50%;
  position: relative;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 统计信息样式 */
.stats {
  padding: 4rem 0;
  background: #f8fafc;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-item {
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(37, 99, 235, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #10b981);
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(45deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
}

/* 页脚样式 */
.footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: #10b981;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #10b981;
}

.footer-bottom {
  border-top: 1px solid #334155;
  padding-top: 1rem;
  text-align: center;
  color: #94a3b8;
}

.footer-bottom a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-bottom a:hover {
  color: #10b981;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-text {
    text-align: center;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
