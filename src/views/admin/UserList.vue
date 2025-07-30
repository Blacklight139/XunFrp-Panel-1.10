<template>
  <div class="admin-user-list">
    <div class="container">
      <div class="page-header">
        <h1>用户管理</h1>
        <p>管理所有用户账户</p>
      </div>

    <!-- 用户组限制说明 -->
    <n-card title="用户组限制说明" class="limits-info" style="margin-bottom: 1rem;">
      <n-table :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th>用户组</th>
            <th>带宽限制</th>
            <th>隧道数量</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><n-tag type="default">未实名认证</n-tag></td>
            <td>8 Mbps</td>
            <td>3 条</td>
            <td>默认注册用户</td>
          </tr>
          <tr>
            <td><n-tag type="success">正式用户</n-tag></td>
            <td>24 Mbps</td>
            <td>10 条</td>
            <td>完成实名认证</td>
          </tr>
          <tr>
            <td><n-tag type="warning">赞助者</n-tag></td>
            <td>128 Mbps</td>
            <td>25 条</td>
            <td>赞助用户</td>
          </tr>
          <tr>
            <td><n-tag type="error">管理员</n-tag></td>
            <td>无限制</td>
            <td>无限制</td>
            <td>系统管理员</td>
          </tr>
        </tbody>
      </n-table>
    </n-card>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="users"
          :loading="loading"
          :pagination="pagination"
          remote
          @update:page="handlePageChange"
        />
      </n-card>
    </div>

    <!-- 编辑用户模态框 -->
    <n-modal v-model:show="editModalVisible" preset="card" title="编辑用户" style="width: 600px">
      <n-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="editForm.username" disabled />
        </n-form-item>

        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="editForm.email" disabled />
        </n-form-item>

        <n-form-item label="用户组" path="user_group">
          <n-select
            v-model:value="editForm.user_group"
            :options="userGroupOptions"
            placeholder="请选择用户组"
          />
        </n-form-item>

        <n-form-item label="积分" path="points">
          <n-input-number
            v-model:value="editForm.points"
            :min="0"
            placeholder="用户积分"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="入站带宽 (Mbps)" path="inbound_bandwidth">
          <n-input-number
            v-model:value="editForm.inbound_bandwidth"
            :min="0"
            placeholder="入站带宽限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="出站带宽 (Mbps)" path="outbound_bandwidth">
          <n-input-number
            v-model:value="editForm.outbound_bandwidth"
            :min="0"
            placeholder="出站带宽限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="流量限制 (GB)" path="traffic_limit">
          <n-input-number
            v-model:value="editForm.traffic_limit"
            :min="0"
            :max="999999"
            placeholder="0表示无限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="隧道数量限制" path="tunnel_limit">
          <n-input-number
            v-model:value="editForm.tunnel_limit"
            :min="0"
            :max="999"
            placeholder="0表示无限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="入站带宽 (KB/s)" path="inbound_bandwidth">
          <n-input-number
            v-model:value="editForm.inbound_bandwidth"
            :min="0"
            :max="999999"
            placeholder="0表示无限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="出站带宽 (KB/s)" path="outbound_bandwidth">
          <n-input-number
            v-model:value="editForm.outbound_bandwidth"
            :min="0"
            :max="999999"
            placeholder="0表示无限制"
            style="width: 100%"
          />
        </n-form-item>

        <n-form-item label="账户状态">
          <n-space>
            <n-checkbox v-model:checked="editForm.is_active">
              账户激活
            </n-checkbox>
            <n-checkbox v-model:checked="editForm.is_banned">
              账户封禁
            </n-checkbox>
            <n-checkbox v-model:checked="editForm.is_verified">
              实名认证
            </n-checkbox>
          </n-space>
        </n-form-item>

        <!-- 封号理由输入框 -->
        <n-form-item v-if="editForm.is_banned" label="封号理由" path="ban_reason">
          <n-input
            v-model:value="editForm.ban_reason"
            type="textarea"
            :rows="3"
            :maxlength="100"
            show-count
            placeholder="请输入封号理由（最多100字）"
          />
        </n-form-item>

        <!-- 调试信息 -->
        <n-form-item v-if="false" label="调试信息">
          <div style="font-size: 12px; color: #666;">
            is_banned: {{ editForm.is_banned }}<br>
            ban_reason: {{ editForm.ban_reason }}
          </div>
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="modal-actions">
          <n-button @click="editModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSaveUser">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 封禁用户模态框 -->
    <n-modal v-model:show="banModalVisible" preset="card" title="封禁用户" style="width: 500px">
      <div v-if="selectedUser">
        <n-alert type="warning" style="margin-bottom: 16px">
          确定要封禁用户 <strong>{{ selectedUser.username }}</strong> 吗？
        </n-alert>
        <n-form
          ref="banFormRef"
          :model="banForm"
          :rules="banRules"
          label-placement="top"
        >
          <n-form-item label="封禁理由" path="reason">
            <n-input
              v-model:value="banForm.reason"
              type="textarea"
              placeholder="请输入封禁理由..."
              :rows="4"
            />
          </n-form-item>
        </n-form>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="banModalVisible = false">取消</n-button>
          <n-button type="error" @click="handleBanUser" :loading="banning">
            确认封禁
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 升级用户组模态框 -->
    <n-modal v-model:show="upgradeModalVisible" preset="dialog" title="升级用户组">
      <p>当前用户：<strong>{{ selectedUser?.username }}</strong></p>
      <p>当前用户组：<strong>{{ getUserGroupName(selectedUser?.user_group || '') }}</strong></p>

      <n-form ref="upgradeFormRef" :model="upgradeForm" :rules="upgradeRules" label-placement="left" label-width="100px">
        <n-form-item label="新用户组" path="user_group">
          <n-select
            v-model:value="upgradeForm.user_group"
            :options="userGroupOptions"
            placeholder="请选择用户组"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-button @click="upgradeModalVisible = false">取消</n-button>
        <n-button type="primary" :loading="upgrading" @click="handleUpgradeUser">确认升级</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, reactive } from 'vue'
import { useMessage, NButton, NTag, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatDateTime, getUserGroupName } from '@/utils'
import type { User } from '@/types'

const message = useMessage()

const loading = ref(false)
const saving = ref(false)
const editModalVisible = ref(false)
const editFormRef = ref<FormInst | null>(null)

// 封禁相关
const banModalVisible = ref(false)
const banFormRef = ref<FormInst | null>(null)
const banning = ref(false)

const users = ref<User[]>([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
})

// 编辑表单数据
const editForm = reactive({
  id: 0,
  username: '',
  email: '',
  user_group: '',
  traffic_limit: 0,
  tunnel_limit: 0,
  inbound_bandwidth: 0,
  outbound_bandwidth: 0,
  points: 0,
  is_active: true,
  is_banned: false,
  is_verified: false,
  ban_reason: '',
})

// 封禁表单数据
const banForm = reactive({
  reason: ''
})

// 封禁表单验证规则
const banRules: FormRules = {
  reason: [
    { required: true, message: '请输入封禁理由', trigger: 'blur' },
    { min: 5, message: '封禁理由至少5个字符', trigger: 'blur' }
  ]
}

// 用户组选项
const userGroupOptions = [
  { label: '未认证用户', value: 'unverified' },
  { label: '已认证用户', value: 'verified' },
  { label: '赞助用户', value: 'sponsor' },
  { label: '管理员', value: 'admin' },
]

// 升级用户组相关
const upgradeModalVisible = ref(false)
const upgrading = ref(false)
const upgradeFormRef = ref<FormInst | null>(null)
const selectedUser = ref<User | null>(null)

const upgradeForm = reactive({
  user_group: ''
})

const upgradeRules: FormRules = {
  user_group: [
    { required: true, message: '请选择用户组', trigger: 'change' }
  ]
}

// 编辑表单验证规则
const editRules: FormRules = {
  user_group: [
    { required: true, message: '请选择用户组', trigger: 'change' }
  ],
  traffic_limit: [
    { type: 'number', min: 0, message: '流量限制不能小于0', trigger: 'blur' }
  ],
  tunnel_limit: [
    { type: 'number', min: 0, message: '隧道数量限制不能小于0', trigger: 'blur' }
  ],
  inbound_bandwidth: [
    { type: 'number', min: 0, message: '入站带宽不能小于0', trigger: 'blur' }
  ],
  outbound_bandwidth: [
    { type: 'number', min: 0, message: '出站带宽不能小于0', trigger: 'blur' }
  ],
}

const columns: DataTableColumns<User> = [
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
    title: '邮箱',
    key: 'email',
    width: 200,
  },
  {
    title: '用户组',
    key: 'user_group',
    width: 100,
    render: (row) => {
      const type = row.user_group === 'admin' ? 'error' : 
                   row.user_group === 'sponsor' ? 'success' :
                   row.user_group === 'verified' ? 'info' : 'warning'
      return h(NTag, { type, size: 'small' }, { default: () => getUserGroupName(row.user_group) })
    }
  },
  {
    title: '实名认证',
    key: 'is_verified',
    width: 100,
    render: (row) => {
      return h(NTag, { 
        type: row.is_verified ? 'success' : 'warning',
        size: 'small' 
      }, { 
        default: () => row.is_verified ? '已认证' : '未认证' 
      })
    }
  },
  {
    title: '隧道数',
    key: 'tunnel_count',
    width: 80,
  },
  {
    title: '注册时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatDateTime(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return [
        h(NButton, {
          size: 'small',
          type: row.is_banned ? 'success' : 'error',
          onClick: () => row.is_banned ? unbanUser(row) : showBanModal(row)
        }, { default: () => row.is_banned ? '解封' : '封禁' }),
        h(NButton, {
          size: 'small',
          type: 'info',
          style: { marginLeft: '8px' },
          onClick: () => showUpgradeModal(row)
        }, { default: () => '升级' }),
        h(NButton, {
          size: 'small',
          style: { marginLeft: '8px' },
          onClick: () => editUser(row)
        }, { default: () => '编辑' })
      ]
    }
  }
]

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/admin/users', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.pageSize,
      }
    })
    users.value = response.users || []
    pagination.value.itemCount = response.total || 0
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchUsers()
}

// 显示封禁模态框
const showBanModal = (user: User) => {
  selectedUser.value = user
  banForm.reason = ''
  banModalVisible.value = true
}

// 封禁用户
const handleBanUser = async () => {
  if (!banFormRef.value || !selectedUser.value) return

  try {
    await banFormRef.value.validate()
    banning.value = true

    await ApiClient.put(`/admin/users/${selectedUser.value.id}`, {
      is_banned: true,
      ban_reason: banForm.reason
    })

    message.success('用户封禁成功')
    banModalVisible.value = false
    await fetchUsers()
  } catch (error: any) {
    console.error('封禁用户失败:', error)
    message.error(error.message || '封禁失败')
  } finally {
    banning.value = false
  }
}

// 解封用户
const unbanUser = async (user: User) => {
  try {
    await ApiClient.put(`/admin/users/${user.id}`, {
      is_banned: false,
      ban_reason: ''
    })
    message.success('用户解封成功')
    await fetchUsers()
  } catch (error: any) {
    console.error('解封用户失败:', error)
    message.error('解封失败')
  }
}

const toggleUserBan = async (user: User) => {
  try {
    await ApiClient.post(`/admin/users/${user.id}/toggle-ban`)
    message.success(`用户${user.is_banned ? '解封' : '封禁'}成功`)
    await fetchUsers()
  } catch (error: any) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

const editUser = (user: User) => {
  // 填充编辑表单
  editForm.id = user.id
  editForm.username = user.username
  editForm.email = user.email
  editForm.user_group = user.user_group
  editForm.traffic_limit = user.traffic_limit || 0
  editForm.tunnel_limit = user.tunnel_limit || 0
  editForm.inbound_bandwidth = user.inbound_bandwidth || 0
  editForm.outbound_bandwidth = user.outbound_bandwidth || 0
  editForm.points = user.points || 0
  editForm.is_active = user.is_active
  editForm.is_banned = user.is_banned
  editForm.is_verified = user.is_verified
  editForm.ban_reason = user.ban_reason || ''

  editModalVisible.value = true
}

// 保存用户编辑
const handleSaveUser = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saving.value = true

    const updateData = {
      user_group: editForm.user_group,
      traffic_limit: editForm.traffic_limit,
      tunnel_limit: editForm.tunnel_limit,
      inbound_bandwidth: editForm.inbound_bandwidth,
      outbound_bandwidth: editForm.outbound_bandwidth,
      points: editForm.points,
      is_active: editForm.is_active,
      is_banned: editForm.is_banned,
      is_verified: editForm.is_verified,
      ban_reason: editForm.ban_reason,
    }

    await ApiClient.put(`/admin/users/${editForm.id}`, updateData)

    message.success('用户信息更新成功')
    editModalVisible.value = false
    await fetchUsers()
  } catch (error: any) {
    console.error('更新用户失败:', error)
    message.error(error.message || '更新失败')
  } finally {
    saving.value = false
  }
}

// 显示升级用户组模态框
const showUpgradeModal = (user: User) => {
  selectedUser.value = user
  upgradeForm.user_group = user.user_group
  upgradeModalVisible.value = true
}

// 处理用户组升级
const handleUpgradeUser = async () => {
  if (!upgradeFormRef.value || !selectedUser.value) return

  try {
    await upgradeFormRef.value.validate()
    upgrading.value = true

    await ApiClient.post(`/admin/users/${selectedUser.value.id}/upgrade-group`, {
      user_group: upgradeForm.user_group
    })

    message.success('用户组升级成功')
    upgradeModalVisible.value = false
    await fetchUsers()
  } catch (error: any) {
    console.error('升级用户组失败:', error)
    message.error(error.message || '升级失败')
  } finally {
    upgrading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-user-list {
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
</style>
