<template>
  <div class="admin-node-list">
    <div class="container">
      <div class="page-header">
        <h1>节点管理</h1>
        <div class="header-actions">
          <n-button type="primary" @click="showAddModal = true">
            添加节点
          </n-button>
        </div>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="nodes"
          :loading="loading"
        />
      </n-card>
    </div>

    <!-- 添加节点模态框 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加节点" style="width: 600px">
      <n-form ref="formRef" :model="nodeForm" :rules="nodeRules">
        <n-form-item label="节点名称" path="name">
          <n-input v-model:value="nodeForm.name" placeholder="请输入节点名称" />
        </n-form-item>
        <n-form-item label="服务器地址" path="server_addr">
          <n-input v-model:value="nodeForm.server_addr" placeholder="请输入服务器IP或域名" />
        </n-form-item>
        <n-form-item label="服务器端口" path="server_port">
          <n-input-number v-model:value="nodeForm.server_port" :min="1" :max="65535" placeholder="7000" />
        </n-form-item>
        <n-form-item label="Dashboard端口" path="dashboard_port">
          <n-input-number v-model:value="nodeForm.dashboard_port" :min="1" :max="65535" placeholder="7500" />
        </n-form-item>
        <n-form-item label="Dashboard用户名" path="dashboard_user">
          <n-input v-model:value="nodeForm.dashboard_user" placeholder="admin" />
        </n-form-item>
        <n-form-item label="Dashboard密码" path="dashboard_password">
          <n-input v-model:value="nodeForm.dashboard_password" type="password" show-password-on="click" placeholder="请输入Dashboard密码" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="nodeForm.description" type="textarea" placeholder="节点描述" />
        </n-form-item>
        <n-form-item label="国家" path="country">
          <n-input v-model:value="nodeForm.country" placeholder="中国" />
        </n-form-item>
        <n-form-item label="地区" path="region">
          <n-input v-model:value="nodeForm.region" placeholder="广东" />
        </n-form-item>
        <n-form-item label="城市" path="city">
          <n-input v-model:value="nodeForm.city" placeholder="深圳" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="addNode" :loading="adding">添加</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 编辑节点模态框 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑节点" style="width: 600px">
      <n-form ref="editFormRef" :model="editForm" :rules="nodeRules">
        <n-form-item label="节点名称" path="name">
          <n-input v-model:value="editForm.name" placeholder="请输入节点名称" />
        </n-form-item>
        <n-form-item label="服务器地址" path="server_addr">
          <n-input v-model:value="editForm.server_addr" placeholder="请输入服务器IP或域名" />
        </n-form-item>
        <n-form-item label="服务器端口" path="server_port">
          <n-input-number v-model:value="editForm.server_port" :min="1" :max="65535" placeholder="7000" />
        </n-form-item>
        <n-form-item label="Dashboard端口" path="dashboard_port">
          <n-input-number v-model:value="editForm.dashboard_port" :min="1" :max="65535" placeholder="7500" />
        </n-form-item>
        <n-form-item label="Dashboard用户名" path="dashboard_user">
          <n-input v-model:value="editForm.dashboard_user" placeholder="admin" />
        </n-form-item>
        <n-form-item label="Dashboard密码" path="dashboard_password">
          <n-input v-model:value="editForm.dashboard_password" type="password" show-password-on="click" placeholder="请输入Dashboard密码" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="editForm.description" type="textarea" placeholder="节点描述" />
        </n-form-item>
        <n-form-item label="国家" path="country">
          <n-input v-model:value="editForm.country" placeholder="中国" />
        </n-form-item>
        <n-form-item label="地区" path="region">
          <n-input v-model:value="editForm.region" placeholder="广东" />
        </n-form-item>
        <n-form-item label="城市" path="city">
          <n-input v-model:value="editForm.city" placeholder="深圳" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="updateNode" :loading="editing">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 权限管理模态框 -->
    <n-modal v-model:show="showPermissionModal" preset="card" title="节点权限管理" style="width: 500px">
      <div class="permission-content">
        <h3>{{ currentNode?.name }} - 用户组权限</h3>
        <p class="permission-desc">选择允许使用此节点的用户组：</p>

        <n-checkbox-group v-model:value="selectedUserGroups">
          <n-space vertical>
            <n-checkbox value="unverified" label="未实名认证用户">
              <template #default>
                <div class="user-group-item">
                  <n-tag type="default" size="small">未实名认证</n-tag>
                  <span class="group-desc">新注册用户，未完成实名认证</span>
                </div>
              </template>
            </n-checkbox>
            <n-checkbox value="verified" label="正式用户">
              <template #default>
                <div class="user-group-item">
                  <n-tag type="success" size="small">正式用户</n-tag>
                  <span class="group-desc">已完成实名认证的用户</span>
                </div>
              </template>
            </n-checkbox>
            <n-checkbox value="sponsor" label="赞助者">
              <template #default>
                <div class="user-group-item">
                  <n-tag type="warning" size="small">赞助者</n-tag>
                  <span class="group-desc">支持项目发展的赞助用户</span>
                </div>
              </template>
            </n-checkbox>
            <n-checkbox value="admin" label="管理员">
              <template #default>
                <div class="user-group-item">
                  <n-tag type="error" size="small">管理员</n-tag>
                  <span class="group-desc">系统管理员，拥有所有权限</span>
                </div>
              </template>
            </n-checkbox>
          </n-space>
        </n-checkbox-group>
      </div>

      <template #footer>
        <div class="modal-actions">
          <n-button @click="showPermissionModal = false">取消</n-button>
          <n-button type="primary" @click="updateNodePermissions" :loading="updatingPermissions">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 删除节点确认模态框 -->
    <n-modal v-model:show="showDeleteModal" preset="card" title="确认删除节点" style="width: 500px">
      <div v-if="deletingNode">
        <n-alert type="error" style="margin-bottom: 16px">
          <strong>警告：此操作不可撤销！</strong>
        </n-alert>
        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="节点名称">{{ deletingNode.name }}</n-descriptions-item>
          <n-descriptions-item label="服务器地址">{{ deletingNode.server_addr }}:{{ deletingNode.server_port }}</n-descriptions-item>
          <n-descriptions-item label="地理位置">{{ deletingNode.country }} {{ deletingNode.region }} {{ deletingNode.city }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :type="deletingNode.status === 'online' ? 'success' : 'default'" size="small">
              {{ getNodeStatusName(deletingNode.status) }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
        <p style="margin-top: 16px; color: #666;">
          删除后，所有使用此节点的隧道将无法正常工作，请确保已通知相关用户。
        </p>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="error" @click="confirmDeleteNode" :loading="deleting">
            确认删除
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h } from 'vue'
import { useMessage, NButton, NTag, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatDateTime, getNodeStatusName } from '@/utils'
import type { Node } from '@/types'

const message = useMessage()

const loading = ref(false)
const adding = ref(false)
const editing = ref(false)
const updatingPermissions = ref(false)
const deleting = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showPermissionModal = ref(false)
const showDeleteModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)
const nodes = ref<Node[]>([])
const editingNode = ref<Node | null>(null)
const currentNode = ref<Node | null>(null)
const deletingNode = ref<Node | null>(null)
const selectedUserGroups = ref<string[]>([])

const nodeForm = reactive({
  name: '',
  server_addr: '',
  server_port: 7000,
  dashboard_port: 7500,
  dashboard_user: 'admin',
  dashboard_password: '',
  description: '',
  country: '',
  region: '',
  city: '',
})

const editForm = reactive({
  name: '',
  server_addr: '',
  server_port: 7000,
  dashboard_port: 7500,
  dashboard_user: 'admin',
  dashboard_password: '',
  description: '',
  country: '',
  region: '',
  city: '',
})

const nodeRules: FormRules = {
  name: [
    { required: true, message: '请输入节点名称', trigger: ['input', 'blur'] },
  ],
  server_addr: [
    { required: true, message: '请输入服务器地址', trigger: ['input', 'blur'] },
  ],
  server_port: [
    {
      required: true,
      type: 'number',
      message: '请输入服务器端口',
      trigger: ['input', 'blur', 'change']
    },
    {
      type: 'number',
      min: 1,
      max: 65535,
      message: '端口范围应在1-65535之间',
      trigger: ['input', 'blur', 'change']
    },
  ],
  dashboard_port: [
    {
      required: true,
      type: 'number',
      message: '请输入Dashboard端口',
      trigger: ['input', 'blur', 'change']
    },
    {
      type: 'number',
      min: 1,
      max: 65535,
      message: '端口范围应在1-65535之间',
      trigger: ['input', 'blur', 'change']
    },
  ],
  dashboard_user: [
    { required: true, message: '请输入Dashboard用户名', trigger: ['input', 'blur'] },
  ],
  dashboard_password: [
    { required: true, message: '请输入Dashboard密码', trigger: ['input', 'blur'] },
  ],
}

const columns: DataTableColumns<Node> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '节点名称',
    key: 'name',
    width: 150,
  },
  {
    title: '服务器地址',
    key: 'server_addr',
    width: 200,
    render: (row) => `${row.server_addr}:${row.server_port}`
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      const type = row.status === 'online' ? 'success' : 'default'
      return h(NTag, { type, size: 'small' }, { default: () => getNodeStatusName(row.status) })
    }
  },
  {
    title: '位置',
    key: 'location',
    width: 150,
    render: (row) => `${row.country} ${row.region} ${row.city}`
  },
  {
    title: '在线隧道',
    key: 'online_tunnels',
    width: 100,
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatDateTime(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row) => {
      return [
        h(NButton, {
          size: 'small',
          type: 'primary',
          onClick: () => editNode(row)
        }, { default: () => '编辑' }),
        h(NButton, {
          size: 'small',
          type: 'info',
          style: { marginLeft: '8px' },
          onClick: () => editNodePermissions(row)
        }, { default: () => '权限' }),
        h(NButton, {
          size: 'small',
          type: row.is_active ? 'warning' : 'success',
          style: { marginLeft: '8px' },
          onClick: () => toggleNodeActive(row)
        }, { default: () => row.is_active ? '停用' : '启用' }),
        h(NButton, {
          size: 'small',
          type: 'error',
          style: { marginLeft: '8px' },
          onClick: () => showDeleteConfirm(row)
        }, { default: () => '删除' })
      ]
    }
  }
]

const fetchNodes = async () => {
  try {
    loading.value = true
    const data = await ApiClient.get<Node[]>('/admin/nodes')
    nodes.value = data
  } catch (error: any) {
    console.error('获取节点列表失败:', error)
    message.error('获取节点列表失败')
  } finally {
    loading.value = false
  }
}

const addNode = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    adding.value = true

    console.log('提交节点数据:', nodeForm)

    await ApiClient.post('/admin/nodes', nodeForm)

    message.success('节点添加成功')
    showAddModal.value = false

    // 重置表单
    Object.assign(nodeForm, {
      name: '',
      server_addr: '',
      server_port: 7000,
      dashboard_port: 7500,
      dashboard_user: 'admin',
      dashboard_password: '',
      description: '',
      country: '',
      region: '',
      city: '',
    })

    await fetchNodes()
  } catch (error: any) {
    console.error('添加节点失败:', error)

    // 显示具体的错误信息
    let errorMessage = '添加节点失败'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    message.error(errorMessage)
  } finally {
    adding.value = false
  }
}

const editNode = (node: Node) => {
  editingNode.value = node
  // 填充编辑表单
  Object.assign(editForm, {
    name: node.name,
    server_addr: node.server_addr,
    server_port: node.server_port,
    dashboard_port: node.dashboard_port,
    dashboard_user: node.dashboard_user,
    dashboard_password: node.dashboard_password,
    description: node.description,
    country: node.country,
    region: node.region,
    city: node.city,
  })
  showEditModal.value = true
}

const updateNode = async () => {
  if (!editFormRef.value || !editingNode.value) return

  try {
    await editFormRef.value.validate()
    editing.value = true

    console.log('更新节点数据:', editForm)

    await ApiClient.put(`/admin/nodes/${editingNode.value.id}`, editForm)

    message.success('节点更新成功')
    showEditModal.value = false
    editingNode.value = null

    await fetchNodes()
  } catch (error: any) {
    console.error('更新节点失败:', error)

    // 显示具体的错误信息
    let errorMessage = '更新节点失败'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    message.error(errorMessage)
  } finally {
    editing.value = false
  }
}

const toggleNodeActive = async (node: Node) => {
  try {
    await ApiClient.post(`/admin/nodes/${node.id}/toggle-active`)
    message.success(`节点${node.is_active ? '停用' : '启用'}成功`)
    await fetchNodes()
  } catch (error: any) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

// 显示删除确认
const showDeleteConfirm = (node: Node) => {
  deletingNode.value = node
  showDeleteModal.value = true
}

// 确认删除节点
const confirmDeleteNode = async () => {
  if (!deletingNode.value) return

  try {
    deleting.value = true
    await ApiClient.delete(`/admin/nodes/${deletingNode.value.id}`)
    message.success('节点删除成功')
    showDeleteModal.value = false
    deletingNode.value = null
    await fetchNodes()
  } catch (error: any) {
    console.error('删除失败:', error)
    message.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const deleteNode = async (node: Node) => {
  try {
    await ApiClient.delete(`/admin/nodes/${node.id}`)
    message.success('节点删除成功')
    await fetchNodes()
  } catch (error: any) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 编辑节点权限
const editNodePermissions = (node: Node) => {
  currentNode.value = node
  // 解析当前节点的用户组权限
  if (node.allowed_user_groups) {
    selectedUserGroups.value = node.allowed_user_groups.split(',').map(g => g.trim())
  } else {
    // 默认允许所有用户组
    selectedUserGroups.value = ['unverified', 'verified', 'sponsor', 'admin']
  }
  showPermissionModal.value = true
}

// 更新节点权限
const updateNodePermissions = async () => {
  if (!currentNode.value) return

  try {
    updatingPermissions.value = true
    await ApiClient.put(`/admin/nodes/${currentNode.value.id}/permissions`, {
      allowed_user_groups: selectedUserGroups.value
    })
    message.success('节点权限更新成功')
    showPermissionModal.value = false
    await fetchNodes()
  } catch (error: any) {
    console.error('权限更新失败:', error)
    message.error('权限更新失败')
  } finally {
    updatingPermissions.value = false
  }
}

onMounted(() => {
  fetchNodes()
})
</script>

<style scoped>
.admin-node-list {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.permission-content h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.permission-desc {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.user-group-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.group-desc {
  color: #64748b;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
