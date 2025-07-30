<template>
  <div class="advertisement-management">
    <n-card title="广告位管理">
      <template #header-extra>
        <n-button type="primary" @click="showCreateModal = true">
          创建广告位
        </n-button>
      </template>

      <!-- 广告位列表 -->
      <n-table :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>位置</th>
            <th>状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" style="text-align: center; padding: 20px;">
              <n-spin size="medium" />
            </td>
          </tr>
          <tr v-else-if="advertisements.length === 0">
            <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
              暂无广告位数据
            </td>
          </tr>
          <tr v-else v-for="ad in advertisements" :key="ad.id">
            <td>{{ ad.id }}</td>
            <td>{{ ad.title }}</td>
            <td>{{ getPositionLabel(ad.position) }}</td>
            <td>
              <n-tag :type="ad.enabled ? 'success' : 'error'">
                {{ ad.enabled ? '启用' : '禁用' }}
              </n-tag>
            </td>
            <td>{{ ad.sort_order }}</td>
            <td>
              <n-space>
                <n-button size="small" @click="editAd(ad)">编辑</n-button>
                <n-button size="small" type="warning" @click="toggleAd(ad)">
                  {{ ad.enabled ? '禁用' : '启用' }}
                </n-button>
                <n-button size="small" type="error" @click="deleteAd(ad)">删除</n-button>
              </n-space>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-card>

    <!-- 创建/编辑模态框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="广告位管理" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="80px">
        <n-form-item label="标题">
          <n-input v-model:value="formData.title" placeholder="请输入广告标题" />
        </n-form-item>
        
        <n-form-item label="内容">
          <n-input v-model:value="formData.content" type="textarea" :rows="3" placeholder="请输入广告内容" />
        </n-form-item>
        
        <n-form-item label="位置">
          <n-select v-model:value="formData.position" :options="positionOptions" placeholder="选择位置" />
        </n-form-item>
        
        <n-form-item label="排序">
          <n-input-number v-model:value="formData.sort_order" :min="1" />
        </n-form-item>
        
        <n-form-item label="启用">
          <n-switch v-model:value="formData.enabled" />
        </n-form-item>
      </n-form>
      
      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="submitForm">
            {{ editingId ? '更新' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

interface Advertisement {
  id: number
  title: string
  content: string
  position: string
  enabled: boolean
  sort_order: number
  image_url?: string
  link_url?: string
  closeable?: boolean
  auto_close?: boolean
  close_delay?: number
}

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingId = ref<number | null>(null)

const advertisements = ref<Advertisement[]>([])

const positionOptions = [
  { label: '左侧边栏', value: 'left-sidebar' },
  { label: '右侧边栏', value: 'right-sidebar' }
]

const formData = ref({
  title: '',
  content: '',
  position: '',
  enabled: true,
  sort_order: 1,
  image_url: '',
  link_url: '',
  closeable: true,
  auto_close: false,
  close_delay: 5
})

const getPositionLabel = (value: string) => {
  const option = positionOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const fetchAdvertisements = async () => {
  try {
    loading.value = true
    console.log('🔍 获取广告位列表...')
    
    const response = await fetch('/api/v1/admin/advertisements', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const data = await response.json()
    console.log('📋 广告位数据:', data)
    
    if (data.code === 200) {
      advertisements.value = data.data || []
      console.log('✅ 获取成功，数量:', advertisements.value.length)
    } else {
      message.error(data.message || '获取失败')
    }
  } catch (error) {
    console.error('❌ 获取广告位失败:', error)
    message.error('获取广告位失败')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formData.value.title || !formData.value.content || !formData.value.position) {
    message.error('请填写必要信息')
    return
  }
  
  try {
    submitting.value = true
    
    const url = editingId.value 
      ? `/api/v1/admin/advertisements/${editingId.value}`
      : '/api/v1/admin/advertisements/'
    
    const method = editingId.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData.value)
    })
    
    const data = await response.json()
    if (data.code === 200 || data.code === 201) {
      message.success(editingId.value ? '更新成功' : '创建成功')
      showCreateModal.value = false
      resetForm()
      await fetchAdvertisements()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const editAd = (ad: Advertisement) => {
  editingId.value = ad.id
  formData.value = { ...ad }
  showCreateModal.value = true
}

const toggleAd = async (ad: Advertisement) => {
  try {
    const response = await fetch(`/api/v1/admin/advertisements/${ad.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...ad,
        enabled: !ad.enabled
      })
    })

    const data = await response.json()
    if (data.code === 200) {
      message.success(`已${ad.enabled ? '禁用' : '启用'}`)
      await fetchAdvertisements()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error) {
    message.error('操作失败')
  }
}

const deleteAd = async (ad: Advertisement) => {
  try {
    const response = await fetch(`/api/v1/admin/advertisements/${ad.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    if (data.code === 200) {
      message.success('删除成功')
      await fetchAdvertisements()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const resetForm = () => {
  editingId.value = null
  formData.value = {
    title: '',
    content: '',
    position: '',
    enabled: true,
    sort_order: 1,
    image_url: '',
    link_url: '',
    closeable: true,
    auto_close: false,
    close_delay: 5
  }
}

onMounted(() => {
  fetchAdvertisements()
})
</script>

<style scoped>
.advertisement-management {
  padding: 20px;
}
</style>
