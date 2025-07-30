<template>
  <div class="admin-tunnel-list">
    <div class="container">
      <div class="page-header">
        <h1>隧道管理</h1>
        <p>管理所有用户的隧道</p>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="tunnels"
          :loading="loading"
          :pagination="pagination"
          remote
          @update:page="handlePageChange"
        />
      </n-card>
    </div>

    <!-- 删除确认模态框 -->
    <n-modal v-model:show="deleteModalVisible" preset="card" title="确认删除隧道" style="width: 500px">
      <div v-if="selectedTunnel">
        <n-alert type="error" style="margin-bottom: 16px">
          <strong>警告：此操作不可撤销！</strong>
        </n-alert>
        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="隧道名称">{{ selectedTunnel.name }}</n-descriptions-item>
          <n-descriptions-item label="用户ID">{{ selectedTunnel.user_id }}</n-descriptions-item>
          <n-descriptions-item label="协议类型">{{ selectedTunnel.type.toUpperCase() }}</n-descriptions-item>
          <n-descriptions-item label="本地地址">{{ selectedTunnel.local_ip }}:{{ selectedTunnel.local_port }}</n-descriptions-item>
          <n-descriptions-item label="远程端口">{{ selectedTunnel.remote_port || '自动分配' }}</n-descriptions-item>
        </n-descriptions>
        <p style="margin-top: 16px; color: #666;">
          删除后，用户将无法再使用此隧道，且所有相关配置将被永久清除。
        </p>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="deleteModalVisible = false">取消</n-button>
          <n-button type="error" @click="confirmDelete" :loading="deleting">
            确认删除
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 封禁确认模态框 -->
    <n-modal v-model:show="banModalVisible" preset="card" title="封禁隧道" style="width: 500px">
      <div v-if="selectedTunnel">
        <n-alert type="warning" style="margin-bottom: 16px">
          封禁后，用户将无法操作此隧道（包括删除）
        </n-alert>
        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="隧道名称">{{ selectedTunnel.name }}</n-descriptions-item>
          <n-descriptions-item label="用户ID">{{ selectedTunnel.user_id }}</n-descriptions-item>
          <n-descriptions-item label="当前状态">
            <n-tag :type="selectedTunnel.status === 'online' ? 'success' : 'default'" size="small">
              {{ getTunnelStatusName(selectedTunnel.status) }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="banModalVisible = false">取消</n-button>
          <n-button type="warning" @click="confirmBan" :loading="banning">
            确认封禁
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NButton, NTag, type DataTableColumns } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatDateTime, getTunnelStatusName } from '@/utils'
import type { Tunnel } from '@/types'

const message = useMessage()

const loading = ref(false)
const deleting = ref(false)
const deleteModalVisible = ref(false)
const banModalVisible = ref(false)
const banning = ref(false)
const selectedTunnel = ref<Tunnel | null>(null)

const tunnels = ref<Tunnel[]>([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
})

const columns: DataTableColumns<Tunnel> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '隧道名称',
    key: 'name',
    width: 150,
  },
  {
    title: '用户',
    key: 'user_id',
    width: 120,
    render: (row) => {
      return row.user?.username || `ID:${row.user_id}`
    }
  },
  {
    title: '协议',
    key: 'type',
    width: 80,
    render: (row) => h(NTag, { size: 'small' }, { default: () => row.type.toUpperCase() })
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      const type = row.status === 'online' ? 'success' : 
                   row.status === 'error' ? 'error' : 'default'
      return h(NTag, { type, size: 'small' }, { default: () => getTunnelStatusName(row.status) })
    }
  },
  {
    title: '本地地址',
    key: 'local_address',
    width: 150,
    render: (row) => `${row.local_ip}:${row.local_port}`
  },
  {
    title: '远程端口',
    key: 'remote_port',
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
    width: 200,
    render: (row) => {
      return [
        h(NButton, {
          size: 'small',
          type: row.is_banned ? 'success' : 'warning',
          onClick: () => row.is_banned ? unbanTunnel(row) : showBanConfirm(row)
        }, { default: () => row.is_banned ? '解封' : '封禁' }),
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

const fetchTunnels = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/admin/tunnels', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.pageSize,
      }
    })
    tunnels.value = response.tunnels || []
    pagination.value.itemCount = response.total || 0
  } catch (error: any) {
    console.error('获取隧道列表失败:', error)
    message.error('获取隧道列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchTunnels()
}

// 显示封禁确认
const showBanConfirm = (tunnel: Tunnel) => {
  selectedTunnel.value = tunnel
  banModalVisible.value = true
}

// 确认封禁隧道
const confirmBan = async () => {
  if (!selectedTunnel.value) return

  try {
    banning.value = true
    await ApiClient.post(`/admin/tunnels/${selectedTunnel.value.id}/toggle-ban`)
    message.success('隧道封禁成功')
    banModalVisible.value = false
    await fetchTunnels()
  } catch (error: any) {
    console.error('封禁隧道失败:', error)
    message.error('封禁失败')
  } finally {
    banning.value = false
  }
}

// 解封隧道
const unbanTunnel = async (tunnel: Tunnel) => {
  try {
    await ApiClient.post(`/admin/tunnels/${tunnel.id}/toggle-ban`)
    message.success('隧道解封成功')
    await fetchTunnels()
  } catch (error: any) {
    console.error('解封隧道失败:', error)
    message.error('解封失败')
  }
}

const toggleTunnelBan = async (tunnel: Tunnel) => {
  try {
    await ApiClient.post(`/admin/tunnels/${tunnel.id}/toggle-ban`)
    message.success(`隧道${tunnel.is_banned ? '解封' : '封禁'}成功`)
    await fetchTunnels()
  } catch (error: any) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

// 显示删除确认
const showDeleteConfirm = (tunnel: Tunnel) => {
  selectedTunnel.value = tunnel
  deleteModalVisible.value = true
}

// 确认删除隧道
const confirmDelete = async () => {
  if (!selectedTunnel.value) return

  try {
    deleting.value = true
    await ApiClient.delete(`/admin/tunnels/${selectedTunnel.value.id}`)
    message.success('隧道删除成功')
    deleteModalVisible.value = false
    selectedTunnel.value = null
    await fetchTunnels()
  } catch (error: any) {
    console.error('删除隧道失败:', error)
    message.error(error.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchTunnels()
})
</script>

<style scoped>
.admin-tunnel-list {
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
