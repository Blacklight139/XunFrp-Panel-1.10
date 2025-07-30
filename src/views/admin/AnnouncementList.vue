<template>
  <div class="admin-announcement-list">
    <div class="container">
      <div class="page-header">
        <h1>公告管理</h1>
        <div class="header-actions">
          <n-button type="primary" @click="showAddModal = true">
            发布公告
          </n-button>
        </div>
      </div>

      <n-card>
        <n-data-table
          :columns="columns"
          :data="announcements"
          :loading="loading"
        />
      </n-card>
    </div>

    <!-- 发布公告模态框 -->
    <n-modal v-model:show="showAddModal" preset="card" title="发布公告" style="width: 600px">
      <n-form ref="formRef" :model="announcementForm" :rules="announcementRules">
        <n-form-item label="公告标题" path="title">
          <n-input v-model:value="announcementForm.title" placeholder="请输入公告标题" />
        </n-form-item>
        <n-form-item label="公告类型" path="type">
          <n-select
            v-model:value="announcementForm.type"
            :options="typeOptions"
            placeholder="请选择公告类型"
          />
        </n-form-item>
        <n-form-item label="公告内容" path="content">
          <n-input
            v-model:value="announcementForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </n-form-item>
        <n-form-item label="是否置顶">
          <n-switch v-model:value="announcementForm.is_pinned" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="addAnnouncement" :loading="adding">发布</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h } from 'vue'
import { useMessage, NButton, NTag, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import { formatDateTime } from '@/utils'
import type { Announcement } from '@/types'

const message = useMessage()

const loading = ref(false)
const adding = ref(false)
const showAddModal = ref(false)
const formRef = ref<FormInst | null>(null)
const announcements = ref<Announcement[]>([])

const announcementForm = reactive({
  title: '',
  content: '',
  type: 'info',
  is_pinned: false,
})

const typeOptions = [
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
  { label: '成功', value: 'success' },
]

const announcementRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: ['input', 'blur'] },
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: ['input', 'blur'] },
  ],
  type: [
    { required: true, message: '请选择公告类型', trigger: ['change', 'blur'] },
  ],
}

const columns: DataTableColumns<Announcement> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '标题',
    key: 'title',
    width: 200,
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap = {
        info: { type: 'info', label: '信息' },
        warning: { type: 'warning', label: '警告' },
        error: { type: 'error', label: '错误' },
        success: { type: 'success', label: '成功' },
      }
      const config = typeMap[row.type as keyof typeof typeMap] || typeMap.info
      return h(NTag, { type: config.type as any, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '内容',
    key: 'content',
    width: 300,
    render: (row) => {
      const content = row.content || ''
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }
  },
  {
    title: '置顶',
    key: 'is_pinned',
    width: 80,
    render: (row) => {
      return h(NTag, { 
        type: row.is_pinned ? 'success' : 'default',
        size: 'small' 
      }, { 
        default: () => row.is_pinned ? '是' : '否' 
      })
    }
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
    width: 150,
    render: (row) => {
      return [
        h(NButton, {
          size: 'small',
          onClick: () => editAnnouncement(row)
        }, { default: () => '编辑' }),
        h(NButton, {
          size: 'small',
          type: 'error',
          style: { marginLeft: '8px' },
          onClick: () => deleteAnnouncement(row)
        }, { default: () => '删除' })
      ]
    }
  }
]

const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const data = await ApiClient.get<Announcement[]>('/admin/announcements')
    announcements.value = data
  } catch (error: any) {
    console.error('获取公告列表失败:', error)
    message.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

const addAnnouncement = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    adding.value = true
    
    await ApiClient.post('/admin/announcements', announcementForm)
    
    message.success('公告发布成功')
    showAddModal.value = false
    
    // 重置表单
    Object.assign(announcementForm, {
      title: '',
      content: '',
      type: 'info',
      is_pinned: false,
    })
    
    await fetchAnnouncements()
  } catch (error: any) {
    console.error('发布公告失败:', error)
    message.error('发布公告失败')
  } finally {
    adding.value = false
  }
}

const editAnnouncement = (announcement: Announcement) => {
  message.info('编辑公告功能待实现')
}

const deleteAnnouncement = async (announcement: Announcement) => {
  try {
    await ApiClient.delete(`/admin/announcements/${announcement.id}`)
    message.success('公告删除成功')
    await fetchAnnouncements()
  } catch (error: any) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.admin-announcement-list {
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
