import { ApiClient } from '@/utils/api'

export interface NodeStatus {
  online: boolean
  dashboard: boolean
  response_time: number
  error: string
  last_check: number
}

export interface NodeStatusInfo {
  id: number
  name: string
  status: NodeStatus
}

export class NodeStatusService {
  private static instance: NodeStatusService
  private statusCache: Map<number, NodeStatus> = new Map()
  private listeners: Map<string, (statuses: NodeStatusInfo[]) => void> = new Map()
  private intervalId: number | null = null
  private isMonitoring = false

  static getInstance(): NodeStatusService {
    if (!NodeStatusService.instance) {
      NodeStatusService.instance = new NodeStatusService()
    }
    return NodeStatusService.instance
  }

  // 开始监控所有节点状态
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.updateAllNodesStatus()

    this.intervalId = window.setInterval(() => {
      this.updateAllNodesStatus()
    }, intervalMs)
  }

  // 停止监控
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isMonitoring = false
  }

  // 添加状态变化监听器
  addListener(key: string, callback: (statuses: NodeStatusInfo[]) => void): void {
    this.listeners.set(key, callback)
  }

  // 移除监听器
  removeListener(key: string): void {
    this.listeners.delete(key)
  }

  // 获取单个节点状态
  async getNodeStatus(nodeId: number): Promise<NodeStatus> {
    try {
      const response = await ApiClient.get(`/admin/frp/nodes/${nodeId}/status`)
      const status = response.data as NodeStatus
      this.statusCache.set(nodeId, status)
      return status
    } catch (error) {
      console.error(`获取节点 ${nodeId} 状态失败:`, error)
      // 返回离线状态
      const offlineStatus: NodeStatus = {
        online: false,
        dashboard: false,
        response_time: 0,
        error: '获取状态失败',
        last_check: Date.now() / 1000
      }
      this.statusCache.set(nodeId, offlineStatus)
      return offlineStatus
    }
  }

  // 获取所有节点状态
  async getAllNodesStatus(): Promise<NodeStatusInfo[]> {
    try {
      const response = await ApiClient.get('/admin/frp/nodes/status/all')
      const statuses = response.data as NodeStatusInfo[]
      
      // 更新缓存
      statuses.forEach(item => {
        this.statusCache.set(item.id, item.status)
      })
      
      return statuses
    } catch (error) {
      console.error('获取所有节点状态失败:', error)
      return []
    }
  }

  // 获取缓存的节点状态
  getCachedStatus(nodeId: number): NodeStatus | null {
    return this.statusCache.get(nodeId) || null
  }

  // 获取所有缓存的状态
  getAllCachedStatuses(): Map<number, NodeStatus> {
    return new Map(this.statusCache)
  }

  // 更新所有节点状态并通知监听器
  private async updateAllNodesStatus(): Promise<void> {
    try {
      const statuses = await this.getAllNodesStatus()
      
      // 通知所有监听器
      this.listeners.forEach(callback => {
        try {
          callback(statuses)
        } catch (error) {
          console.error('状态监听器回调执行失败:', error)
        }
      })
    } catch (error) {
      console.error('更新节点状态失败:', error)
    }
  }

  // 手动刷新状态
  async refreshStatus(): Promise<NodeStatusInfo[]> {
    return await this.updateAllNodesStatus().then(() => {
      return Array.from(this.statusCache.entries()).map(([id, status]) => ({
        id,
        name: `节点${id}`, // 这里应该从节点列表获取实际名称
        status
      }))
    })
  }

  // 检查节点是否在线
  isNodeOnline(nodeId: number): boolean {
    const status = this.getCachedStatus(nodeId)
    return status ? status.online : false
  }

  // 检查节点管理面板是否可用
  isDashboardAvailable(nodeId: number): boolean {
    const status = this.getCachedStatus(nodeId)
    return status ? status.dashboard : false
  }

  // 获取节点响应时间
  getResponseTime(nodeId: number): number {
    const status = this.getCachedStatus(nodeId)
    return status ? status.response_time : 0
  }

  // 获取节点错误信息
  getNodeError(nodeId: number): string {
    const status = this.getCachedStatus(nodeId)
    return status ? status.error : ''
  }

  // 获取状态文本
  getStatusText(nodeId: number): string {
    const status = this.getCachedStatus(nodeId)
    if (!status) return '未知'
    
    if (status.online && status.dashboard) {
      return '正常'
    } else if (status.online) {
      return '服务正常，面板异常'
    } else {
      return '离线'
    }
  }

  // 获取状态颜色
  getStatusColor(nodeId: number): 'success' | 'warning' | 'error' | 'default' {
    const status = this.getCachedStatus(nodeId)
    if (!status) return 'default'
    
    if (status.online && status.dashboard) {
      return 'success'
    } else if (status.online) {
      return 'warning'
    } else {
      return 'error'
    }
  }

  // 格式化最后检查时间
  formatLastCheck(nodeId: number): string {
    const status = this.getCachedStatus(nodeId)
    if (!status || !status.last_check) return '从未检查'
    
    const now = Date.now() / 1000
    const diff = now - status.last_check
    
    if (diff < 60) {
      return '刚刚'
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}分钟前`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}小时前`
    } else {
      return `${Math.floor(diff / 86400)}天前`
    }
  }

  // 格式化响应时间
  formatResponseTime(nodeId: number): string {
    const responseTime = this.getResponseTime(nodeId)
    if (responseTime === 0) return '-'
    
    if (responseTime < 100) {
      return `${responseTime}ms`
    } else if (responseTime < 1000) {
      return `${responseTime}ms`
    } else {
      return `${(responseTime / 1000).toFixed(1)}s`
    }
  }

  // 清理资源
  destroy(): void {
    this.stopMonitoring()
    this.listeners.clear()
    this.statusCache.clear()
  }
}

// 导出单例实例
export const nodeStatusService = NodeStatusService.getInstance()

// 在页面卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    nodeStatusService.destroy()
  })
}
