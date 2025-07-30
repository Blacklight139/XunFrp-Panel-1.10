<template>
  <div class="tunnel-config">
    <n-card title="隧道配置" size="large">
      <template #header-extra>
        <n-tag type="info" size="small">
          节点: {{ selectedNode?.name }}
        </n-tag>
      </template>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="top"
        require-mark-placement="right-hanging"
      >
        <!-- 基础配置 -->
        <n-grid :cols="2" :x-gap="16">
          <n-form-item-gi label="隧道名称" path="name">
            <n-input
              v-model:value="formData.name"
              placeholder="请输入隧道名称"
              :maxlength="50"
              show-count
            />
          </n-form-item-gi>

          <n-form-item-gi label="隧道类型" path="type">
            <n-select
              v-model:value="formData.type"
              :options="tunnelTypeOptions"
              placeholder="选择隧道类型"
              @update:value="onTypeChange"
            />
          </n-form-item-gi>
        </n-grid>

        <!-- 本地配置 -->
        <n-grid :cols="2" :x-gap="16">
          <n-form-item-gi label="本地IP" path="local_ip">
            <n-input
              v-model:value="formData.local_ip"
              placeholder="127.0.0.1"
            />
          </n-form-item-gi>

          <n-form-item-gi label="本地端口" path="local_port">
            <n-input-number
              v-model:value="formData.local_port"
              placeholder="请输入本地端口"
              :min="1"
              :max="65535"
              style="width: 100%"
            />
          </n-form-item-gi>
        </n-grid>

        <!-- TCP/UDP 特定配置 -->
        <div v-if="formData.type === 'tcp' || formData.type === 'udp'">
          <n-form-item label="远程端口" path="remote_port">
            <n-input-number
              v-model:value="formData.remote_port"
              placeholder="请输入远程端口"
              :min="1"
              :max="65535"
              style="width: 100%"
            />
            <template #feedback>
              <span class="form-tip">
                服务器上开放的端口，客户端将通过此端口访问您的服务
              </span>
            </template>
          </n-form-item>
        </div>

        <!-- HTTP/HTTPS 特定配置 -->
        <div v-if="formData.type === 'http' || formData.type === 'https'">
          <n-form-item label="自定义域名" path="custom_domain">
            <n-input
              v-model:value="formData.custom_domain"
              placeholder="example.com (可选)"
            />
            <template #feedback>
              <span class="form-tip">
                如果不填写，系统将自动分配子域名
              </span>
            </template>
          </n-form-item>

          <n-form-item label="子域名" path="subdomain">
            <n-input
              v-model:value="formData.subdomain"
              placeholder="myapp"
            />
            <template #feedback>
              <span class="form-tip">
                访问地址将是: {{ getPreviewUrl() }}
              </span>
            </template>
          </n-form-item>

          <n-form-item label="路径" path="locations">
            <n-dynamic-input
              v-model:value="formData.locations"
              placeholder="/"
              :min="1"
            />
            <template #feedback>
              <span class="form-tip">
                指定HTTP请求的路径，支持多个路径
              </span>
            </template>
          </n-form-item>

          <n-form-item label="Host头重写" path="host_header_rewrite">
            <n-input
              v-model:value="formData.host_header_rewrite"
              placeholder="localhost (可选)"
            />
            <template #feedback>
              <span class="form-tip">
                重写HTTP请求的Host头，通常设置为本地服务的域名
              </span>
            </template>
          </n-form-item>
        </div>

        <!-- 高级选项 -->
        <n-divider title-placement="left">
          <span style="font-size: 14px; color: #666;">高级选项</span>
        </n-divider>

        <n-grid :cols="2" :x-gap="16">
          <n-form-item-gi label="启用加密">
            <n-switch v-model:value="formData.use_encryption" />
            <template #feedback>
              <span class="form-tip recommended">
                <n-icon :component="ShieldCheckmark" />
                建议开启，保护数据传输安全
              </span>
            </template>
          </n-form-item-gi>

          <n-form-item-gi label="启用压缩">
            <n-switch v-model:value="formData.use_compression" />
            <template #feedback>
              <span class="form-tip recommended">
                <n-icon :component="Flash" />
                建议开启，减少带宽占用
              </span>
            </template>
          </n-form-item-gi>
        </n-grid>

        <!-- 带宽限制 -->
        <n-form-item label="带宽限制 (可选)">
          <n-grid :cols="2" :x-gap="16">
            <n-form-item-gi label="上传限制 (KB/s)">
              <n-input-number
                v-model:value="formData.bandwidth_limit_upload"
                placeholder="不限制"
                :min="0"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi label="下载限制 (KB/s)">
              <n-input-number
                v-model:value="formData.bandwidth_limit_download"
                placeholder="不限制"
                :min="0"
                style="width: 100%"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form-item>

        <!-- 备注 -->
        <n-form-item label="备注 (可选)" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :maxlength="200"
            show-count
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="footer-actions">
          <n-button @click="$emit('back')">
            上一步
          </n-button>
          <n-button @click="$emit('cancel')">
            取消
          </n-button>
          <n-button
            type="primary"
            :loading="creating"
            @click="createTunnel"
          >
            {{ props.isEdit ? '保存修改' : '创建隧道' }}
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ShieldCheckmark, Flash } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import { useMessage } from 'naive-ui'

interface Node {
  id: number
  name: string
  server_addr: string
  server_port: number
}

interface TunnelFormData {
  name: string
  type: string
  local_ip: string
  local_port: number | null
  remote_port: number | null
  custom_domain: string
  subdomain: string
  locations: string[]
  host_header_rewrite: string
  use_encryption: boolean
  use_compression: boolean
  bandwidth_limit_upload: number | null
  bandwidth_limit_download: number | null
  remark: string
}

const props = defineProps<{
  selectedNode: Node
  isEdit?: boolean
  editData?: any
}>()

const emit = defineEmits(['back', 'cancel', 'success'])
const message = useMessage()

const formRef = ref()
const creating = ref(false)

// 表单数据
const formData = ref<TunnelFormData>({
  name: '',
  type: 'http',
  local_ip: '127.0.0.1',
  local_port: null,
  remote_port: null,
  custom_domain: '',
  subdomain: '',
  locations: ['/'],
  host_header_rewrite: '',
  use_encryption: true,
  use_compression: true,
  bandwidth_limit_upload: null,
  bandwidth_limit_download: null,
  remark: ''
})

// 隧道类型选项
const tunnelTypeOptions = [
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入隧道名称', trigger: 'blur' },
    { min: 2, max: 50, message: '隧道名称长度为2-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '隧道名称只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择隧道类型', trigger: 'change' }
  ],
  local_ip: [
    { required: true, message: '请输入本地IP', trigger: 'blur' }
  ],
  local_port: [
    { required: true, message: '请输入本地端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口范围为1-65535', trigger: 'blur' }
  ],
  remote_port: [
    { 
      required: computed(() => formData.value.type === 'tcp' || formData.value.type === 'udp'), 
      message: '请输入远程端口', 
      trigger: 'blur' 
    },
    { type: 'number', min: 1, max: 65535, message: '端口范围为1-65535', trigger: 'blur' }
  ]
}

// 类型改变时的处理
const onTypeChange = (type: string) => {
  // 清空类型特定的字段
  if (type === 'http' || type === 'https') {
    formData.value.remote_port = null
  } else {
    formData.value.custom_domain = ''
    formData.value.subdomain = ''
    formData.value.locations = ['/']
    formData.value.host_header_rewrite = ''
  }
}

// 获取预览URL
const getPreviewUrl = () => {
  if (!formData.value.subdomain) return ''
  
  const protocol = formData.value.type === 'https' ? 'https' : 'http'
  const domain = formData.value.custom_domain || `${props.selectedNode.server_addr}`
  const subdomain = formData.value.subdomain
  
  if (formData.value.custom_domain) {
    return `${protocol}://${subdomain}.${domain}`
  } else {
    return `${protocol}://${subdomain}.${domain}`
  }
}

// 创建/编辑隧道
const createTunnel = async () => {
  try {
    await formRef.value?.validate()

    creating.value = true

    const tunnelData = {
      ...formData.value,
      node_id: props.selectedNode.id
    }

    if (props.isEdit && props.editData) {
      await ApiClient.put(`/tunnels/${props.editData.id}`, tunnelData)
      message.success('隧道修改成功')
    } else {
      await ApiClient.post('/tunnels', tunnelData)
      message.success('隧道创建成功')
    }

    emit('success')
  } catch (error: any) {
    console.error(props.isEdit ? '修改隧道失败:' : '创建隧道失败:', error)
    message.error(error.message || (props.isEdit ? '修改隧道失败' : '创建隧道失败'))
  } finally {
    creating.value = false
  }
}

// 初始化编辑数据
const initEditData = () => {
  if (props.isEdit && props.editData) {
    Object.assign(formData.value, {
      name: props.editData.name || '',
      type: props.editData.type || 'http',
      local_ip: props.editData.local_ip || '127.0.0.1',
      local_port: props.editData.local_port || null,
      remote_port: props.editData.remote_port || null,
      custom_domain: props.editData.custom_domain || '',
      subdomain: props.editData.subdomain || '',
      locations: props.editData.locations || ['/'],
      host_header_rewrite: props.editData.host_header_rewrite || '',
      use_encryption: props.editData.use_encryption ?? true,
      use_compression: props.editData.use_compression ?? true,
      bandwidth_limit_upload: props.editData.bandwidth_limit_upload || null,
      bandwidth_limit_download: props.editData.bandwidth_limit_download || null,
      remark: props.editData.remark || ''
    })
  }
}

// 监听编辑数据变化
watch(() => props.editData, () => {
  if (props.isEdit) {
    initEditData()
  }
}, { immediate: true })
</script>

<style scoped>
.tunnel-config {
  max-width: 800px;
  margin: 0 auto;
}

.form-tip {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-tip.recommended {
  color: #18a058;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
