<template>
  <div class="dashboard-layout">
    <!-- 垂直侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <h2>XunFrp</h2>
        </div>
      </div>
      
      <div class="sidebar-menu">
        <n-menu
          :value="activeMenu"
          :options="menuOptions"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="20"
          @update:value="handleMenuSelect"
        />
      </div>
      
      <div class="sidebar-footer">
        <n-button
          text
          @click="collapsed = !collapsed"
          class="collapse-btn"
        >
          <template #icon>
            <n-icon>
              <MenuOutline v-if="collapsed" />
              <ChevronBackOutline v-else />
            </n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <div class="top-bar">
        <div class="breadcrumb">
          <n-breadcrumb>
            <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        
        <div class="user-actions">
          <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
            <n-button text>
              <template #icon>
                <n-icon><PersonOutline /></n-icon>
              </template>
              {{ authStore.user?.username }}
            </n-button>
          </n-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  HomeOutline,
  PersonOutline,
  ServerOutline,
  SettingsOutline,
  InformationCircleOutline,
  MenuOutline,
  ChevronBackOutline,
  ChevronDownOutline,
  LogOutOutline,
  KeyOutline,
  ListOutline,
  AddCircleOutline,
  CloudOutline,
  DownloadOutline
} from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const activeMenu = ref('dashboard-home')

// 菜单选项
const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'dashboard-home',
    icon: () => h(HomeOutline)
  },
  {
    label: '个人资料',
    key: 'profile',
    icon: () => h(PersonOutline)
  },
  {
    label: '隧道相关',
    key: 'tunnel',
    icon: () => h(ServerOutline),
    children: [
      {
        label: '隧道列表',
        key: 'tunnel-list',
        icon: () => h(ListOutline)
      },
      {
        label: '创建隧道',
        key: 'tunnel-create',
        icon: () => h(AddCircleOutline)
      },
      {
        label: '节点状态',
        key: 'node-status',
        icon: () => h(CloudOutline)
      },
      {
        label: '客户端下载',
        key: 'downloads',
        icon: () => h(DownloadOutline)
      }
    ]
  },
  {
    label: '其他信息',
    key: 'other',
    icon: () => h(InformationCircleOutline),
    children: [
      {
        label: '关于面板',
        key: 'about',
        icon: () => h(InformationCircleOutline)
      }
    ]
  }
]

// 用户菜单选项
const userMenuOptions = [
  {
    label: '个人中心',
    key: 'profile',
    icon: () => h(PersonOutline)
  },
  {
    label: '修改密码',
    key: 'change-password',
    icon: () => h(KeyOutline)
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(LogOutOutline)
  }
]

// 当前页面标题
const currentPageTitle = computed(() => {
  const menuMap: Record<string, string> = {
    'dashboard-home': '首页',
    'profile': '个人资料',
    'tunnel-list': '隧道列表',
    'tunnel-create': '创建隧道',
    'node-status': '节点状态',
    'downloads': '客户端下载',
    'about': '关于面板'
  }
  return menuMap[activeMenu.value] || '首页'
})

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
  
  const routeMap: Record<string, string> = {
    'dashboard-home': '/dashboard/home',
    'profile': '/dashboard/profile',
    'tunnel-list': '/dashboard/tunnels',
    'tunnel-create': '/dashboard/tunnels/create',
    'node-status': '/dashboard/nodes',
    'downloads': '/dashboard/downloads',
    'about': '/dashboard/about'
  }
  
  const targetRoute = routeMap[key]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      router.push('/dashboard/profile')
      break
    case 'change-password':
      router.push('/dashboard/change-password')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.logo h2 {
  margin: 0;
  color: #18a058;
  font-size: 1.5rem;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 0;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>
