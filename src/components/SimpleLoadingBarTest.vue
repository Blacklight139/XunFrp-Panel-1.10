<template>
  <div class="simple-loading-bar-test">
    <n-card title="简单进度条测试">
      <n-space vertical>
        <n-alert type="info">
          <template #header>
            <span>🧪 简单进度条测试</span>
          </template>
          测试浏览器顶部的进度条是否正常工作。
        </n-alert>

        <n-space>
          <n-button type="primary" @click="testDirectAccess">
            直接访问测试
          </n-button>
          
          <n-button type="success" @click="testWithDelay">
            延迟测试
          </n-button>
          
          <n-button type="warning" @click="testApiCall">
            API调用测试
          </n-button>
        </n-space>

        <n-divider />

        <div class="debug-info">
          <h4>调试信息：</h4>
          <pre>{{ debugInfo }}</pre>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { ApiClient } from '@/utils/api'

const message = useMessage()
const debugInfo = ref('')

// 更新调试信息
const updateDebugInfo = () => {
  const info = {
    windowLoadingBar: !!window.loadingBar,
    loadingBarType: typeof window.loadingBar,
    loadingBarMethods: window.loadingBar ? Object.keys(window.loadingBar) : [],
    timestamp: new Date().toISOString()
  }
  debugInfo.value = JSON.stringify(info, null, 2)
}

// 直接访问测试
const testDirectAccess = () => {
  console.log('直接访问测试')
  updateDebugInfo()
  
  if (window.loadingBar) {
    console.log('找到window.loadingBar，尝试启动')
    try {
      window.loadingBar.start()
      message.success('进度条启动成功')
      
      setTimeout(() => {
        window.loadingBar.finish()
        message.success('进度条完成')
      }, 2000)
    } catch (error) {
      console.error('进度条操作失败:', error)
      message.error('进度条操作失败: ' + error.message)
    }
  } else {
    console.error('window.loadingBar 不存在')
    message.error('进度条API不存在')
  }
}

// 延迟测试
const testWithDelay = async () => {
  console.log('延迟测试')
  
  // 等待一段时间再测试
  await new Promise(resolve => setTimeout(resolve, 500))
  
  updateDebugInfo()
  
  if (window.loadingBar && typeof window.loadingBar.start === 'function') {
    try {
      window.loadingBar.start()
      message.success('延迟测试：进度条启动成功')
      
      setTimeout(() => {
        if (window.loadingBar && typeof window.loadingBar.finish === 'function') {
          window.loadingBar.finish()
          message.success('延迟测试：进度条完成')
        }
      }, 2000)
    } catch (error) {
      console.error('延迟测试失败:', error)
      message.error('延迟测试失败: ' + error.message)
    }
  } else {
    message.error('延迟测试：进度条API仍然不可用')
  }
}

// API调用测试
const testApiCall = async () => {
  console.log('API调用测试')
  try {
    // 这会触发ApiClient的拦截器
    await ApiClient.get('/user/profile')
    message.success('API调用完成')
  } catch (error) {
    console.log('API调用失败（预期的）:', error)
    message.info('API调用完成（可能失败，但进度条应该工作）')
  }
  updateDebugInfo()
}

onMounted(() => {
  // 页面加载后立即检查
  updateDebugInfo()
  
  // 延迟检查
  setTimeout(() => {
    console.log('延迟检查进度条API')
    updateDebugInfo()
  }, 1000)
})
</script>

<style scoped>
.simple-loading-bar-test {
  padding: 20px;
}

.debug-info pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
