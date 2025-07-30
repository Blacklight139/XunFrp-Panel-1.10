import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const isDark = ref<boolean>(false)
  const primaryColor = ref<string>('#2c5aa0')
  const sidebarCollapsed = ref<boolean>(false)

  // 初始化主题
  const initTheme = () => {
    // 从localStorage读取主题设置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      try {
        const themeData = JSON.parse(savedTheme)
        isDark.value = themeData.isDark || false
        primaryColor.value = themeData.primaryColor || '#2c5aa0'
        sidebarCollapsed.value = themeData.sidebarCollapsed || false
      } catch (error) {
        console.error('解析主题设置失败:', error)
      }
    } else {
      // 检查系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDark.value = true
      }
    }
    
    // 应用主题到document
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement
    
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    root.style.setProperty('--primary-color', primaryColor.value)
    
    // 保存到localStorage
    saveTheme()
  }

  // 保存主题设置
  const saveTheme = () => {
    const themeData = {
      isDark: isDark.value,
      primaryColor: primaryColor.value,
      sidebarCollapsed: sidebarCollapsed.value,
    }
    localStorage.setItem('theme', JSON.stringify(themeData))
  }

  // 切换暗色模式
  const toggleDark = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // 设置主色调
  const setPrimaryColor = (color: string) => {
    primaryColor.value = color
    applyTheme()
  }

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    saveTheme()
  }

  // 设置侧边栏折叠状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    saveTheme()
  }

  // 重置主题
  const resetTheme = () => {
    isDark.value = false
    primaryColor.value = '#2c5aa0'
    sidebarCollapsed.value = false
    applyTheme()
  }

  return {
    // 状态
    isDark,
    primaryColor,
    sidebarCollapsed,
    
    // 方法
    initTheme,
    toggleDark,
    setPrimaryColor,
    toggleSidebar,
    setSidebarCollapsed,
    resetTheme,
  }
})
