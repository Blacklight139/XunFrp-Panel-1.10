<template>
  <div class="tunnel-list">
    <div class="container">
      <div class="page-header" data-aos="fade-down" data-aos-duration="800">
        <h1>隧道管理</h1>
        <div class="header-actions">
          <n-button type="primary" @click="$router.push('/dashboard/tunnels/create')">
            创建隧道
          </n-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="tunnels.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">🚇</div>
        <h3>你还没有隧道</h3>
        <p>快去创建一个吧！</p>
        <n-button type="primary" @click="$router.push('/dashboard/tunnels/create')">
          创建隧道
        </n-button>
      </div>

      <!-- 隧道列表 -->
      <div v-else class="tunnel-grid">
        <n-card
          v-for="(tunnel, index) in tunnels"
          :key="tunnel.id"
          class="tunnel-card"
          :class="{ disabled: tunnel.is_banned }"
          data-aos="fade-up"
          :data-aos-delay="index * 100"
        >
          <template #header>
            <div class="tunnel-header">
              <div class="tunnel-info">
                <h3>{{ tunnel.name }}</h3>
                <n-tag :type="getTunnelStatusType(tunnel.status)" size="small">
                  {{ getTunnelStatusName(tunnel.status) }}
                </n-tag>
              </div>
              <div class="tunnel-actions">
                <n-dropdown :options="getTunnelMenuOptions(tunnel)" @select="(key) => handleTunnelAction(key, tunnel)">
                  <n-button text>
                    <template #icon>
                      <n-icon><EllipsisHorizontal /></n-icon>
                    </template>
                  </n-button>
                </n-dropdown>
              </div>
            </div>
          </template>

          <div class="tunnel-details">
            <!-- 节点信息 -->
            <div class="detail-row node-info">
              <span class="label">使用节点:</span>
              <div class="node-status">
                <span class="node-name">{{ tunnel.node?.name || '未知节点' }}</span>
                <n-tag
                  :type="getNodeStatusType(tunnel.node_status)"
                  size="small"
                  style="margin-left: 8px;"
                >
                  {{ getNodeStatusText(tunnel.node_status) }}
                </n-tag>
              </div>
            </div>

            <!-- 隧道在线状态 -->
            <div class="detail-row">
              <span class="label">隧道状态:</span>
              <div class="tunnel-status">
                <n-tag :type="getTunnelStatusType(tunnel.status)" size="small">
                  {{ getTunnelStatusName(tunnel.status) }}
                </n-tag>
                <span v-if="tunnel.node_status !== 'online'" class="status-note">
                  (节点离线，隧道不可用)
                </span>
              </div>
            </div>

            <div class="detail-row">
              <span class="label">协议类型:</span>
              <n-tag size="small">{{ tunnel.type.toUpperCase() }}</n-tag>
            </div>
            <div class="detail-row">
              <span class="label">本地地址:</span>
              <span class="value">{{ tunnel.local_ip }}:{{ tunnel.local_port }}</span>
            </div>
            <div class="detail-row" v-if="tunnel.remote_port">
              <span class="label">远程端口:</span>
              <span class="value">{{ tunnel.remote_port }}</span>
            </div>
            <div class="detail-row" v-if="tunnel.custom_domains">
              <span class="label">自定义域名:</span>
              <span class="value">{{ tunnel.custom_domains }}</span>
            </div>
            <div class="detail-row">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDateTime(tunnel.created_at) }}</span>
            </div>
            <div class="detail-row" v-if="tunnel.last_connected">
              <span class="label">最后连接:</span>
              <span class="value">{{ formatDateTime(tunnel.last_connected) }}</span>
            </div>
          </div>

          <template #footer>
            <div class="tunnel-stats">
              <div class="stat-item">
                <span class="stat-label">入站流量</span>
                <span class="stat-value">{{ formatBytes(tunnel.inbound_traffic) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">出站流量</span>
                <span class="stat-value">{{ formatBytes(tunnel.outbound_traffic) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">连接数</span>
                <span class="stat-value">{{ tunnel.current_connections }}</span>
              </div>
            </div>

            <!-- 隧道操作按钮 -->
            <div class="tunnel-actions-bar">
              <!-- 节点离线时的提示 -->
              <div v-if="tunnel.node_status !== 'online'" class="offline-notice">
                <n-alert type="warning" size="small" :show-icon="false">
                  <template #header>
                    <span>⚠️ 节点离线</span>
                  </template>
                  节点 "{{ tunnel.node?.name }}" 当前离线，隧道无法使用。只能进行编辑和删除操作。
                </n-alert>
              </div>

              <n-space size="small">
                <!-- 配置文件相关操作 - 节点离线时禁用 -->
                <n-button
                  size="small"
                  type="primary"
                  ghost
                  :disabled="tunnel.node_status !== 'online'"
                  @click="handleTunnelAction('download-config', tunnel)"
                >
                  <template #icon>
                    <span>⬇️</span>
                  </template>
                  下载配置文件
                </n-button>

                <n-button
                  size="small"
                  type="info"
                  ghost
                  :disabled="tunnel.node_status !== 'online'"
                  @click="handleTunnelAction('config', tunnel)"
                >
                  <template #icon>
                    <span>📄</span>
                  </template>
                  查看配置文件
                </n-button>

                <!-- 编辑和删除操作 - 始终可用 -->
                <n-button
                  size="small"
                  type="warning"
                  ghost
                  @click="handleTunnelAction('edit', tunnel)"
                >
                  <template #icon>
                    <n-icon><Document /></n-icon>
                  </template>
                  编辑隧道
                </n-button>

                <n-button
                  size="small"
                  type="error"
                  ghost
                  @click="handleTunnelAction('delete', tunnel)"
                >
                  <template #icon>
                    <n-icon>🗑️</n-icon>
                  </template>
                  删除隧道
                </n-button>
              </n-space>
            </div>
          </template>
        </n-card>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
        <p>加载中...</p>
      </div>
    </div>

    <!-- 配置文件模态框 -->
    <n-modal v-model:show="configModalVisible" preset="card" title="📄 隧道配置文件" style="width: 700px">
      <div class="config-modal-content">
        <div class="config-info">
          <n-alert type="info" :show-icon="false" style="margin-bottom: 16px;">
            <template #header>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📋 配置文件使用说明</span>
              </div>
            </template>
            <div style="margin-bottom: 12px;">
              <p><strong>🎯 操作步骤：</strong></p>
              <ol style="margin: 8px 0; padding-left: 20px;">
                <li>复制下方配置内容或点击下载按钮</li>
                <li>保存为 <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">frpc.ini</code> 文件</li>
                <li>使用命令 <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">frpc -c frpc.ini</code> 启动客户端</li>
              </ol>
            </div>
            <div style="margin-top: 12px;">
              <n-tag type="success" size="small">🚇 {{ selectedTunnel?.name }}</n-tag>
              <n-tag type="info" size="small" style="margin-left: 8px;">🔗 {{ selectedTunnel?.type?.toUpperCase() }}</n-tag>
              <n-tag :type="getTunnelStatusType(selectedTunnel?.status || 'offline')" size="small" style="margin-left: 8px;">
                📊 {{ getTunnelStatusName(selectedTunnel?.status || 'offline') }}
              </n-tag>
            </div>
          </n-alert>
        </div>

        <n-code
          :code="configContent"
          language="ini"
          :hljs="true"
          style="max-height: 400px; overflow-y: auto;"
          word-wrap
        />

        <n-alert type="info" style="margin-top: 12px;" closable>
          <template #icon>
            <span>💡</span>
          </template>
          提示：如果复制按钮无效，请手动选择上方文本内容进行复制（Ctrl+A 全选，Ctrl+C 复制）
        </n-alert>

        <div class="config-actions" style="margin-top: 16px;">
          <n-space>
            <n-button @click="copyConfig" type="primary" ghost size="medium">
              <template #icon>
                <span>📋</span>
              </template>
              复制配置
            </n-button>
            <n-button @click="downloadConfig" type="info" ghost size="medium">
              <template #icon>
                <span>⬇️</span>
              </template>
              下载配置文件
            </n-button>
          </n-space>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <n-button type="primary" @click="configModalVisible = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 删除确认模态框 -->
    <n-modal v-model:show="deleteModalVisible" preset="dialog" title="⚠️ 确认删除隧道">
      <div class="delete-confirmation">
        <n-alert type="warning" :show-icon="false" style="margin-bottom: 16px;">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🚨 危险操作</span>
            </div>
          </template>
          <p>您即将删除隧道 <strong>"{{ selectedTunnel?.name }}"</strong></p>
          <p>此操作将会：</p>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>永久删除隧道配置</li>
            <li>停止所有相关连接</li>
            <li>清除流量统计数据</li>
          </ul>
          <p style="color: #d03050; font-weight: 600;">⚠️ 此操作不可撤销！</p>
        </n-alert>

        <div style="text-align: center; margin: 16px 0;">
          <p>请确认您真的要删除这个隧道吗？</p>
        </div>
      </div>
      <template #action>
        <n-button @click="deleteModalVisible = false" size="medium">
          <template #icon>
            <span>❌</span>
          </template>
          取消操作
        </n-button>
        <n-button type="error" @click="confirmDelete" :loading="deleting" size="medium">
          <template #icon>
            <span>🗑️</span>
          </template>
          确认删除
        </n-button>
      </template>
    </n-modal>

    <!-- 隧道配置文件查看器 -->
    <TunnelConfigViewer
      ref="configViewerRef"
      :tunnel="selectedTunnel"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { EllipsisHorizontal, Copy, Download, DocumentText, Document, Settings } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { ApiClient } from '@/utils/api'
import { formatDateTime, formatBytes, getTunnelStatusName, copyToClipboard, downloadFile } from '@/utils'
import TunnelConfigViewer from '@/components/tunnel/TunnelConfigViewer.vue'
import type { Tunnel, Node } from '@/types'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const deleting = ref(false)
const configModalVisible = ref(false)
const deleteModalVisible = ref(false)

const tunnels = ref<Tunnel[]>([])
const nodes = ref<Node[]>([])
const selectedTunnel = ref<Tunnel | null>(null)
const configViewerRef = ref()

const getTunnelStatusType = (status: string) => {
  const statusTypes: Record<string, string> = {
    online: 'success',
    offline: 'default',
    error: 'error',
  }
  return statusTypes[status] || 'default'
}

// 节点状态相关函数
const getNodeStatusType = (status: string) => {
  const statusTypes: Record<string, string> = {
    online: 'success',
    offline: 'error',
    banned: 'warning',
    disabled: 'default',
  }
  return statusTypes[status] || 'default'
}

const getNodeStatusText = (status: string) => {
  const statusTexts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    banned: '已封禁',
    disabled: '已禁用',
  }
  return statusTexts[status] || '未知'
}

const getTunnelMenuOptions = (tunnel: Tunnel) => {
  const options = [
    {
      label: '查看配置文件',
      key: 'config',
      icon: () => h(DocumentText),
    },
    {
      label: '获取配置文件',
      key: 'download-config',
      icon: () => h(Download),
    },
    {
      label: '编辑',
      key: 'edit',
      icon: () => h(Document),
    },
  ]

  if (!tunnel.is_banned) {
    options.push({
      label: tunnel.status === 'online' ? '下线' : '上线',
      key: 'toggle',
    })
  }

  options.push(
    {
      type: 'divider',
    },
    {
      label: '删除',
      key: 'delete',
      props: {
        style: 'color: #d03050'
      }
    }
  )

  return options
}

const configContent = computed(() => {
  if (!selectedTunnel.value) return ''
  
  const tunnel = selectedTunnel.value
  const node = nodes.value.find(n => n.id === tunnel.node_id)
  
  if (!node) return ''
  
  let config = `[common]
server_addr = ${node.server_addr}
server_port = ${node.server_port}
user = "${authStore.user?.access_key}"
token = "xunfrptoken"

[${tunnel.name}]
type = "${tunnel.type}"
local_ip = ${tunnel.local_ip}
local_port = ${tunnel.local_port}`

  if (tunnel.type === 'tcp' || tunnel.type === 'udp') {
    config += `
remote_port = ${tunnel.remote_port}`
  }
  
  if (tunnel.type === 'http' || tunnel.type === 'https') {
    config += `
custom_domains = ${tunnel.custom_domains}`
  }
  
  if (tunnel.type === 'https') {
    config += `
plugin = https2http
plugin_local_addr = ${tunnel.plugin_local_addr}
plugin_crt_path = ${tunnel.plugin_crt_path}
plugin_key_path = ${tunnel.plugin_key_path}`
  }
  
  config += `
use_encryption = ${tunnel.use_encryption ? '1' : '0'}
use_compression = ${tunnel.use_compression ? '1' : '0'}`

  return config
})

// 配置模板内容
const templateContent = computed(() => {
  if (!selectedTunnel.value) return ''

  const tunnelType = selectedTunnel.value.type.toLowerCase()

  switch (tunnelType) {
    case 'tcp':
      return `[common]
server_addr = <服务器IP地址>
server_port = <服务器端口>
user = "<用户访问密钥>"
token = "xunfrptoken"

[<自定义服务名称>]
type = "tcp"
local_ip = <本地服务IP>
local_port = <本地服务端口>
remote_port = <远程映射端口>
use_encryption = true
use_compression = true`

    case 'udp':
      return `[common]
server_addr = <服务器地址/域名>
server_port = <服务器端口>
user = "<用户访问密钥>"
token = "xunfrptoken"

[<自定义服务名称>]
type = "udp"
local_ip = <本地服务IP>
local_port = <本地服务端口>
remote_port = <远程映射端口>
use_encryption = true
use_compression = true`

    case 'http':
      return `[common]
server_addr = <服务器IP/域名>      # FRP 服务端地址
server_port = <服务器端口>         # FRP 服务端端口
user = "<用户访问密钥>"                 # 认证用户（可选）
token = "xunfrptoken"              # 安全令牌（建议设置）

[<服务名称>]                      # 自定义服务标识（如web、app等）
type = "http"                    # 固定为http协议
local_ip = <内网服务IP>           # 本地服务地址（如127.0.0.1）
local_port = <内网服务端口>        # 本地服务端口
custom_domains = <域名>           # 绑定的访问域名
use_encryption = 1                # 启用加密（1/0）
use_compression = 1               # 启用压缩（1/0）`

    case 'https':
      return `[common]
server_addr = <服务器IP/域名>
server_port = <服务器端口>
user = "<用户访问密钥>"
token = "xunfrptoken"

[<服务名称>]
type = "https"
custom_domains = <你的域名>
plugin = https2http
plugin_local_addr = <本地IP或端口>  # 格式：IP:端口 或 端口
plugin_crt_path = <SSL证书路径>
plugin_key_path = <SSL私钥路径>
use_encryption = 1  # 建议开启
use_compression = 1  # 建议开启`

    default:
      return '不支持的隧道类型'
  }
})

const handleTunnelAction = (key: string, tunnel: Tunnel) => {
  selectedTunnel.value = tunnel

  // 检查节点状态，某些操作需要节点在线
  const nodeOfflineActions = ['config', 'download-config']
  if (nodeOfflineActions.includes(key) && tunnel.node_status !== 'online') {
    message.error(`节点 "${tunnel.node?.name}" 当前离线，无法执行此操作`)
    return
  }

  switch (key) {
    case 'config':
      message.info('📄 正在为您显示隧道配置文件...')
      selectedTunnel.value = tunnel
      configViewerRef.value?.show()
      break
    case 'download-config':
      message.info('⬇️ 正在为您准备配置文件下载...')
      downloadTunnelConfig(tunnel)
      break
    case 'edit':
      message.info('✏️ 正在跳转到编辑页面...')
      router.push(`/dashboard/tunnels/${tunnel.id}/edit`)
      break
    case 'toggle':
      toggleTunnelStatus(tunnel)
      break
    case 'delete':
      message.warning('⚠️ 请确认您要删除此隧道')
      deleteModalVisible.value = true
      break
  }
}

const showConfig = async () => {
  if (!selectedTunnel.value) return

  try {
    const response = await ApiClient.get(`/tunnels/${selectedTunnel.value.id}/config`)
    console.log('配置文件响应:', response)

    // 修复：正确访问配置文件内容
    let config = ''
    if (response.data && response.data.data && response.data.data.config) {
      // 标准API响应格式: { code: 200, data: { config: "..." } }
      config = response.data.data.config
    } else if (response.data && response.data.config) {
      // 简化格式: { config: "..." }
      config = response.data.config
    } else if (response.config) {
      // 直接格式: { config: "..." }
      config = response.config
    } else if (response.data && typeof response.data === 'string') {
      // 字符串格式
      config = response.data
    } else {
      console.error('未知的响应格式:', response)
      throw new Error('配置文件内容为空或格式错误')
    }

    if (!config || config.trim() === '') {
      throw new Error('配置文件内容为空')
    }

    configContent.value = config
    configModalVisible.value = true
    message.success('配置文件加载成功')
  } catch (error: any) {
    console.error('获取配置文件失败:', error)
    message.error(error.message || '获取配置文件失败')
  }
}

const copyConfig = async () => {
  if (!configContent.value) {
    message.error('没有配置内容可复制')
    return
  }

  try {
    const success = await copyToClipboard(configContent.value)
    if (success) {
      message.success('配置文件已复制到剪贴板')
    } else {
      message.warning('自动复制失败，请手动选择文本复制')
    }
  } catch (error) {
    console.error('复制配置失败:', error)
    message.error('复制失败，请手动选择文本复制')
  }
}

// 下载配置文件
const downloadConfig = () => {
  if (!selectedTunnel.value) return

  const filename = `frpc_${selectedTunnel.value.name}.ini`
  const blob = new Blob([configContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
  message.success('配置文件下载成功')
}



// 下载隧道配置文件
const downloadTunnelConfig = async (tunnel: Tunnel) => {
  try {
    const response = await ApiClient.get(`/tunnels/${tunnel.id}/config`)
    console.log('下载配置文件响应:', response)

    // 修复：正确访问配置文件内容
    let config = ''
    if (response.data && response.data.data && response.data.data.config) {
      config = response.data.data.config
    } else if (response.data && response.data.config) {
      config = response.data.config
    } else if (response.config) {
      config = response.config
    } else if (response.data && typeof response.data === 'string') {
      config = response.data
    } else {
      throw new Error('配置文件内容为空或格式错误')
    }

    if (!config || config.trim() === '') {
      throw new Error('配置文件内容为空')
    }

    const filename = `frpc_${tunnel.name}.ini`
    const blob = new Blob([config], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    downloadFile(url, filename)
    URL.revokeObjectURL(url)
    message.success('配置文件下载成功')
  } catch (error: any) {
    console.error('获取配置文件失败:', error)
    message.error(error.message || '获取配置文件失败')
  }
}

const toggleTunnelStatus = async (tunnel: Tunnel) => {
  try {
    // 这里应该调用API来切换隧道状态
    // 由于需要与frpc客户端通信，暂时只是模拟
    message.info('隧道状态切换功能需要与frpc客户端通信，暂未实现')
  } catch (error: any) {
    console.error('切换隧道状态失败:', error)
    message.error(error.message || '操作失败')
  }
}

const confirmDelete = async () => {
  if (!selectedTunnel.value) return
  
  try {
    deleting.value = true
    await ApiClient.delete(`/tunnels/${selectedTunnel.value.id}`)
    
    message.success('隧道删除成功')
    deleteModalVisible.value = false
    await fetchTunnels()
  } catch (error: any) {
    console.error('删除隧道失败:', error)
    message.error(error.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

const fetchTunnels = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/tunnels')

    // 后端已经返回了包含节点状态的隧道信息
    const tunnelData = response.data?.data || response.data || response
    tunnels.value = tunnelData

    console.log('隧道列表（含节点状态）:', tunnels.value)
  } catch (error: any) {
    console.error('获取隧道列表失败:', error)
    message.error('获取隧道列表失败')
  } finally {
    loading.value = false
  }
}

const fetchNodes = async () => {
  try {
    const data = await ApiClient.get<Node[]>('/nodes')
    nodes.value = data
  } catch (error) {
    console.error('获取节点列表失败:', error)
  }
}

onMounted(() => {
  fetchTunnels()
  fetchNodes()
})
</script>

<style scoped>
.tunnel-list {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 2rem;
}

.tunnel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.tunnel-card {
  transition: all 0.3s ease;
}

.tunnel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tunnel-card.disabled {
  opacity: 0.6;
}

.tunnel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tunnel-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.tunnel-details {
  margin: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #64748b;
  font-size: 0.875rem;
}

.value {
  color: #1e293b;
  font-weight: 500;
}

.tunnel-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-weight: 600;
  color: #1e293b;
}

.tunnel-actions-bar {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.tunnel-actions-bar .n-button {
  transition: all 0.3s ease;
}

.tunnel-actions-bar .n-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state p {
  margin-top: 1rem;
  color: #64748b;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .tunnel-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .tunnel-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

/* 节点状态相关样式 */
.node-info {
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.node-status {
  display: flex;
  align-items: center;
}

.node-name {
  font-weight: 500;
  color: #374151;
}

.tunnel-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-note {
  font-size: 12px;
  color: #ef4444;
  font-style: italic;
}

.offline-notice {
  margin-bottom: 12px;
}
</style>
