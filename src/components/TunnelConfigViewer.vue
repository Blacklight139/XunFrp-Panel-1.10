<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="隧道配置文件"
    size="large"
    :mask-closable="false"
    style="width: 800px"
  >
    <template #header-extra>
      <n-space>
        <n-button size="small" @click="copyConfig">
          <template #icon>
            <n-icon :component="Copy" />
          </template>
          复制
        </n-button>
        <n-button size="small" @click="downloadConfig">
          <template #icon>
            <n-icon :component="Download" />
          </template>
          下载
        </n-button>
      </n-space>
    </template>

    <div class="config-viewer">
      <!-- 配置文件内容 -->
      <div class="config-content">
        <n-code
          :code="configContent"
          language="ini"
          show-line-numbers
          word-wrap
        />
      </div>

      <!-- 使用说明 -->
      <n-divider title-placement="left">
        <span style="font-size: 14px;">使用说明</span>
      </n-divider>

      <div class="usage-instructions">
        <n-alert type="info" title="配置文件使用方法">
          <ol>
            <li>将上述配置内容保存为 <code>frpc.ini</code> 文件</li>
            <li>下载对应平台的 FRP 客户端程序</li>
            <li>将配置文件与客户端程序放在同一目录</li>
            <li>运行命令: <code>./frpc -c frpc.ini</code></li>
            <li>看到 "login to server success" 表示连接成功</li>
          </ol>
        </n-alert>

        <n-space vertical style="margin-top: 16px;">
          <n-alert type="warning" title="注意事项">
            <ul>
              <li>请妥善保管您的访问密钥，不要泄露给他人</li>
              <li>确保本地服务正在运行并监听指定端口</li>
              <li>如果连接失败，请检查网络连接和防火墙设置</li>
            </ul>
          </n-alert>

          <n-card title="下载客户端" size="small">
            <n-space>
              <n-button
                size="small"
                tag="a"
                :href="getDownloadUrl('windows')"
                target="_blank"
              >
                Windows 客户端
              </n-button>
              <n-button
                size="small"
                tag="a"
                :href="getDownloadUrl('linux')"
                target="_blank"
              >
                Linux 客户端
              </n-button>
              <n-button
                size="small"
                tag="a"
                :href="getDownloadUrl('macos')"
                target="_blank"
              >
                macOS 客户端
              </n-button>
            </n-space>
          </n-card>
        </n-space>
      </div>
    </div>

    <template #footer>
      <div style="display: flex; justify-content: flex-end;">
        <n-button @click="visible = false">
          关闭
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Download } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

interface Tunnel {
  id: number
  name: string
  type: string
  local_ip: string
  local_port: number
  remote_port?: number
  custom_domain?: string
  subdomain?: string
  locations?: string[]
  host_header_rewrite?: string
  use_encryption: boolean
  use_compression: boolean
  node: {
    name: string
    server_addr: string
    server_port: number
  }
  user: {
    access_key: string
  }
}

const props = defineProps<{
  tunnel: Tunnel | null
}>()

const message = useMessage()
const visible = ref(false)

// 生成配置文件内容
const configContent = computed(() => {
  if (!props.tunnel) return ''

  const tunnel = props.tunnel
  const sections = []

  // 通用配置段
  sections.push(`[common]
server_addr = ${tunnel.node.server_addr}
server_port = ${tunnel.node.server_port}
user = ${tunnel.user.access_key}
token = ${tunnel.user.access_key}
login_fail_exit = false
protocol = tcp`)

  // 隧道配置段
  const tunnelSection = [`[${tunnel.name}]`]
  tunnelSection.push(`type = ${tunnel.type}`)
  tunnelSection.push(`local_ip = ${tunnel.local_ip}`)
  tunnelSection.push(`local_port = ${tunnel.local_port}`)

  // 根据隧道类型添加特定配置
  if (tunnel.type === 'tcp' || tunnel.type === 'udp') {
    if (tunnel.remote_port) {
      tunnelSection.push(`remote_port = ${tunnel.remote_port}`)
    }
  } else if (tunnel.type === 'http' || tunnel.type === 'https') {
    if (tunnel.custom_domain) {
      tunnelSection.push(`custom_domains = ${tunnel.custom_domain}`)
    }
    if (tunnel.subdomain) {
      tunnelSection.push(`subdomain = ${tunnel.subdomain}`)
    }
    if (tunnel.locations && tunnel.locations.length > 0) {
      tunnelSection.push(`locations = ${tunnel.locations.join(',')}`)
    }
    if (tunnel.host_header_rewrite) {
      tunnelSection.push(`host_header_rewrite = ${tunnel.host_header_rewrite}`)
    }
  }

  // 加密和压缩
  if (tunnel.use_encryption) {
    tunnelSection.push(`use_encryption = true`)
  }
  if (tunnel.use_compression) {
    tunnelSection.push(`use_compression = true`)
  }

  sections.push(tunnelSection.join('\n'))

  return sections.join('\n\n')
})

// 复制配置
const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(configContent.value)
    message.success('配置文件已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败，请手动选择复制')
  }
}

// 下载配置
const downloadConfig = () => {
  if (!props.tunnel) return

  const blob = new Blob([configContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `frpc_${props.tunnel.name}.ini`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  message.success('配置文件下载成功')
}

// 获取下载链接
const getDownloadUrl = (platform: string) => {
  // 这里应该返回实际的下载链接
  return `/downloads?platform=${platform}`
}

// 显示模态框
const show = () => {
  visible.value = true
}

// 隐藏模态框
const hide = () => {
  visible.value = false
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.config-viewer {
  max-height: 70vh;
  overflow-y: auto;
}

.config-content {
  margin-bottom: 24px;
}

.usage-instructions {
  font-size: 14px;
}

.usage-instructions ol {
  margin: 8px 0;
  padding-left: 20px;
}

.usage-instructions ul {
  margin: 8px 0;
  padding-left: 20px;
}

.usage-instructions li {
  margin: 4px 0;
  line-height: 1.5;
}

.usage-instructions code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}
</style>
