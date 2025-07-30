<template>
  <div class="downloads">
    <div class="container">
      <div class="page-header">
        <h1>客户端下载</h1>
        <p>选择适合您设备的客户端版本</p>
      </div>

      <!-- 系统公告 -->
      <SystemAnnouncement position="downloads" />

      <div class="download-sections">
        <!-- Windows 平台 -->
        <n-card title="Windows 平台" class="platform-card">
          <div class="platform-description">
            <p>适用于 Windows 操作系统的 FRP 客户端</p>
          </div>
          <div class="download-list">
            <div class="download-item" v-for="item in windowsDownloads" :key="item.arch">
              <div class="download-info">
                <h4>{{ item.name }}</h4>
                <p class="arch-description">{{ item.description }}</p>
                <div class="download-meta">
                  <n-tag size="small">{{ item.arch }}</n-tag>
                  <span class="file-size">{{ item.size }}</span>
                </div>
              </div>
              <div class="download-actions">
                <n-button type="primary" @click="downloadFile(item)">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  安装脚本
                </n-button>
                <n-button type="warning" @click="downloadUninstallScript(item)" style="margin-left: 8px;">
                  卸载脚本
                </n-button>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Linux 平台 -->
        <n-card title="Linux 平台" class="platform-card">
          <div class="platform-description">
            <p>适用于 Linux 操作系统的 FRP 客户端</p>
          </div>
          <div class="download-list">
            <div class="download-item" v-for="item in linuxDownloads" :key="item.arch">
              <div class="download-info">
                <h4>{{ item.name }}</h4>
                <p class="arch-description">{{ item.description }}</p>
                <div class="download-meta">
                  <n-tag size="small">{{ item.arch }}</n-tag>
                  <span class="file-size">{{ item.size }}</span>
                </div>
              </div>
              <div class="download-actions">
                <n-button type="primary" @click="downloadFile(item)">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  下载
                </n-button>
              </div>
            </div>
          </div>
        </n-card>

        <!-- macOS 平台 -->
        <n-card title="macOS 平台" class="platform-card">
          <div class="platform-description">
            <p>适用于 macOS 操作系统的 FRP 客户端</p>
          </div>
          <div class="download-list">
            <div class="download-item" v-for="item in macosDownloads" :key="item.arch">
              <div class="download-info">
                <h4>{{ item.name }}</h4>
                <p class="arch-description">{{ item.description }}</p>
                <div class="download-meta">
                  <n-tag size="small">{{ item.arch }}</n-tag>
                  <span class="file-size">{{ item.size }}</span>
                </div>
              </div>
              <div class="download-actions">
                <n-button type="primary" @click="downloadFile(item)">
                  <template #icon>
                    <n-icon><DownloadOutline /></n-icon>
                  </template>
                  下载
                </n-button>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 使用说明 -->
      <n-card title="使用说明" class="usage-card">
        <div class="usage-content">
          <h3>如何使用 FRP 客户端</h3>
          <ol>
            <li>下载适合您设备架构的客户端文件</li>
            <li>解压下载的文件到任意目录</li>
            <li>在用户面板创建隧道并获取配置文件</li>
            <li>将配置文件保存为 <code>frpc.ini</code></li>
            <li>运行命令: <code>./frpc -c frpc.ini</code></li>
          </ol>
          
          <h3>架构选择指南</h3>
          <div class="arch-guide">
            <div class="guide-section">
              <h4>Windows</h4>
              <ul>
                <li><strong>amd64</strong>: 64位 Windows (推荐)</li>
                <li><strong>386</strong>: 32位 Windows</li>
                <li><strong>arm64</strong>: Windows on ARM</li>
              </ul>
            </div>
            
            <div class="guide-section">
              <h4>Linux</h4>
              <ul>
                <li><strong>amd64</strong>: 64位 Linux (主流服务器)</li>
                <li><strong>386</strong>: 32位 Linux (旧设备)</li>
                <li><strong>arm</strong>: ARMv7 (树莓派 3B/4B)</li>
                <li><strong>arm64</strong>: ARMv8 (树莓派 4B/5, NAS)</li>
                <li><strong>mips</strong>: MIPS 路由器 (OpenWRT)</li>
              </ul>
            </div>
            
            <div class="guide-section">
              <h4>macOS</h4>
              <ul>
                <li><strong>amd64</strong>: Intel Mac</li>
                <li><strong>arm64</strong>: Apple Silicon (M1/M2)</li>
              </ul>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'
import SystemAnnouncement from '@/components/SystemAnnouncement.vue'

const message = useMessage()

interface DownloadItem {
  id?: string
  name: string
  version?: string
  arch: string
  description: string
  size: string
  url: string
  platform: string
  category?: string
  is_active?: boolean
  is_quick?: boolean
  sort_order?: number
}

// 状态管理
const loading = ref(false)
const windowsDownloads = ref<DownloadItem[]>([])
const linuxDownloads = ref<DownloadItem[]>([])
const macosDownloads = ref<DownloadItem[]>([])

// 获取下载列表 - 现在显示一键安装脚本
const fetchDownloads = async () => {
  try {
    loading.value = true

    // 直接设置一键安装脚本数据
    const installScripts = [
      {
        platform: 'windows',
        architecture: 'all',
        display_name: 'Windows 一键安装脚本',
        filename: 'install_windows.bat',
        size: 8192,
        install_url: '/api/v1/scripts/install_windows.bat',
        uninstall_url: '/api/v1/scripts/uninstall_windows.bat'
      },
      {
        platform: 'linux',
        architecture: 'all',
        display_name: 'Linux 一键安装脚本',
        filename: 'install_linux.sh',
        size: 12288,
        install_url: '/api/v1/scripts/install_linux.sh',
        uninstall_url: '/api/v1/scripts/uninstall_linux.sh'
      },
      {
        platform: 'darwin',
        architecture: 'all',
        display_name: 'macOS 一键安装脚本',
        filename: 'install_macos.sh',
        size: 10240,
        install_url: '/api/v1/scripts/install_macos.sh',
        uninstall_url: '/api/v1/scripts/uninstall_macos.sh'
      }
    ]

    // 按平台分组
    windowsDownloads.value = installScripts.filter((item: any) =>
      item.platform === 'windows'
    ).map((item: any) => ({
      id: `${item.platform}_install`,
      name: item.display_name,
      version: 'Latest',
      arch: 'all',
      description: '一键安装和配置 frpc 客户端，支持 Windows 服务',
      size: formatFileSize(item.size),
      url: item.install_url,
      uninstall_url: item.uninstall_url,
      platform: item.platform,
      filename: item.filename,
      is_active: true,
      is_quick: true,
      sort_order: 1
    }))

    linuxDownloads.value = installScripts.filter((item: any) =>
      item.platform === 'linux'
    ).map((item: any) => ({
      id: `${item.platform}_install`,
      name: item.display_name,
      version: 'Latest',
      arch: 'all',
      description: '一键安装和配置 frpc 客户端，支持 systemd 服务',
      size: formatFileSize(item.size),
      url: item.install_url,
      uninstall_url: item.uninstall_url,
      platform: item.platform,
      filename: item.filename,
      is_active: true,
      is_quick: true,
      sort_order: 1
    }))

    macosDownloads.value = installScripts.filter((item: any) =>
      item.platform === 'darwin'
    ).map((item: any) => ({
      id: `${item.platform}_install`,
      name: item.display_name,
      version: 'Latest',
      arch: 'all',
      description: '一键安装和配置 frpc 客户端，支持 LaunchAgent 服务',
      size: formatFileSize(item.size),
      url: item.install_url,
      uninstall_url: item.uninstall_url,
      platform: 'macos',
      filename: item.filename,
      is_active: true,
      is_quick: true,
      sort_order: 1
    }))
  } catch (error: any) {
    console.error('获取下载列表失败:', error)
    message.error('获取下载列表失败')

    // 如果API失败，使用默认数据
    windowsDownloads.value = [
      {
        name: 'FRP Client for Windows (64位)',
        arch: 'amd64',
        description: '64位 Windows（主流）',
        size: '8.5 MB',
        url: '/downloads/frpc_windows_amd64.zip',
        platform: 'windows'
      }
    ]
  } finally {
    loading.value = false
  }
}

// 辅助函数
const getArchDisplayName = (arch: string): string => {
  switch (arch) {
    case 'amd64':
      return '64位'
    case '386':
      return '32位'
    case 'arm64':
      return 'ARM64'
    case 'arm':
      return 'ARM'
    case 'mips':
      return 'MIPS'
    default:
      return arch.toUpperCase()
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getArchSortOrder = (arch: string): number => {
  switch (arch) {
    case 'amd64':
      return 1
    case '386':
      return 2
    case 'arm64':
      return 3
    case 'arm':
      return 4
    case 'mips':
      return 5
    default:
      return 99
  }
}

const downloadFile = async (item: DownloadItem) => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.filename || item.url.split('/').pop() || 'install_script'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success(`开始下载 ${item.name} 安装脚本`)
  } catch (error) {
    console.error('下载失败:', error)
    message.error('下载失败，请稍后重试')
  }
}

const downloadUninstallScript = async (item: any) => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = item.uninstall_url
    link.download = item.uninstall_url.split('/').pop() || 'uninstall_script'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success(`开始下载 ${item.name} 卸载脚本`)
  } catch (error) {
    console.error('下载失败:', error)
    message.error('下载失败，请稍后重试')
  }
}

// 页面加载时获取下载列表
onMounted(() => {
  fetchDownloads()
})

const fetchDownloadLinks = async () => {
  try {
    // 从后端获取实际的下载链接
    const links = await ApiClient.get('/downloads')
    // 更新下载链接
    console.log('下载链接:', links)
  } catch (error) {
    console.error('获取下载链接失败:', error)
  }
}

onMounted(() => {
  fetchDownloadLinks()
})
</script>

<style scoped>
.downloads {
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
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.download-sections {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.platform-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.platform-description {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.platform-description p {
  color: #64748b;
  margin: 0;
}

.download-list {
  display: grid;
  gap: 1rem;
}

.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.download-item:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.download-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1rem;
}

.arch-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.download-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-size {
  color: #64748b;
  font-size: 0.875rem;
}

.usage-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.usage-content h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.usage-content ol {
  margin-bottom: 2rem;
  padding-left: 1.5rem;
}

.usage-content li {
  margin-bottom: 0.5rem;
  color: #374151;
}

.usage-content code {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.arch-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.guide-section h4 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.guide-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.guide-section li {
  margin-bottom: 0.25rem;
  color: #374151;
  font-size: 0.875rem;
}

.guide-section strong {
  color: #2563eb;
}

@media (max-width: 768px) {
  .download-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .download-actions {
    align-self: stretch;
  }
  
  .arch-guide {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
