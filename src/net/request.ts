import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import router from '@/router'

// 定义统一的错误类型
export interface ApiError {
  message: string
  [key: string]: any
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

declare const window: Window

let isAlerting = false // 防止多次弹窗

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!isAlerting) {
        isAlerting = true
        // 这里用 window，因为 setup 里没法直接用 useMessage/useRouter
        window.$message?.error?.('登录信息已过期，请重新登录')
        // 弹窗
        window.$dialog?.warning?.({
          title: '登录失效',
          content: '登录信息已过期，请重新登录',
          positiveText: '确定',
          onPositiveClick: () => {
            isAlerting = false
            // 清除本地token等
            localStorage.clear()
            sessionStorage.clear()
            // 跳转登录页
            router.push('/login')
          },
        })
      }
      // 这里改成 reject
      return Promise.reject({
        code: 1,
        message: '未登录或登录失效',
        data: null,
      })
    }
    return Promise.reject(error)
  },
)

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get(url, config)
  return response.data
}

export async function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post(url, data, config)
  return response.data
}

export async function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.put(url, data, config)
  return response.data
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete(url, config)
  return response.data
}

export default api
