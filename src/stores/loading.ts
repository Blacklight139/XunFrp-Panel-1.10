import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const requestCount = ref(0)

  // 显示加载动画
  const showLoading = (text = '加载中...') => {
    requestCount.value++
    loadingText.value = text
    isLoading.value = true
  }

  // 隐藏加载动画
  const hideLoading = () => {
    requestCount.value = Math.max(0, requestCount.value - 1)
    if (requestCount.value === 0) {
      isLoading.value = false
    }
  }

  // 强制隐藏加载动画
  const forceHideLoading = () => {
    requestCount.value = 0
    isLoading.value = false
  }

  return {
    isLoading,
    loadingText,
    requestCount,
    showLoading,
    hideLoading,
    forceHideLoading
  }
})
