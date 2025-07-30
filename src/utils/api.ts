import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 扩展Window类型
declare global {
  interface Window {
    loadingBar?: any
  }
}

// 扩展AxiosRequestConfig类型
declare module 'axios' {
  interface AxiosRequestConfig {
    hideLoading?: boolean
    loadingText?: string
  }
  interface InternalAxiosRequestConfig {
    hideLoading?: boolean
    loadingText?: string
  }
}
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { useMessage } from 'naive-ui'
import type { ApiResponse } from '@/types'
import { loadingBarManager } from '@/utils/loadingBar'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const loadingStore = useLoadingStore()

    // 添加认证token
    if (authStore.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // 显示加载动画（除非明确禁用）
    if (!config.hideLoading) {
      const loadingText = config.loadingText || '加载中...'
      loadingStore.showLoading(loadingText)

      // 显示顶部进度条
      const started = loadingBarManager.start()
      if (started) {
        console.log('启动进度条:', config.url)
      } else {
        console.warn('进度条启动失败:', config.url)
      }
    }

    return config
  },
  (error) => {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading()

    // 错误时显示红色进度条
    const errorShown = loadingBarManager.error()
    if (errorShown) {
      console.log('进度条错误:', error.config?.url)
    }

    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const loadingStore = useLoadingStore()
    const { data } = response

    // 隐藏加载动画
    loadingStore.hideLoading()

    // 完成顶部进度条
    const finished = loadingBarManager.finish()
    if (finished) {
      console.log('完成进度条:', response.config.url)
    }

    // 如果响应成功，直接返回数据
    if (data.code === 200 || data.code === 201) {
      return response
    }

    // 处理业务错误
    const message = useMessage()
    const errorMessage = data.message || data.error || '请求失败'
    message.error(errorMessage)

    // 创建包含完整错误信息的错误对象
    const error = new Error(errorMessage)
    // 保留原始响应数据
    ;(error as any).response = response
    ;(error as any).data = data

    return Promise.reject(error)
  },
  (error) => {
    const loadingStore = useLoadingStore()
    const message = useMessage()
    const authStore = useAuthStore()

    // 隐藏加载动画
    loadingStore.hideLoading()

    // 错误时显示红色进度条
    const errorShown = loadingBarManager.error()
    if (errorShown) {
      console.log('响应错误，进度条错误:', error.config?.url)
    }

    // 确保error对象存在
    if (!error) {
      return Promise.reject(new Error('未知错误'))
    }

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录')
          authStore.logout()
          window.location.href = '/login'
          break
        case 403:
          // 检查是否是封号错误
          if (data?.error_type === 'account_banned') {
            const banMessage = data.message || '您的账户已被封禁，如有问题请联系管理员'
            message.error(banMessage, { duration: 5000 })

            // 如果是封号，强制退出登录
            authStore.logout()
            window.location.href = '/login'
          } else {
            message.error(data?.message || '权限不足')
          }
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 409:
          // 409冲突错误，通常是资源已存在，不在这里显示错误消息
          // 让具体的组件处理这种错误
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(data?.message || `请求失败 (${status})`)
      }

      // 保留原始错误对象，以便前端可以访问response信息
      return Promise.reject(error)
    } else if (error.request) {
      message.error('网络连接失败，请检查网络')
      return Promise.reject(new Error('网络连接失败，请检查网络'))
    } else {
      message.error(error.message || '请求配置错误')
      return Promise.reject(new Error(error.message || '请求配置错误'))
    }
  }
)

// API方法封装
export class ApiClient {
  // GET请求
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, config)
    return response.data.data as T
  }
  
  // POST请求
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data, config)
    return response.data.data as T
  }
  
  // PUT请求
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data, config)
    return response.data.data as T
  }
  
  // DELETE请求
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url, config)
    return response.data.data as T
  }
  
  // PATCH请求
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(url, data, config)
    return response.data.data as T
  }

  // 测试进度条功能
  static testLoadingBar() {
    console.log('测试进度条功能')
    console.log('进度条调试信息:', loadingBarManager.getDebugInfo())

    if (!loadingBarManager.isReady()) {
      console.error('进度条API未就绪')
      return
    }

    // 测试启动
    console.log('启动进度条...')
    loadingBarManager.start()

    // 2秒后完成
    setTimeout(() => {
      console.log('完成进度条...')
      loadingBarManager.finish()
    }, 2000)
  }

  // 测试错误进度条
  static testErrorLoadingBar() {
    console.log('测试错误进度条')
    console.log('进度条调试信息:', loadingBarManager.getDebugInfo())

    if (!loadingBarManager.isReady()) {
      console.error('进度条API未就绪')
      return
    }

    // 测试启动
    console.log('启动进度条...')
    loadingBarManager.start()

    // 2秒后显示错误
    setTimeout(() => {
      console.log('显示错误进度条...')
      loadingBarManager.error()
    }, 2000)
  }
}

export default api
