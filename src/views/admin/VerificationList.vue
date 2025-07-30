<template>
  <div class="admin-verification-list">
    <div class="container">
      <div class="page-header">
        <h1>实名认证管理</h1>
        <p>查看用户实名认证信息</p>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="verifications"
          :loading="loading"
          :pagination="pagination"
          remote
          @update:page="handlePageChange"
        />
      </n-card>
    </div>

    <!-- 查看详情模态框 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="实名认证详情" style="width: 500px">
      <div v-if="selectedVerification" class="verification-detail">
        <div class="detail-item">
          <span class="label">用户ID:</span>
          <span class="value">{{ selectedVerification.user_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">真实姓名:</span>
          <span class="value">{{ selectedVerification.real_name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">身份证号:</span>
          <span class="value">{{ selectedVerification.id_card }}</span>
        </div>
        <div class="detail-item">
          <span class="label">认证状态:</span>
          <n-tag :type="selectedVerification.is_verified ? 'success' : 'warning'">
            {{ selectedVerification.is_verified ? '已认证' : '待认证' }}
          </n-tag>
        </div>
        <div class="detail-item">
          <span class="label">提交时间:</span>
          <span class="value">{{ formatDateTime(selectedVerification.created_at) }}</span>
        </div>
      </div>
      <template #footer>
        <n-button @click="showDetailModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NButton, NTag, type DataTableColumns } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatDateTime } from '@/utils'

interface Verification {
  id: number
  user_id: number
  username: string
  real_name: string
  id_card: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

const message = useMessage()

const loading = ref(false)
const showDetailModal = ref(false)
const verifications = ref<Verification[]>([])
const selectedVerification = ref<Verification | null>(null)
const pagination = ref({
  page: 1,
  pageSize: 20,
  itemCount: 0,
})

const columns: DataTableColumns<Verification> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '用户ID',
    key: 'user_id',
    width: 100,
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '真实姓名',
    key: 'real_name',
    width: 120,
    render: (row) => row.real_name || '-'
  },
  {
    title: '身份证号',
    key: 'id_card',
    width: 180,
    render: (row) => {
      if (!row.id_card) return '-'
      // 隐藏中间部分
      return row.id_card.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    }
  },
  {
    title: '认证状态',
    key: 'is_verified',
    width: 100,
    render: (row) => {
      return h(NTag, { 
        type: row.is_verified ? 'success' : 'warning',
        size: 'small' 
      }, { 
        default: () => row.is_verified ? '已认证' : '待认证' 
      })
    }
  },
  {
    title: '提交时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatDateTime(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) => {
      return h(NButton, {
        size: 'small',
        onClick: () => viewDetail(row)
      }, { default: () => '查看详情' })
    }
  }
]

const fetchVerifications = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/admin/verifications', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.pageSize,
      }
    })
    verifications.value = response.verifications || []
    pagination.value.itemCount = response.total || 0
  } catch (error: any) {
    console.error('获取认证列表失败:', error)
    message.error('获取认证列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchVerifications()
}

const viewDetail = (verification: Verification) => {
  selectedVerification.value = verification
  showDetailModal.value = true
}

onMounted(() => {
  fetchVerifications()
})
</script>

<style scoped>
.admin-verification-list {
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

.verification-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  color: #1e293b;
  font-weight: 600;
}
</style>
