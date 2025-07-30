<template>
  <div class="admin-operation-logs">
    <div class="container">
      <div class="page-header">
        <h1>操作日志</h1>
        <p>查看系统操作记录和用户行为日志</p>
      </div>

      <n-tabs type="line" animated>
        <!-- 管理员操作日志 -->
        <n-tab-pane name="admin" tab="管理员日志">
          <n-card>
            <!-- 统计信息 -->
            <div class="stats-section">
              <n-space>
                <n-statistic label="今日操作" :value="adminStats.today" />
                <n-statistic label="本周操作" :value="adminStats.week" />
                <n-statistic label="总操作数" :value="adminStats.total" />
              </n-space>
            </div>

            <!-- 搜索过滤 -->
            <div class="filter-section">
              <n-space>
                <n-input
                  v-model:value="adminFilters.search"
                  placeholder="搜索操作内容、管理员或IP地址"
                  clearable
                  style="width: 300px"
                  @keyup.enter="loadAdminLogs"
                >
                  <template #prefix>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                </n-input>
                <n-select
                  v-model:value="adminFilters.action_type"
                  placeholder="操作类型"
                  clearable
                  style="width: 150px"
                  :options="adminActionOptions"
                  @update:value="loadAdminLogs"
                />
                <n-date-picker
                  v-model:value="adminFilters.date_range"
                  type="daterange"
                  clearable
                  placeholder="选择日期范围"
                  @update:value="loadAdminLogs"
                />
                <n-button type="primary" @click="loadAdminLogs">
                  <template #icon>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                  搜索
                </n-button>
                <n-button @click="resetAdminFilters">
                  重置
                </n-button>
              </n-space>
            </div>

            <n-data-table
              :columns="adminColumns"
              :data="adminLogs"
              :loading="adminLoading"
              :pagination="adminPagination"
              remote
              @update:page="handleAdminPageChange"
            />
          </n-card>
        </n-tab-pane>

        <!-- 用户操作日志 -->
        <n-tab-pane name="user" tab="用户日志">
          <n-card>
            <!-- 统计信息 -->
            <div class="stats-section">
              <n-space>
                <n-statistic label="今日活跃用户" :value="userStats.today_active" />
                <n-statistic label="今日操作" :value="userStats.today" />
                <n-statistic label="总操作数" :value="userStats.total" />
              </n-space>
            </div>

            <!-- 搜索过滤 -->
            <div class="filter-section">
              <n-space>
                <n-input
                  v-model:value="userFilters.search"
                  placeholder="搜索用户名、操作内容或IP地址"
                  clearable
                  style="width: 300px"
                  @keyup.enter="loadUserLogs"
                >
                  <template #prefix>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                </n-input>
                <n-select
                  v-model:value="userFilters.action_type"
                  placeholder="操作类型"
                  clearable
                  style="width: 150px"
                  :options="userActionOptions"
                  @update:value="loadUserLogs"
                />
                <n-date-picker
                  v-model:value="userFilters.date_range"
                  type="daterange"
                  clearable
                  placeholder="选择日期范围"
                  @update:value="loadUserLogs"
                />
                <n-button type="primary" @click="loadUserLogs">
                  <template #icon>
                    <n-icon><SearchOutline /></n-icon>
                  </template>
                  搜索
                </n-button>
                <n-button @click="resetUserFilters">
                  重置
                </n-button>
              </n-space>
            </div>

            <n-data-table
              :columns="userColumns"
              :data="userLogs"
              :loading="userLoading"
              :pagination="userPagination"
              remote
              @update:page="handleUserPageChange"
            />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, NTag, type DataTableColumns } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { formatDateTime } from '@/utils'

const message = useMessage()

// 加载状态
const adminLoading = ref(false)
const userLoading = ref(false)

// 日志数据
const adminLogs = ref<any[]>([])
const userLogs = ref<any[]>([])

// 统计数据
const adminStats = reactive({
  today: 0,
  week: 0,
  total: 0
})

const userStats = reactive({
  today_active: 0,
  today: 0,
  total: 0
})

// 分页配置
const adminPagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
})

const userPagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
})

// 过滤条件
const adminFilters = reactive({
  search: '',
  action_type: null,
  date_range: null,
})

const userFilters = reactive({
  search: '',
  action_type: null,
  date_range: null,
})

// 操作类型选项
const adminActionOptions = [
  { label: '用户管理', value: 'user_management' },
  { label: '隧道管理', value: 'tunnel_management' },
  { label: '节点管理', value: 'node_management' },
  { label: '公告管理', value: 'announcement_management' },
  { label: '系统设置', value: 'system_settings' },
  { label: '登录登出', value: 'auth' },
]

const userActionOptions = [
  { label: '登录登出', value: 'auth' },
  { label: '隧道操作', value: 'tunnel' },
  { label: '个人资料', value: 'profile' },
  { label: '签到', value: 'signin' },
  { label: '实名认证', value: 'verification' },
]

// 管理员日志表格列
const adminColumns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '管理员',
    key: 'admin_username',
    width: 120,
  },
  {
    title: '操作类型',
    key: 'action_type',
    width: 120,
    render: (row) => {
      const typeMap: Record<string, { label: string; type: any }> = {
        user_management: { label: '用户管理', type: 'info' },
        tunnel_management: { label: '隧道管理', type: 'warning' },
        node_management: { label: '节点管理', type: 'success' },
        announcement_management: { label: '公告管理', type: 'default' },
        system_settings: { label: '系统设置', type: 'error' },
        auth: { label: '登录登出', type: 'default' },
      }
      const config = typeMap[row.action_type] || { label: row.action_type, type: 'default' }
      return h(NTag, { type: config.type, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '操作内容',
    key: 'action_content',
    width: 300,
  },
  {
    title: 'IP地址',
    key: 'ip_address',
    width: 120,
  },
  {
    title: 'User-Agent',
    key: 'user_agent',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatDateTime(row.created_at),
  },
]

// 用户日志表格列
const userColumns: DataTableColumns<any> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '操作类型',
    key: 'action_type',
    width: 120,
    render: (row) => {
      const typeMap: Record<string, { label: string; type: any }> = {
        auth: { label: '登录登出', type: 'default' },
        tunnel: { label: '隧道操作', type: 'info' },
        profile: { label: '个人资料', type: 'success' },
        signin: { label: '签到', type: 'warning' },
        verification: { label: '实名认证', type: 'error' },
      }
      const config = typeMap[row.action_type] || { label: row.action_type, type: 'default' }
      return h(NTag, { type: config.type, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '操作内容',
    key: 'action_content',
    width: 300,
  },
  {
    title: 'IP地址',
    key: 'ip_address',
    width: 120,
  },
  {
    title: 'User-Agent',
    key: 'user_agent',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatDateTime(row.created_at),
  },
]

// 加载管理员日志
const loadAdminLogs = async () => {
  try {
    adminLoading.value = true
    const params: any = {
      page: adminPagination.value.page,
      limit: adminPagination.value.pageSize,
    }
    
    if (adminFilters.search) {
      params.search = adminFilters.search
    }
    if (adminFilters.action_type) {
      params.action_type = adminFilters.action_type
    }
    if (adminFilters.date_range && adminFilters.date_range.length === 2) {
      params.start_date = new Date(adminFilters.date_range[0]).toISOString().split('T')[0]
      params.end_date = new Date(adminFilters.date_range[1]).toISOString().split('T')[0]
    }
    
    const response = await ApiClient.get('/admin/logs/admin', { params })
    adminLogs.value = response.logs || []
    adminPagination.value.itemCount = response.total || 0
  } catch (error: any) {
    console.error('加载管理员日志失败:', error)
    message.error('加载管理员日志失败')
  } finally {
    adminLoading.value = false
  }
}

// 加载用户日志
const loadUserLogs = async () => {
  try {
    userLoading.value = true
    const params: any = {
      page: userPagination.value.page,
      limit: userPagination.value.pageSize,
    }
    
    if (userFilters.search) {
      params.search = userFilters.search
    }
    if (userFilters.action_type) {
      params.action_type = userFilters.action_type
    }
    if (userFilters.date_range && userFilters.date_range.length === 2) {
      params.start_date = new Date(userFilters.date_range[0]).toISOString().split('T')[0]
      params.end_date = new Date(userFilters.date_range[1]).toISOString().split('T')[0]
    }
    
    const response = await ApiClient.get('/admin/logs/user', { params })
    userLogs.value = response.logs || []
    userPagination.value.itemCount = response.total || 0
  } catch (error: any) {
    console.error('加载用户日志失败:', error)
    message.error('加载用户日志失败')
  } finally {
    userLoading.value = false
  }
}

// 分页处理
const handleAdminPageChange = (page: number) => {
  adminPagination.value.page = page
  loadAdminLogs()
}

const handleUserPageChange = (page: number) => {
  userPagination.value.page = page
  loadUserLogs()
}

// 重置过滤器
const resetAdminFilters = () => {
  adminFilters.search = ''
  adminFilters.action_type = null
  adminFilters.date_range = null
  adminPagination.value.page = 1
  loadAdminLogs()
}

const resetUserFilters = () => {
  userFilters.search = ''
  userFilters.action_type = null
  userFilters.date_range = null
  userPagination.value.page = 1
  loadUserLogs()
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await ApiClient.get('/admin/logs/statistics')
    if (response.admin_stats) {
      Object.assign(adminStats, response.admin_stats)
    }
    if (response.user_stats) {
      Object.assign(userStats, response.user_stats)
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadAdminLogs()
  loadUserLogs()
  loadStats()
})
</script>

<style scoped>
.admin-operation-logs {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.stats-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.stats-section :deep(.n-statistic-label) {
  color: rgba(255, 255, 255, 0.8);
}

.stats-section :deep(.n-statistic-value) {
  color: white;
  font-weight: 600;
}

.filter-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}
</style>
