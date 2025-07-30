<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-loading-bar-provider ref="loadingBarRef">
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { darkTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { loadingBarManager } from '@/utils/loadingBar'
import { useRoute } from 'vue-router'
import AOS from 'aos'

const themeStore = useThemeStore()
const loadingBarRef = ref()
const route = useRoute()

const theme = computed(() => {
  return themeStore.isDark ? darkTheme : null
})

// 主题覆盖配置
const themeOverrides = {
  LoadingBar: {
    colorLoading: '#18a058', // 绿色进度条
    colorError: '#d03050',   // 红色错误进度条
    height: '3px'            // 进度条高度
  }
}

// 设置全局进度条API
onMounted(async () => {
  console.log('App.vue onMounted 开始')

  // 使用nextTick确保DOM完全渲染
  await nextTick()

  console.log('loadingBarRef.value:', loadingBarRef.value)

  // 多次尝试初始化
  let success = false
  for (let i = 0; i < 5; i++) {
    console.log(`进度条初始化尝试 ${i + 1}/5`)
    success = await loadingBarManager.delayedInit(loadingBarRef.value)
    if (success) break
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  if (success) {
    console.log('进度条管理器初始化成功')
  } else {
    console.error('进度条管理器初始化失败')
    console.log('调试信息:', loadingBarManager.getDebugInfo())
  }
})

// 监听路由变化，刷新AOS动画
watch(() => route.path, () => {
  nextTick(() => {
    AOS.refresh()
  })
}, { immediate: true })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .n-layout-sider {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .n-layout-sider.show {
    transform: translateX(0);
  }
}
</style>
