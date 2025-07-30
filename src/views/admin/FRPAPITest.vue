<template>
  <div class="frp-api-test">
    <div class="page-header">
      <h1>FRP API对接测试</h1>
      <p>测试面板系统的FRP API接口功能</p>
    </div>

    <!-- API配置 -->
    <n-card title="API配置" class="config-card">
      <n-form :model="apiConfig" label-placement="left" label-width="120px">
        <n-grid :cols="2" :x-gap="16">
          <n-grid-item>
            <n-form-item label="API基础URL">
              <n-input v-model:value="apiConfig.baseUrl" placeholder="http://localhost:8080/api/v1/frp" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="API Token">
              <n-input v-model:value="apiConfig.apiToken" placeholder="xunfrp_api_token_2024" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="测试用户">
              <n-input v-model:value="apiConfig.testUser" placeholder="testuser123" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="测试Token">
              <n-input v-model:value="apiConfig.testToken" placeholder="xunfrptoken" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </n-form>
    </n-card>

    <!-- 测试控制面板 -->
    <n-card title="测试控制" class="control-card">
      <n-space>
        <n-button type="primary" @click="runAllTests" :loading="testing">
          <template #icon>
            <n-icon :component="PlayOutline" />
          </template>
          运行所有测试
        </n-button>
        <n-button @click="clearResults">
          <template #icon>
            <n-icon :component="TrashOutline" />
          </template>
          清空结果
        </n-button>
        <n-switch v-model:value="autoScroll">
          <template #checked>自动滚动</template>
          <template #unchecked>手动滚动</template>
        </n-switch>
      </n-space>
    </n-card>

    <!-- API测试项目 -->
    <n-card title="API测试项目">
      <n-grid :cols="2" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="test in apiTests" :key="test.name">
          <n-card size="small" :title="test.name">
            <template #header-extra>
              <n-tag :type="getTestStatusType(test.status)">
                {{ getTestStatusText(test.status) }}
              </n-tag>
            </template>
            
            <div class="test-info">
              <p><strong>描述:</strong> {{ test.description }}</p>
              <p><strong>方法:</strong> {{ test.method }}</p>
              <p><strong>路径:</strong> {{ test.path }}</p>
            </div>
            
            <template #footer>
              <n-space justify="space-between">
                <n-button size="small" @click="runSingleTest(test)" :loading="test.testing">
                  测试
                </n-button>
                <span v-if="test.responseTime" class="response-time">
                  {{ test.responseTime }}ms
                </span>
              </n-space>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 测试结果 -->
    <n-card title="测试结果" class="results-card">
      <template #header-extra>
        <n-space>
          <n-tag type="success">成功: {{ successCount }}</n-tag>
          <n-tag type="error">失败: {{ failureCount }}</n-tag>
          <n-tag type="info">总计: {{ testResults.length }}</n-tag>
        </n-space>
      </template>
      
      <div ref="resultsContainer" class="results-container">
        <div v-if="testResults.length === 0" class="no-results">
          暂无测试结果，点击"运行所有测试"开始测试
        </div>
        <div v-else class="results-list">
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            :class="['result-item', `result-${result.status}`]"
          >
            <div class="result-header">
              <span class="result-name">{{ result.name }}</span>
              <span class="result-time">{{ formatTime(result.timestamp) }}</span>
              <n-tag :type="result.status === 'success' ? 'success' : 'error'" size="small">
                {{ result.status === 'success' ? '成功' : '失败' }}
              </n-tag>
            </div>
            
            <div class="result-details">
              <div class="result-request">
                <strong>请求:</strong> {{ result.method }} {{ result.url }}
              </div>
              
              <div v-if="result.status === 'success'" class="result-response">
                <strong>响应:</strong> {{ result.responseTime }}ms
                <pre>{{ JSON.stringify(result.response, null, 2) }}</pre>
              </div>
              
              <div v-else class="result-error">
                <strong>错误:</strong> {{ result.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { 
  NCard, NForm, NFormItem, NInput, NGrid, NGridItem, NButton, NSpace, 
  NIcon, NSwitch, NTag, useMessage 
} from 'naive-ui'
import { PlayOutline, TrashOutline } from '@vicons/ionicons5'
import axios from 'axios'
import CryptoJS from 'crypto-js'

const message = useMessage()

// API配置
const apiConfig = reactive({
  baseUrl: 'http://localhost:8080/api/v1/frp',
  apiToken: 'xunfrp_api_token_2025',
  testUser: 'testuser123',
  testToken: 'xunfrptoken'
})

// 测试状态
const testing = ref(false)
const autoScroll = ref(true)
const resultsContainer = ref<HTMLElement>()

// 测试结果
const testResults = ref<Array<{
  name: string
  method: string
  url: string
  status: 'success' | 'error'
  response?: any
  error?: string
  responseTime: number
  timestamp: number
}>>([])

// API测试项目
const apiTests = ref([
  {
    name: 'CheckToken',
    description: '用户Token验证',
    method: 'GET',
    path: '?action=checktoken',
    status: 'pending' as 'pending' | 'success' | 'error',
    testing: false,
    responseTime: 0
  },
  {
    name: 'CheckProxy',
    description: '隧道配置验证',
    method: 'GET', 
    path: '?action=checkproxy',
    status: 'pending' as 'pending' | 'success' | 'error',
    testing: false,
    responseTime: 0
  },
  {
    name: 'GetLimit',
    description: '获取带宽限制',
    method: 'GET',
    path: '?action=getlimit',
    status: 'pending' as 'pending' | 'success' | 'error',
    testing: false,
    responseTime: 0
  },
  {
    name: 'GetConfig',
    description: '获取配置文件',
    method: 'GET',
    path: '?action=getcfg',
    status: 'pending' as 'pending' | 'success' | 'error',
    testing: false,
    responseTime: 0
  }
])

// 计算属性
const successCount = computed(() => testResults.value.filter(r => r.status === 'success').length)
const failureCount = computed(() => testResults.value.filter(r => r.status === 'error').length)

// 生成MD5哈希
const generateMD5Hash = (token: string, timestamp: number): string => {
  return CryptoJS.MD5(token + timestamp.toString()).toString()
}

// 获取当前时间戳
const getCurrentTimestamp = (): number => {
  return Math.floor(Date.now() / 1000)
}

// 构建测试URL
const buildTestUrl = (test: any): string => {
  const timestamp = getCurrentTimestamp()
  const baseUrl = apiConfig.baseUrl + test.path
  
  switch (test.name) {
    case 'CheckToken':
      const tokenHash = generateMD5Hash(apiConfig.testToken, timestamp)
      return `${baseUrl}&user=${apiConfig.testUser}&token=${tokenHash}&timestamp=${timestamp}&apitoken=${apiConfig.apiToken}`
    
    case 'CheckProxy':
      return `${baseUrl}&user=${apiConfig.testUser}&proxy_name=test_ssh&proxy_type=tcp&apitoken=${apiConfig.apiToken}`
    
    case 'GetLimit':
      return `${baseUrl}&user=${apiConfig.testUser}&timestamp=${timestamp}&apitoken=${apiConfig.apiToken}`
    
    case 'GetConfig':
      return `${baseUrl}&token=${apiConfig.testUser}&id=1`
    
    default:
      return baseUrl
  }
}

// 运行单个测试
const runSingleTest = async (test: any) => {
  test.testing = true
  const startTime = Date.now()
  
  try {
    const url = buildTestUrl(test)
    console.log(`测试 ${test.name}:`, url)
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const responseTime = Date.now() - startTime
    test.responseTime = responseTime
    test.status = 'success'
    
    // 记录测试结果
    testResults.value.push({
      name: test.name,
      method: test.method,
      url: url,
      status: 'success',
      response: response.data,
      responseTime,
      timestamp: Date.now()
    })
    
    message.success(`${test.name} 测试成功`)
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    test.responseTime = responseTime
    test.status = 'error'
    
    console.error(`${test.name} 测试失败:`, error)
    
    // 记录测试结果
    testResults.value.push({
      name: test.name,
      method: test.method,
      url: buildTestUrl(test),
      status: 'error',
      error: error.response?.data?.message || error.message || '请求失败',
      responseTime,
      timestamp: Date.now()
    })
    
    message.error(`${test.name} 测试失败: ${error.response?.data?.message || error.message}`)
  } finally {
    test.testing = false
    
    // 自动滚动到底部
    if (autoScroll.value) {
      await nextTick()
      if (resultsContainer.value) {
        resultsContainer.value.scrollTop = resultsContainer.value.scrollHeight
      }
    }
  }
}

// 运行所有测试
const runAllTests = async () => {
  testing.value = true
  
  try {
    // 重置所有测试状态
    apiTests.value.forEach(test => {
      test.status = 'pending'
      test.responseTime = 0
    })
    
    // 依次运行所有测试
    for (const test of apiTests.value) {
      await runSingleTest(test)
      // 测试间隔500ms
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    message.success('所有测试完成')
  } catch (error) {
    console.error('测试过程中出现错误:', error)
    message.error('测试过程中出现错误')
  } finally {
    testing.value = false
  }
}

// 清空结果
const clearResults = () => {
  testResults.value = []
  apiTests.value.forEach(test => {
    test.status = 'pending'
    test.responseTime = 0
  })
  message.info('测试结果已清空')
}

// 获取测试状态类型
const getTestStatusType = (status: string) => {
  switch (status) {
    case 'success': return 'success'
    case 'error': return 'error'
    default: return 'default'
  }
}

// 获取测试状态文本
const getTestStatusText = (status: string) => {
  switch (status) {
    case 'success': return '成功'
    case 'error': return '失败'
    default: return '待测试'
  }
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.frp-api-test {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.config-card,
.control-card {
  margin-bottom: 24px;
}

.test-info {
  font-size: 12px;
  color: #666;
}

.test-info p {
  margin: 4px 0;
}

.response-time {
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.results-card {
  margin-top: 24px;
}

.results-container {
  max-height: 600px;
  overflow-y: auto;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.result-item.result-success {
  border-color: #52c41a;
  background-color: #f6ffed;
}

.result-item.result-error {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-name {
  font-weight: 600;
  font-size: 16px;
}

.result-time {
  font-size: 12px;
  color: #666;
}

.result-details {
  font-size: 14px;
}

.result-request {
  margin-bottom: 8px;
  color: #666;
}

.result-response pre,
.result-error {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-error {
  color: #ff4d4f;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}
</style>
