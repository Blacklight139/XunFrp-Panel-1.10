<template>
  <div class="tunnel-create">
    <!-- 页面头部 -->
    <div class="page-header" data-aos="fade-down" data-aos-duration="800">
      <n-breadcrumb>
        <n-breadcrumb-item @click="$router.push('/dashboard/tunnels')">
          隧道管理
        </n-breadcrumb-item>
        <n-breadcrumb-item>
          创建隧道
        </n-breadcrumb-item>
      </n-breadcrumb>

      <h1 class="page-title">创建隧道</h1>
      <p class="page-description">选择节点并配置您的隧道</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-container" data-aos="fade-up" data-aos-delay="200">
      <n-steps :current="currentStep" :status="stepStatus">
        <n-step title="选择节点" description="选择一个在线的节点" />
        <n-step title="配置隧道" description="设置隧道参数" />
        <n-step title="完成" description="隧道创建成功" />
      </n-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: 选择节点 -->
      <div v-if="currentStep === 1" class="node-selection">
        <n-card title="选择节点" size="large" data-aos="fade-up" data-aos-delay="400">
          <!-- 搜索框 -->
          <template #header-extra>
            <n-input
              v-model:value="searchQuery"
              placeholder="搜索节点名称或ID..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>
          </template>

          <n-spin :show="loading">
            <!-- 节点列表 -->
            <div v-if="filteredNodes.length === 0" class="empty-state">
              <n-empty description="暂无可用节点" />
            </div>

            <div v-else class="nodes-grid">
              <div
                v-for="(node, index) in filteredNodes"
                :key="node.id"
                class="node-card"
                :class="{
                  'selected': selectedNodeId === node.id,
                  'disabled': !isNodeAvailable(node)
                }"
                @click="selectNode(node)"
                data-aos="fade-up"
                :data-aos-delay="index * 100"
              >
                <!-- 节点状态标签 -->
                <div class="node-status">
                  <n-tag
                    :type="getNodeStatusType(node)"
                    size="small"
                    round
                  >
                    {{ getNodeStatusText(node) }}
                  </n-tag>
                </div>

                <!-- 节点基本信息 -->
                <div class="node-header">
                  <h3 class="node-name">{{ node.name }}</h3>
                  <div class="node-id">ID: {{ node.id }}</div>
                </div>

                <!-- 节点详细信息 -->
                <div class="node-info">
                  <div class="info-row">
                    <span class="label">地址:</span>
                    <span class="value">{{ node.server_addr }}:{{ node.server_port }}</span>
                  </div>

                  <div class="info-row">
                    <span class="label">位置:</span>
                    <span class="value">{{ node.location || '未知' }}</span>
                  </div>

                  <div class="info-row">
                    <span class="label">隧道数:</span>
                    <span class="value">{{ node.online_tunnels || 0 }} / {{ node.max_tunnels || '∞' }}</span>
                  </div>

                  <div class="info-row">
                    <span class="label">在线用户:</span>
                    <span class="value">{{ node.online_users || 0 }}</span>
                  </div>
                </div>

                <!-- 节点性能指标 -->
                <div class="node-metrics">
                  <div class="metric">
                    <div class="metric-label">CPU</div>
                    <n-progress
                      type="line"
                      :percentage="node.cpu_usage || 0"
                      :color="getMetricColor(node.cpu_usage || 0)"
                      :show-indicator="false"
                      :height="6"
                    />
                    <div class="metric-value">{{ (node.cpu_usage || 0).toFixed(1) }}%</div>
                  </div>

                  <div class="metric">
                    <div class="metric-label">内存</div>
                    <n-progress
                      type="line"
                      :percentage="node.memory_usage || 0"
                      :color="getMetricColor(node.memory_usage || 0)"
                      :show-indicator="false"
                      :height="6"
                    />
                    <div class="metric-value">{{ (node.memory_usage || 0).toFixed(1) }}%</div>
                  </div>

                  <div class="metric">
                    <div class="metric-label">负载</div>
                    <n-progress
                      type="line"
                      :percentage="Math.min((node.load_average || 0) * 25, 100)"
                      :color="getLoadColor(node.load_average || 0)"
                      :show-indicator="false"
                      :height="6"
                    />
                    <div class="metric-value">{{ (node.load_average || 0).toFixed(2) }}</div>
                  </div>
                </div>

                <!-- 选中指示器 -->
                <div v-if="selectedNodeId === node.id" class="selected-indicator">
                  <n-icon :component="CheckmarkCircle" size="24" color="#18a058" />
                </div>

                <!-- 离线遮罩 -->
                <div v-if="!isNodeAvailable(node)" class="offline-overlay">
                  <div class="offline-text">
                    <span v-if="!node.is_active">节点已禁用</span>
                    <span v-else-if="node.is_banned">节点已封禁</span>
                    <span v-else>节点离线</span>
                  </div>
                </div>
              </div>
            </div>
          </n-spin>

          <!-- 底部操作按钮 -->
          <template #footer>
            <div class="footer-actions">
              <n-button @click="goBack">
                取消
              </n-button>
              <n-button
                type="primary"
                :disabled="!selectedNodeId"
                @click="nextToConfig"
              >
                下一步
              </n-button>
            </div>
          </template>
        </n-card>
      </div>

      <!-- 步骤2: 配置隧道 -->
      <div v-if="currentStep === 2" class="tunnel-config">
        <n-card title="隧道配置" size="large" data-aos="fade-up" data-aos-delay="400">
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
            <div class="config-section" data-aos="fade-up" data-aos-delay="200">
              <h3 class="section-title">
                <n-icon :component="Settings" />
                基础配置
              </h3>
              <n-grid :cols="2" :x-gap="16" :y-gap="16">
                <n-form-item-gi label="隧道名称" path="name">
                  <n-input-group>
                    <n-input
                      v-model:value="formData.name"
                      placeholder="请输入隧道名称，如：web-server"
                      :maxlength="50"
                      show-count
                    >
                      <template #prefix>
                        <n-icon :component="DocumentText" />
                      </template>
                    </n-input>
                    <n-button @click="regenerateTunnelName" type="primary" ghost>
                      <template #icon>
                        <n-icon :component="Refresh" />
                      </template>
                      重新生成
                    </n-button>
                  </n-input-group>
                  <template #feedback>
                    <span class="form-tip">
                      隧道名称用于标识您的隧道，只能包含字母、数字、下划线和连字符。点击"重新生成"获取随机名称
                    </span>
                  </template>
                </n-form-item-gi>

                <n-form-item-gi label="隧道类型" path="type">
                  <n-select
                    v-model:value="formData.type"
                    :options="tunnelTypeOptions"
                    placeholder="选择隧道类型"
                    @update:value="onTypeChange"
                  >
                    <template #prefix>
                      <n-icon :component="Globe" />
                    </template>
                  </n-select>
                  <template #feedback>
                    <span class="form-tip">
                      HTTP/HTTPS适用于网站，TCP/UDP适用于其他服务
                    </span>
                  </template>
                </n-form-item-gi>
              </n-grid>
            </div>

            <!-- 本地配置 -->
            <div class="config-section" data-aos="fade-up" data-aos-delay="400">
              <h3 class="section-title">
                <n-icon :component="Desktop" />
                本地服务配置
              </h3>
              <n-grid :cols="2" :x-gap="16" :y-gap="16">
                <n-form-item-gi label="本地IP地址" path="local_ip">
                  <n-input
                    v-model:value="formData.local_ip"
                    placeholder="127.0.0.1"
                  >
                    <template #prefix>
                      <n-icon :component="Home" />
                    </template>
                  </n-input>
                  <template #feedback>
                    <span class="form-tip">
                      本地服务运行的IP地址，通常为127.0.0.1
                    </span>
                  </template>
                </n-form-item-gi>

                <n-form-item-gi label="本地端口" path="local_port">
                  <n-input-number
                    v-model:value="formData.local_port"
                    placeholder="请输入本地端口，如：8080"
                    :min="1"
                    :max="65535"
                    style="width: 100%"
                  />
                  <template #feedback>
                    <span class="form-tip">
                      本地服务监听的端口号，范围：1-65535
                    </span>
                  </template>
                </n-form-item-gi>
              </n-grid>
            </div>

            <!-- TCP/UDP 特定配置 -->
            <div v-if="formData.type === 'tcp' || formData.type === 'udp'" class="config-section">
              <h3 class="section-title">
                <n-icon :component="Server" />
                {{ formData.type.toUpperCase() }} 配置
              </h3>
              <div class="tcp-udp-config">
                <n-alert type="info" style="margin-bottom: 16px;">
                  <template #icon>
                    <n-icon :component="InformationCircle" />
                  </template>
                  {{ formData.type.toUpperCase() }} 隧道将为您分配一个服务器端口，客户端可通过此端口访问您的本地服务
                </n-alert>

                <n-form-item label="远程端口" path="remote_port">
                  <n-input-group>
                    <n-input-number
                      v-model:value="formData.remote_port"
                      placeholder="请输入远程端口，如：8080"
                      :min="1"
                      :max="65535"
                      style="width: 100%"
                    />
                    <n-button
                      @click="getAvailablePort"
                      type="primary"
                      ghost
                      :disabled="!selectedNode || (formData.type !== 'tcp' && formData.type !== 'udp')"
                    >
                      <template #icon>
                        <n-icon :component="Refresh" />
                      </template>
                      获取可用端口
                    </n-button>
                  </n-input-group>
                  <template #feedback>
                    <span class="form-tip">
                      <n-icon :component="Server" />
                      服务器上开放的端口，客户端将通过 {{ selectedNode?.server_addr }}:{{ formData.remote_port || 'XXXX' }} 访问您的服务。点击"获取可用端口"自动分配无冲突端口
                    </span>
                  </template>
                </n-form-item>
              </div>
            </div>

            <!-- HTTP/HTTPS 特定配置 -->
            <div v-if="formData.type === 'http' || formData.type === 'https'" class="config-section">
              <h3 class="section-title">
                <n-icon :component="Globe" />
                {{ formData.type.toUpperCase() }} 配置
              </h3>
              <div class="http-config">
                <n-alert type="info" style="margin-bottom: 16px;">
                  <template #icon>
                    <n-icon :component="InformationCircle" />
                  </template>
                  {{ formData.type.toUpperCase() }} 隧道将为您提供域名访问，无需记住端口号
                </n-alert>

                <n-grid :cols="2" :x-gap="16" :y-gap="16">
                  <n-form-item-gi label="自定义域名" path="custom_domain">
                    <n-input
                      v-model:value="formData.custom_domain"
                      placeholder="example.com (可选)"
                    >
                      <template #prefix>
                        <n-icon :component="Globe" />
                      </template>
                    </n-input>
                    <template #feedback>
                      <span class="form-tip">
                        如果您有自己的域名，可以在此填写。留空将使用系统域名
                      </span>
                    </template>
                  </n-form-item-gi>

                  <n-form-item-gi label="子域名" path="subdomain">
                    <n-input
                      v-model:value="formData.subdomain"
                      placeholder="myapp"
                    >
                      <template #prefix>
                        <n-icon :component="Link" />
                      </template>
                    </n-input>
                    <template #feedback>
                      <span class="form-tip preview-url">
                        <n-icon :component="Eye" />
                        访问地址预览: {{ getPreviewUrl() || '请填写子域名' }}
                      </span>
                    </template>
                  </n-form-item-gi>
                </n-grid>

                <n-form-item label="访问路径" path="locations">
                  <n-dynamic-input
                    v-model:value="formData.locations"
                    placeholder="/"
                    :min="1"
                  >
                    <template #create-button-default>
                      添加路径
                    </template>
                  </n-dynamic-input>
                  <template #feedback>
                    <span class="form-tip">
                      <n-icon :component="Navigate" />
                      指定HTTP请求的路径，支持多个路径。默认为 "/" 表示所有路径
                    </span>
                  </template>
                </n-form-item>

                <n-form-item label="Host头重写" path="host_header_rewrite">
                  <n-input
                    v-model:value="formData.host_header_rewrite"
                    placeholder="localhost (可选)"
                  >
                    <template #prefix>
                      <n-icon :component="Code" />
                    </template>
                  </n-input>
                  <template #feedback>
                    <span class="form-tip">
                      <n-icon :component="Settings" />
                      重写HTTP请求的Host头，通常设置为本地服务的域名或IP
                    </span>
                  </template>
                </n-form-item>
              </div>
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

          <!-- 底部操作按钮 -->
          <template #footer>
            <div class="footer-actions">
              <n-button @click="currentStep = 1">
                上一步
              </n-button>
              <n-button @click="goBack">
                取消
              </n-button>
              <n-button
                type="primary"
                :loading="creating"
                @click="createTunnel"
              >
                创建隧道
              </n-button>
            </div>
          </template>
        </n-card>
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="currentStep === 3" class="success-step">
        <n-result
          status="success"
          title="隧道创建成功"
          description="您的隧道已成功创建并可以使用"
        >
          <template #footer>
            <n-space>
              <n-button @click="createAnother">
                创建另一个隧道
              </n-button>
              <n-button type="primary" @click="goToTunnels">
                查看隧道列表
              </n-button>
            </n-space>
          </template>
        </n-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  Search,
  CheckmarkCircle,
  ShieldCheckmark,
  Flash,
  Settings,
  DocumentText,
  Globe,
  Desktop,
  Home,
  Server,
  InformationCircle,
  Link,
  Eye,
  Navigate,
  Code,
  Refresh
} from '@vicons/ionicons5'

interface Node {
  id: number
  name: string
  server_addr: string
  server_port: number
  location?: string
  is_active: boolean
  is_banned: boolean
  status: string
  online_tunnels?: number
  online_users?: number
  max_tunnels?: number
  cpu_usage?: number
  memory_usage?: number
  load_average?: number
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
  remark: string
}

const router = useRouter()
const message = useMessage()

// 状态管理
const currentStep = ref(1)
const loading = ref(false)
const creating = ref(false)
const searchQuery = ref('')
const nodes = ref<Node[]>([])
const selectedNodeId = ref<number | null>(null)
const selectedNode = ref<Node | null>(null)
const formRef = ref()

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
  remark: ''
})

// 生成随机隧道名称（调用后端API）
const generateRandomTunnelName = async (): Promise<string> => {
  try {
    const response = await fetch('/api/v1/tunnels/random-name', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    if (response.ok && data.code === 200) {
      return data.data.name
    } else {
      throw new Error(data.message || '生成随机名称失败')
    }
  } catch (error) {
    console.error('生成随机隧道名称失败:', error)
    // 如果API失败，使用本地生成作为备选
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }
}

// 重新生成隧道名称
const regenerateTunnelName = async () => {
  try {
    const newName = await generateRandomTunnelName()
    formData.value.name = newName
    message.success('已生成新的隧道名称')
  } catch (error) {
    message.error('生成隧道名称失败')
  }
}

// 获取可用端口
const getAvailablePort = async () => {
  if (!selectedNode.value || (formData.value.type !== 'tcp' && formData.value.type !== 'udp')) {
    return
  }

  try {
    const response = await fetch(`/api/v1/tunnels/available-port?node_id=${selectedNode.value.id}&type=${formData.value.type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    if (response.ok && data.code === 200) {
      formData.value.remote_port = data.data.port
      message.success(data.data.message)
    } else {
      throw new Error(data.message || '获取可用端口失败')
    }
  } catch (error) {
    console.error('获取可用端口失败:', error)
    message.error('获取可用端口失败')
  }
}

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
      validator: (_rule: any, value: any) => {
        // 只有TCP/UDP隧道需要远程端口
        if (formData.value.type === 'tcp' || formData.value.type === 'udp') {
          if (!value || value <= 0) {
            return new Error('TCP/UDP隧道必须指定远程端口')
          }
          if (value < 1 || value > 65535) {
            return new Error('端口范围为1-65535')
          }
        }
        return true
      },
      trigger: ['blur', 'change']
    }
  ]
}

// 计算属性
const stepStatus = computed(() => {
  if (currentStep.value === 3) return 'finish'
  return 'process'
})

// 过滤节点
const filteredNodes = computed(() => {
  if (!searchQuery.value) return nodes.value

  const query = searchQuery.value.toLowerCase()
  return nodes.value.filter(node =>
    node.name.toLowerCase().includes(query) ||
    node.id.toString().includes(query) ||
    node.server_addr.toLowerCase().includes(query)
  )
})

// 节点相关方法
const isNodeAvailable = (node: Node) => {
  return node.is_active && !node.is_banned && node.status === 'online'
}

const getNodeStatusType = (node: Node) => {
  if (!node.is_active) return 'default'
  if (node.is_banned) return 'warning'
  if (node.status === 'online') return 'success'
  return 'error'
}

const getNodeStatusText = (node: Node) => {
  if (!node.is_active) return '已禁用'
  if (node.is_banned) return '已封禁'
  if (node.status === 'online') return '在线'
  return '离线'
}

const getMetricColor = (value: number) => {
  if (value < 50) return '#18a058'
  if (value < 80) return '#f0a020'
  return '#d03050'
}

const getLoadColor = (value: number) => {
  if (value < 1) return '#18a058'
  if (value < 2) return '#f0a020'
  return '#d03050'
}

// 选择节点
const selectNode = async (node: Node) => {
  if (!isNodeAvailable(node)) {
    message.warning('该节点不可用')
    return
  }
  selectedNodeId.value = node.id
  selectedNode.value = node

  // 节点选择后，如果是TCP/UDP类型，自动获取可用端口
  await onNodeChange()
}

// 下一步到配置
const nextToConfig = () => {
  if (!selectedNodeId.value || !selectedNode.value) {
    message.warning('请选择一个节点')
    return
  }
  currentStep.value = 2
  message.success(`已选择节点：${selectedNode.value.name}`)
}

// 类型改变时的处理
const onTypeChange = async (type: string) => {
  // 清空类型特定的字段
  if (type === 'http' || type === 'https') {
    formData.value.remote_port = null
  } else {
    formData.value.custom_domain = ''
    formData.value.subdomain = ''
    formData.value.locations = ['/']
    formData.value.host_header_rewrite = ''

    // 如果是TCP/UDP类型且已选择节点，自动获取可用端口
    if ((type === 'tcp' || type === 'udp') && selectedNode.value) {
      await getAvailablePort()
    }
  }
}

// 节点选择变化时的处理
const onNodeChange = async () => {
  // 如果是TCP/UDP类型，自动获取可用端口
  if ((formData.value.type === 'tcp' || formData.value.type === 'udp') && selectedNode.value) {
    await getAvailablePort()
  }
}

// 获取预览URL
const getPreviewUrl = () => {
  if (!formData.value.subdomain || !selectedNode.value) return ''

  const protocol = formData.value.type === 'https' ? 'https' : 'http'
  const domain = formData.value.custom_domain || selectedNode.value.server_addr
  const subdomain = formData.value.subdomain

  if (formData.value.custom_domain) {
    return `${protocol}://${subdomain}.${domain}`
  } else {
    return `${protocol}://${subdomain}.${domain}`
  }
}

// 创建隧道
const createTunnel = async () => {
  try {
    console.log('🚀 开始创建隧道...')
    console.log('📝 表单数据:', formData.value)
    console.log('🖥️ 选中节点:', selectedNode.value)

    await formRef.value?.validate()

    creating.value = true

    // 构建隧道数据，处理字段映射
    const tunnelData: any = {
      name: formData.value.name,
      type: formData.value.type,
      local_ip: formData.value.local_ip,
      local_port: formData.value.local_port,
      node_id: selectedNode.value?.id,
      use_encryption: formData.value.use_encryption,
      use_compression: formData.value.use_compression,
      remark: formData.value.remark
    }

    // 根据隧道类型添加特定字段
    if (formData.value.type === 'tcp' || formData.value.type === 'udp') {
      // TCP/UDP隧道必须有远程端口
      if (!formData.value.remote_port) {
        throw new Error('TCP/UDP隧道必须指定远程端口')
      }
      tunnelData.remote_port = formData.value.remote_port
    } else if (formData.value.type === 'http' || formData.value.type === 'https') {
      // HTTP/HTTPS隧道的域名相关字段
      if (formData.value.custom_domain) {
        tunnelData.custom_domains = formData.value.custom_domain
      }
      if (formData.value.subdomain) {
        tunnelData.subdomain = formData.value.subdomain
      }
      if (formData.value.locations && formData.value.locations.length > 0) {
        tunnelData.locations = formData.value.locations
      }
      if (formData.value.host_header_rewrite) {
        tunnelData.host_header_rewrite = formData.value.host_header_rewrite
      }
    }

    console.log('📤 发送的隧道数据:', tunnelData)
    console.log('🔗 请求URL: /api/v1/tunnels')
    console.log('🔑 Token:', localStorage.getItem('token') ? '已设置' : '未设置')

    // 调用创建隧道API
    const response = await fetch('/api/v1/tunnels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(tunnelData)
    })

    console.log('📥 响应状态:', response.status, response.statusText)
    console.log('📥 响应头:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('📥 响应数据:', data)

    if (response.ok && (data.code === 200 || data.code === 201)) {
      console.log('✅ 隧道创建成功')
      message.success('隧道创建成功')
      currentStep.value = 3
    } else {
      console.error('❌ 隧道创建失败:', data)
      throw new Error(data.message || '创建隧道失败')
    }
  } catch (error: any) {
    console.error('❌ 创建隧道异常:', error)
    console.error('❌ 错误堆栈:', error.stack)
    message.error(error.message || '创建隧道失败')
  } finally {
    creating.value = false
  }
}

// 获取节点列表
const fetchNodes = async () => {
  try {
    loading.value = true

    // 从API获取节点数据
    const response = await fetch('/api/v1/nodes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.code === 200) {
      // 只显示活跃且未被封禁的节点
      nodes.value = data.data.filter((node: Node) =>
        node.is_active && !node.is_banned
      )

      if (nodes.value.length === 0) {
        message.warning('暂无可用节点，请联系管理员')
      }
    } else {
      throw new Error(data.message || '获取节点列表失败')
    }
  } catch (error: any) {
    console.error('获取节点列表失败:', error)
    message.error('获取节点列表失败')

    // 如果API失败，提供一些模拟数据作为fallback
    nodes.value = []
  } finally {
    loading.value = false
  }
}

// 页面导航
const goBack = () => {
  router.push('/dashboard/tunnels')
}

const createAnother = () => {
  currentStep.value = 1
  selectedNodeId.value = null
  selectedNode.value = null
  formData.value = {
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
    remark: ''
  }
}

const goToTunnels = () => {
  router.push('/dashboard/tunnels')
}

// 页面初始化
onMounted(async () => {
  await fetchNodes()
  // 页面加载时生成随机隧道名称
  try {
    const randomName = await generateRandomTunnelName()
    formData.value.name = randomName
  } catch (error) {
    console.error('初始化随机隧道名称失败:', error)
  }
})
</script>

<style scoped>
.tunnel-create {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 4px 0;
  color: #333;
}

.page-description {
  color: #666;
  margin: 0;
}

.steps-container {
  margin-bottom: 32px;
  padding: 0 24px;
}

.step-content {
  min-height: 400px;
}

/* 节点选择样式 */
.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.node-card {
  position: relative;
  border: 2px solid #e0e0e6;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.node-card:hover:not(.disabled) {
  border-color: #18a058;
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.15);
}

.node-card.selected {
  border-color: #18a058;
  background: #f6ffed;
}

.node-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.node-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.node-header {
  margin-bottom: 12px;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.node-id {
  font-size: 12px;
  color: #666;
}

.node-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 500;
}

.node-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.metric-value {
  width: 45px;
  font-size: 12px;
  color: #333;
  text-align: right;
}

.selected-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
}

.offline-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.offline-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

/* 隧道配置样式 */
.config-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e6;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e6;
}

.tcp-udp-config,
.http-config {
  margin-top: 16px;
}

.form-tip {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.form-tip.recommended {
  color: #18a058;
  font-weight: 500;
}

.form-tip.preview-url {
  color: #2080f0;
  font-weight: 500;
}

/* 底部操作按钮 */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 成功页面 */
.success-step {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
