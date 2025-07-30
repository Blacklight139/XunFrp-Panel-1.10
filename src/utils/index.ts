// 格式化字节大小
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 格式化带宽
export function formatBandwidth(mbps: number): string {
  if (mbps === 0) return '无限制'
  if (mbps < 1024) return `${mbps} Mbps`
  return `${(mbps / 1024).toFixed(1)} Gbps`
}

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果是今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // 如果是今年
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // 其他情况显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 格式化相对时间
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDateTime(dateString)
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 首先尝试现代API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      console.log('使用Clipboard API复制成功')
      return true
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const result = document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('使用execCommand复制:', result ? '成功' : '失败')
        return result
      } catch (execError) {
        document.body.removeChild(textArea)
        console.error('execCommand复制失败:', execError)
        return false
      }
    }
  } catch (error) {
    console.error('复制失败:', error)

    // 最后的降级方案：提示用户手动复制
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '50%'
      textArea.style.top = '50%'
      textArea.style.transform = 'translate(-50%, -50%)'
      textArea.style.zIndex = '9999'
      textArea.style.background = 'white'
      textArea.style.border = '2px solid #ccc'
      textArea.style.padding = '10px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      // 3秒后自动移除
      setTimeout(() => {
        if (document.body.contains(textArea)) {
          document.body.removeChild(textArea)
        }
      }, 3000)

      return false // 返回false，让调用者知道需要手动复制
    } catch (fallbackError) {
      console.error('降级方案也失败了:', fallbackError)
      return false
    }
  }
}

// 下载文件
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 生成随机字符串
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证用户名格式
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

// 验证密码强度
export function validatePassword(password: string): {
  isValid: boolean
  message: string
} {
  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少6位' }
  }
  
  if (password.length > 50) {
    return { isValid: false, message: '密码长度不能超过50位' }
  }
  
  return { isValid: true, message: '' }
}

// 验证身份证号码
export function isValidIDCard(idCard: string): boolean {
  if (idCard.length !== 18) return false
  
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return idCardRegex.test(idCard)
}

// 获取用户组显示名称
export function getUserGroupName(group: string): string {
  const groupNames: Record<string, string> = {
    unverified: '未实名认证',
    verified: '正式用户',
    sponsor: '赞助者',
    admin: '管理员',
  }
  return groupNames[group] || group
}

// 获取节点状态显示名称
export function getNodeStatusName(status: string): string {
  const statusNames: Record<string, string> = {
    online: '在线',
    offline: '离线',
    banned: '已封禁',
    disabled: '已停用',
  }
  return statusNames[status] || status
}

// 获取隧道状态显示名称
export function getTunnelStatusName(status: string): string {
  const statusNames: Record<string, string> = {
    online: '在线',
    offline: '离线',
    banned: '已封禁',
    error: '错误',
  }
  return statusNames[status] || status
}

// 获取隧道类型显示名称
export function getTunnelTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    tcp: 'TCP',
    udp: 'UDP',
    http: 'HTTP',
    https: 'HTTPS',
  }
  return typeNames[type] || type.toUpperCase()
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}
