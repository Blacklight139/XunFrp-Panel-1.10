<template>
  <div class="redis-management">
    <n-card title="Redis 管理" class="mb-4">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
            刷新
          </n-button>
          <n-button type="error" @click="showFlushModal = true">
            <template #icon>
              <n-icon><DeleteIcon /></n-icon>
            </template>
            清空数据库
          </n-button>
        </n-space>
      </template>

      <!-- Redis 状态信息 -->
      <n-grid :cols="4" :x-gap="16" :y-gap="16" class="mb-6">
        <n-grid-item>
          <n-statistic label="连接状态" :value="redisInfo.ping || 'PONG'" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="数据库大小" :value="redisInfo.db_size || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="在线用户" :value="redisStats.online_users || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="在线隧道" :value="redisStats.online_tunnels || 0" />
        </n-grid-item>
      </n-grid>

      <!-- 标签页 -->
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="keys" tab="缓存键管理">
          <div class="keys-management">
            <n-space class="mb-4">
              <n-input
                v-model:value="keyPattern"
                placeholder="搜索键模式 (支持通配符 *)"
                style="width: 300px"
                @keyup.enter="searchKeys"
              />
              <n-button @click="searchKeys" :loading="keysLoading">搜索</n-button>
              <n-button @click="keyPattern = '*'; searchKeys()">显示所有</n-button>
            </n-space>

            <n-data-table
              :columns="keyColumns"
              :data="keys"
              :loading="keysLoading"
              :pagination="keysPagination"
              :row-key="(row) => row.key"
            />
          </div>
        </n-tab-pane>

        <n-tab-pane name="online-users" tab="在线用户">
          <n-data-table
            :columns="userColumns"
            :data="onlineUsers"
            :loading="usersLoading"
            :pagination="false"
          />
        </n-tab-pane>

        <n-tab-pane name="online-tunnels" tab="在线隧道">
          <n-data-table
            :columns="tunnelColumns"
            :data="onlineTunnels"
            :loading="tunnelsLoading"
            :pagination="false"
          />
        </n-tab-pane>

        <n-tab-pane name="info" tab="Redis 信息">
          <n-code
            :code="redisInfoText"
            language="ini"
            show-line-numbers
            style="max-height: 500px; overflow-y: auto"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 清空数据库确认对话框 -->
    <n-modal v-model:show="showFlushModal">
      <n-card
        style="width: 400px"
        title="确认清空数据库"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showFlushModal = false">
            <template #icon>
              <n-icon><CloseIcon /></n-icon>
            </template>
          </n-button>
        </template>
        
        <p>此操作将清空 Redis 数据库中的所有数据，包括：</p>
        <ul>
          <li>用户会话信息</li>
          <li>缓存数据</li>
          <li>在线用户统计</li>
          <li>限流记录</li>
        </ul>
        <p><strong>此操作不可恢复，请谨慎操作！</strong></p>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showFlushModal = false">取消</n-button>
            <n-button type="error" @click="flushDatabase" :loading="flushLoading">
              确认清空
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, useMessage } from 'naive-ui'
import { Refresh as RefreshIcon, Trash as DeleteIcon, Close as CloseIcon } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const message = useMessage()

// 响应式数据
const loading = ref(false)
const activeTab = ref('keys')
const showFlushModal = ref(false)
const flushLoading = ref(false)

// Redis 信息
const redisInfo = ref<any>({})
const redisStats = ref<any>({})
const redisInfoText = ref('')

// 缓存键管理
const keyPattern = ref('*')
const keys = ref<any[]>([])
const keysLoading = ref(false)
const keysPagination = ref({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// 在线用户
const onlineUsers = ref<any[]>([])
const usersLoading = ref(false)

// 在线隧道
const onlineTunnels = ref<any[]>([])
const tunnelsLoading = ref(false)

// 表格列定义
const keyColumns = [
  {
    title: '键名',
    key: 'key',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row: any) => {
      return h(
        NButton,
        {
          size: 'small',
          type: 'error',
          onClick: () => deleteKey(row.key)
        },
        { default: () => '删除' }
      )
    }
  }
]

const userColumns = [
  {
    title: '用户ID',
    key: 'user_id'
  }
]

const tunnelColumns = [
  {
    title: '隧道ID',
    key: 'tunnel_id'
  }
]

// 方法
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      getRedisInfo(),
      getRedisStats(),
      searchKeys(),
      getOnlineUsers(),
      getOnlineTunnels()
    ])
  } finally {
    loading.value = false
  }
}

const getRedisInfo = async () => {
  try {
    const response = await ApiClient.get('/admin/redis/info')
    redisInfo.value = response.data
    redisInfoText.value = response.data.info || ''
  } catch (error) {
    console.error('获取Redis信息失败:', error)
  }
}

const getRedisStats = async () => {
  try {
    const response = await ApiClient.get('/admin/redis/stats')
    redisStats.value = response.data
  } catch (error) {
    console.error('获取Redis统计失败:', error)
  }
}

const searchKeys = async () => {
  keysLoading.value = true
  try {
    const response = await ApiClient.get('/admin/redis/keys', {
      params: {
        pattern: keyPattern.value,
        limit: 100
      }
    })
    keys.value = response.data.keys.map((key: string) => ({ key }))
  } catch (error) {
    console.error('搜索缓存键失败:', error)
    message.error('搜索缓存键失败')
  } finally {
    keysLoading.value = false
  }
}

const deleteKey = async (key: string) => {
  try {
    await ApiClient.delete(`/admin/redis/keys/${encodeURIComponent(key)}`)
    message.success('缓存键已删除')
    await searchKeys()
  } catch (error) {
    console.error('删除缓存键失败:', error)
    message.error('删除缓存键失败')
  }
}

const getOnlineUsers = async () => {
  usersLoading.value = true
  try {
    const response = await ApiClient.get('/admin/redis/online-users')
    onlineUsers.value = response.data.users.map((userId: string) => ({ user_id: userId }))
  } catch (error) {
    console.error('获取在线用户失败:', error)
  } finally {
    usersLoading.value = false
  }
}

const getOnlineTunnels = async () => {
  tunnelsLoading.value = true
  try {
    const response = await ApiClient.get('/admin/redis/online-tunnels')
    onlineTunnels.value = response.data.tunnels.map((tunnelId: string) => ({ tunnel_id: tunnelId }))
  } catch (error) {
    console.error('获取在线隧道失败:', error)
  } finally {
    tunnelsLoading.value = false
  }
}

const flushDatabase = async () => {
  flushLoading.value = true
  try {
    await ApiClient.post('/admin/redis/flush')
    message.success('Redis数据库已清空')
    showFlushModal.value = false
    await refreshData()
  } catch (error) {
    console.error('清空数据库失败:', error)
    message.error('清空数据库失败')
  } finally {
    flushLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.redis-management {
  padding: 20px;
}

.keys-management {
  margin-top: 16px;
}
</style>
