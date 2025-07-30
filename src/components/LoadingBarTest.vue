<template>
  <div class="loading-bar-test">
    <n-card title="进度条测试">
      <n-space vertical>
        <n-alert type="info">
          <template #header>
            <span>🧪 进度条测试工具</span>
          </template>
          点击下面的按钮测试不同的进度条效果。进度条应该出现在浏览器顶部。
        </n-alert>

        <n-space>
          <n-button type="primary" @click="testStart">
            启动进度条
          </n-button>
          
          <n-button type="success" @click="testFinish">
            完成进度条
          </n-button>
          
          <n-button type="error" @click="testError">
            错误进度条
          </n-button>
          
          <n-button type="warning" @click="testApiRequest">
            测试API请求
          </n-button>

          <n-button type="info" @click="testLoadingBarDirect">
            直接测试进度条
          </n-button>

          <n-button type="tertiary" @click="testErrorLoadingBar">
            测试错误进度条
          </n-button>
        </n-space>

        <n-divider />

        <div class="test-info">
          <h4>测试说明：</h4>
          <ul>
            <li><strong>启动进度条</strong>：手动启动进度条，应该看到蓝色进度条开始移动</li>
            <li><strong>完成进度条</strong>：手动完成进度条，进度条应该到达100%并消失</li>
            <li><strong>错误进度条</strong>：显示红色错误进度条</li>
            <li><strong>测试API请求</strong>：发送真实的API请求，测试自动进度条</li>
          </ul>
        </div>

        <n-divider />

        <div class="debug-info">
          <h4>调试信息：</h4>
          <n-code :code="debugInfo" language="json" />
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiClient } from '@/utils/api'
import { useMessage } from 'naive-ui'
import { loadingBarManager } from '@/utils/loadingBar'

const message = useMessage()
const debugInfo = ref('')

// 更新调试信息
const updateDebugInfo = () => {
  const info = {
    ...loadingBarManager.getDebugInfo(),
    timestamp: new Date().toISOString()
  }
  debugInfo.value = JSON.stringify(info, null, 2)
}

// 测试启动进度条
const testStart = () => {
  console.log('测试启动进度条')
  const started = loadingBarManager.start()
  if (started) {
    message.success('进度条已启动')
  } else {
    message.error('进度条API未就绪')
  }
  updateDebugInfo()
}

// 测试完成进度条
const testFinish = () => {
  console.log('测试完成进度条')
  const finished = loadingBarManager.finish()
  if (finished) {
    message.success('进度条已完成')
  } else {
    message.error('进度条API未就绪')
  }
  updateDebugInfo()
}

// 测试错误进度条
const testError = () => {
  console.log('测试错误进度条')
  const errorShown = loadingBarManager.error()
  if (errorShown) {
    message.error('显示错误进度条')
  } else {
    message.error('进度条API未就绪')
  }
  updateDebugInfo()
}

// 测试API请求
const testApiRequest = async () => {
  console.log('测试API请求')
  try {
    // 发送一个真实的API请求来测试自动进度条
    await ApiClient.get('/user/profile')
    message.success('API请求成功')
  } catch (error) {
    console.log('API请求失败（这是正常的）:', error)
    message.info('API请求完成（可能失败，但进度条应该正常工作）')
  }
  updateDebugInfo()
}

// 直接测试进度条
const testLoadingBarDirect = () => {
  console.log('直接测试进度条')
  ApiClient.testLoadingBar()
  message.info('进度条测试已启动，请观察浏览器顶部')
  updateDebugInfo()
}

// 测试错误进度条
const testErrorLoadingBar = () => {
  console.log('测试错误进度条')
  ApiClient.testErrorLoadingBar()
  message.info('错误进度条测试已启动，请观察浏览器顶部')
  updateDebugInfo()
}

onMounted(() => {
  // 等待一下确保进度条API已初始化
  setTimeout(() => {
    updateDebugInfo()
  }, 100)
})
</script>

<style scoped>
.loading-bar-test {
  padding: 20px;
}

.test-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.test-info li {
  margin: 5px 0;
}

.debug-info {
  margin-top: 20px;
}
</style>
