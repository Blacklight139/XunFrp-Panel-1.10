<template>
  <div class="frp-api-monitor">
    <div class="page-header">
      <h1>FRP API监控</h1>
      <p>监控FRP服务端API调用情况和系统状态</p>
    </div>

    <!-- API统计卡片 -->
    <div class="stats-cards">
      <n-card title="今日API调用" class="stat-card">
        <div class="stat-number">{{ apiStats.today_calls }}</div>
        <div class="stat-label">次调用</div>
      </n-card>
      <n-card title="成功率" class="stat-card">
        <div class="stat-number">{{ apiStats.success_rate }}%</div>
        <div class="stat-label">成功率</div>
      </n-card>
      <n-card title="平均响应时间" class="stat-card">
        <div class="stat-number">{{ apiStats.avg_response_time }}ms</div>
        <div class="stat-label">响应时间</div>
      </n-card>
      <n-card title="活跃连接" class="stat-card">
        <div class="stat-number">{{ apiStats.active_connections }}</div>
        <div class="stat-label">个连接</div>
      </n-card>
    </div>

    <!-- API接口状态 -->
    <n-card title="API接口状态" class="api-status-card">
      <n-grid :cols="2" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="endpoint in apiEndpoints" :key="endpoint.name">
          <n-card size="small">
            <div class="endpoint-item">
              <div class="endpoint-info">
                <h4>{{ endpoint.name }}</h4>
                <p>{{ endpoint.description }}</p>
                <n-tag :type="endpoint.status === 'healthy' ? 'success' : 'error'">
                  {{ endpoint.status === 'healthy' ? '正常' : '异常' }}
                </n-tag>
              </div>
              <div class="endpoint-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ endpoint.calls_today }}</span>
                  <span class="stat-label">今日调用</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ endpoint.avg_response }}ms</span>
                  <span class="stat-label">平均响应</span>
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 实时日志 -->
    <n-card title="实时API调用日志">
      <template #header-extra>
        <n-space>
          <n-switch v-model:value="autoRefresh" @update:value="toggleAutoRefresh">
            <template #checked>自动刷新</template>
            <template #unchecked>手动刷新</template>
          </n-switch>
          <n-button @click="refreshLogs">
            <template #icon>
              <n-icon :component="RefreshOutline" />
            </template>
            刷新
          </n-button>
          <n-button @click="clearLogs">清空日志</n-button>
        </n-space>
      </template>
      
      <div class="log-container">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          :class="['log-item', `log-${log.level}`]"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-action">{{ log.action }}</span>
          <span class="log-user">{{ log.user }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span class="log-response-time">{{ log.response_time }}ms</span>
        </div>
      </div>
    </n-card>

    <!-- API配置 -->
    <n-card title="API配置">
      <n-form :model="apiConfig" label-placement="left" label-width="120px">
        <n-form-item label="API基础URL">
          <n-input v-model:value="apiConfig.base_url" placeholder="http://your-domain.com/api/v1/frp" />
        </n-form-item>
        <n-form-item label="API Token">
          <n-input 
            v-model:value="apiConfig.api_token" 
            type="password" 
            show-password-on="click"
            placeholder="API访问令牌"
          />
        </n-form-item>
        <n-form-item label="请求超时">
          <n-input-number 
            v-model:value="apiConfig.timeout" 
            :min="1" 
            :max="60" 
            suffix="秒"
          />
        </n-form-item>
        <n-form-item label="启用日志">
          <n-switch v-model:value="apiConfig.enable_logging" />
        </n-form-item>
        <n-form-item label="日志级别">
          <n-select 
            v-model:value="apiConfig.log_level" 
            :options="logLevelOptions"
            :disabled="!apiConfig.enable_logging"
          />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="saveConfig" :loading="saving">保存配置</n-button>
            <n-button @click="testAPI">测试API连接</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 测试结果模态框 -->
    <n-modal v-model:show="testModalVisible" preset="dialog" title="API连接测试">
      <div v-if="testResult">
        <n-result
          :status="testResult.success ? 'success' : 'error'"
          :title="testResult.success ? '连接成功' : '连接失败'"
        >
          <template #footer>
            <n-space vertical>
              <div v-if="testResult.success">
                <p>响应时间: {{ testResult.response_time }}ms</p>
                <p>API版本: {{ testResult.version }}</p>
              </div>
              <div v-else>
                <p>错误信息: {{ testResult.error }}</p>
              </div>
            </n-space>
          </template>
        </n-result>
      </div>
      <n-spin v-else />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { 
  NCard, NGrid, NGridItem, NTag, NSpace, NButton, NIcon, NSwitch, 
  NForm, NFormItem, NInput, NInputNumber, NSelect, NModal, NResult, 
  NSpin, useMessage 
} from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

interface APIStats {
  today_calls: number
  success_rate: number
  avg_response_time: number
  active_connections: number
}

interface APIEndpoint {
  name: string
  description: string
  status: 'healthy' | 'error'
  calls_today: number
  avg_response: number
}

interface LogEntry {
  id: number
  timestamp: string
  level: 'info' | 'warn' | 'error'
  action: string
  user: string
  message: string
  response_time: number
}

interface APIConfig {
  base_url: string
  api_token: string
  timeout: number
  enable_logging: boolean
  log_level: string
}

interface TestResult {
  success: boolean
  response_time?: number
  version?: string
  error?: string
}

const message = useMessage()

// 响应式数据
const apiStats = ref<APIStats>({
  today_calls: 0,
  success_rate: 0,
  avg_response_time: 0,
  active_connections: 0
})

const apiEndpoints = ref<APIEndpoint[]>([
  {
    name: 'CheckToken',
    description: '用户Token验证',
    status: 'healthy',
    calls_today: 0,
    avg_response: 0
  },
  {
    name: 'CheckProxy',
    description: '隧道配置验证',
    status: 'healthy',
    calls_today: 0,
    avg_response: 0
  },
  {
    name: 'GetLimit',
    description: '获取带宽限制',
    status: 'healthy',
    calls_today: 0,
    avg_response: 0
  },
  {
    name: 'GetConfig',
    description: '获取配置文件',
    status: 'healthy',
    calls_today: 0,
    avg_response: 0
  }
])

const logs = ref<LogEntry[]>([])
const autoRefresh = ref(false)
const testModalVisible = ref(false)
const testResult = ref<TestResult | null>(null)
const saving = ref(false)

const apiConfig = reactive<APIConfig>({
  base_url: 'http://localhost:8080/api/v1/frp',
  api_token: 'xunfrp_api_token_2024',
  timeout: 30,
  enable_logging: true,
  log_level: 'info'
})

const logLevelOptions = [
  { label: 'Debug', value: 'debug' },
  { label: 'Info', value: 'info' },
  { label: 'Warn', value: 'warn' },
  { label: 'Error', value: 'error' }
]

let refreshInterval: number | null = null

// 方法
const fetchAPIStats = async () => {
  try {
    // 模拟API统计数据
    apiStats.value = {
      today_calls: Math.floor(Math.random() * 1000) + 500,
      success_rate: Math.floor(Math.random() * 10) + 90,
      avg_response_time: Math.floor(Math.random() * 50) + 20,
      active_connections: Math.floor(Math.random() * 20) + 10
    }
    
    // 更新端点统计
    apiEndpoints.value.forEach(endpoint => {
      endpoint.calls_today = Math.floor(Math.random() * 200) + 50
      endpoint.avg_response = Math.floor(Math.random() * 30) + 10
      endpoint.status = Math.random() > 0.1 ? 'healthy' : 'error'
    })
  } catch (error: any) {
    console.error('获取API统计失败:', error)
    message.error(error.message || '获取API统计失败')
  }
}

const fetchLogs = async () => {
  try {
    // 模拟日志数据
    const newLogs: LogEntry[] = []
    for (let i = 0; i < 10; i++) {
      const actions = ['checktoken', 'checkproxy', 'getlimit', 'getcfg']
      const levels: ('info' | 'warn' | 'error')[] = ['info', 'info', 'info', 'warn', 'error']
      const users = ['user123', 'testuser', 'admin', 'demo_user']
      
      newLogs.push({
        id: Date.now() + i,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        user: users[Math.floor(Math.random() * users.length)],
        message: '请求处理成功',
        response_time: Math.floor(Math.random() * 100) + 10
      })
    }
    
    logs.value = newLogs.concat(logs.value).slice(0, 100) // 保留最新100条
  } catch (error: any) {
    console.error('获取日志失败:', error)
    message.error(error.message || '获取日志失败')
  }
}

const refreshLogs = () => {
  fetchLogs()
}

const clearLogs = () => {
  logs.value = []
  message.success('日志已清空')
}

const toggleAutoRefresh = (value: boolean) => {
  if (value) {
    refreshInterval = window.setInterval(() => {
      fetchAPIStats()
      fetchLogs()
    }, 5000) // 每5秒刷新一次
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
}

const saveConfig = async () => {
  try {
    saving.value = true
    // 这里应该调用API保存配置
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    message.success('配置保存成功')
  } catch (error: any) {
    console.error('保存配置失败:', error)
    message.error(error.message || '保存配置失败')
  } finally {
    saving.value = false
  }
}

const testAPI = async () => {
  testModalVisible.value = true
  testResult.value = null
  
  try {
    const startTime = Date.now()
    // 这里应该调用实际的API测试
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    const responseTime = Date.now() - startTime
    
    testResult.value = {
      success: true,
      response_time: responseTime,
      version: '1.0.0'
    }
  } catch (error: any) {
    console.error('API测试失败:', error)
    testResult.value = {
      success: false,
      error: error.message || 'API连接失败'
    }
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

onMounted(() => {
  fetchAPIStats()
  fetchLogs()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.frp-api-monitor {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #18a058;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.api-status-card {
  margin-bottom: 24px;
}

.endpoint-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.endpoint-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.endpoint-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.endpoint-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #18a058;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.log-item.log-error {
  background-color: #fef2f2;
}

.log-item.log-warn {
  background-color: #fffbeb;
}

.log-time {
  color: #666;
  min-width: 80px;
}

.log-level {
  min-width: 50px;
  font-weight: bold;
}

.log-level:contains("ERROR") {
  color: #dc2626;
}

.log-level:contains("WARN") {
  color: #d97706;
}

.log-level:contains("INFO") {
  color: #059669;
}

.log-action {
  min-width: 100px;
  color: #2563eb;
}

.log-user {
  min-width: 80px;
  color: #7c3aed;
}

.log-message {
  flex: 1;
}

.log-response-time {
  min-width: 60px;
  color: #666;
}
</style>
