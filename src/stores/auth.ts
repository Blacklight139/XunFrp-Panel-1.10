import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiClient } from '@/utils/api'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.user_group === 'admin')

  // 初始化用户信息
  const initUser = async () => {
    if (!token.value) return

    try {
      isLoading.value = true
      const response = await ApiClient.get<{user: User, tunnel_count: number, today_traffic: any}>('/user/profile')
      user.value = response.user
      // 更新localStorage中的用户信息
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
    } finally {
      isLoading.value = false
    }
  }

  // 登录
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      isLoading.value = true
      const response = await ApiClient.post<LoginResponse>('/login', credentials)

      token.value = response.token
      user.value = response.user

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error: any) {
      // 确保错误对象有正确的结构
      if (error && error.response && error.response.data) {
        // 重新抛出带有正确结构的错误
        const apiError = new Error(error.response.data.message || '登录失败')
        ;(apiError as any).response = error.response
        throw apiError
      } else {
        throw error
      }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      isLoading.value = true
      await ApiClient.post('/register', userData)
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // 刷新用户信息
  const refreshUser = async () => {
    if (!token.value) return

    try {
      const response = await ApiClient.get<{user: User, tunnel_count: number, today_traffic: any}>('/user/profile')
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      isLoading.value = true
      await ApiClient.post('/user/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 重置访问密钥
  const resetAccessKey = async (): Promise<string> => {
    try {
      isLoading.value = true
      const response = await ApiClient.post<{ access_key: string }>('/user/reset-access-key')
      
      if (user.value) {
        user.value.access_key = response.access_key
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      
      return response.access_key
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 实名认证
  const verifyIdentity = async (realName: string, idCard: string): Promise<void> => {
    try {
      isLoading.value = true
      const userData = await ApiClient.post<User>('/user/verify-identity', {
        real_name: realName,
        id_card: idCard,
      })
      
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 签到
  const signIn = async (): Promise<{
    reward: number
    sign_in_days: number
    total_sign_in: number
    traffic_limit: number
  }> => {
    try {
      isLoading.value = true
      const response = await ApiClient.post<{
        reward: number
        sign_in_days: number
        total_sign_in: number
        traffic_limit: number
      }>('/signin')
      
      // 更新用户信息
      if (user.value) {
        user.value.sign_in_days = response.sign_in_days
        user.value.total_sign_in = response.total_sign_in
        user.value.traffic_limit = response.traffic_limit
        user.value.last_sign_in = new Date().toISOString()
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 检查是否可以签到
  const canSignIn = computed(() => {
    if (!user.value?.last_sign_in) return true
    
    const lastSignIn = new Date(user.value.last_sign_in)
    const today = new Date()
    
    return lastSignIn.toDateString() !== today.toDateString()
  })

  // 初始化时从localStorage恢复用户信息
  const storedUser = localStorage.getItem('user')
  if (storedUser && token.value) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      logout()
    }
  }

  return {
    // 状态
    token,
    user,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    canSignIn,
    
    // 方法
    initUser,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    changePassword,
    resetAccessKey,
    verifyIdentity,
    signIn,
  }
})
