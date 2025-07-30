<template>
  <div class="admin-layout">
    <n-layout has-sider>
      <!-- 侧边栏 -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        class="admin-sidebar"
      >
        <div class="sidebar-header">
          <div class="logo" v-if="!collapsed">
            <h2>管理面板</h2>
          </div>
          <div class="logo-mini" v-else>
            <span>管</span>
          </div>
        </div>
        
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuSelect"
          class="admin-menu"
        />
      </n-layout-sider>

      <!-- 主内容区域 -->
      <n-layout>
        <!-- 顶部导航栏 -->
        <n-layout-header bordered class="admin-header">
          <div class="header-content">
            <div class="header-left">
              <n-breadcrumb>
                <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                  {{ item.title }}
                </n-breadcrumb-item>
              </n-breadcrumb>
            </div>
            <div class="header-right">
              <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
                <n-button text>
                  <n-icon><PersonOutline /></n-icon>
                  {{ userStore.user?.username }}
                </n-button>
              </n-dropdown>
            </div>
          </div>
        </n-layout-header>

        <!-- 内容区域 -->
        <n-layout-content class="admin-content">
          <div class="content-wrapper">
            <router-view />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  PersonOutline,
  HomeOutline,
  PeopleOutline,
  ServerOutline,
  GitNetworkOutline,
  DocumentTextOutline,
  SettingsOutline,
  LogOutOutline,
  StatsChartOutline,
  CloudDownloadOutline,
  NotificationsOutline,
  ShieldCheckmarkOutline
} from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const userStore = useAuthStore()

const collapsed = ref(false)

// 菜单选项
const menuOptions: MenuOption[] = [
  {
    label: '仪表板',
    key: '/admin/dashboard',
    icon: () => h(HomeOutline)
  },
  {
    label: '用户管理',
    key: 'user-management',
    icon: () => h(PeopleOutline),
    children: [
      {
        label: '用户列表',
        key: '/admin/users'
      },
      {
        label: '实名认证',
        key: '/admin/verifications'
      }
    ]
  },
  {
    label: '隧道管理',
    key: '/admin/tunnels',
    icon: () => h(GitNetworkOutline)
  },
  {
    label: '节点管理',
    key: 'node-management',
    icon: () => h(ServerOutline),
    children: [
      {
        label: '节点列表',
        key: '/admin/nodes'
      },
      {
        label: 'FRP节点管理',
        key: '/admin/frp/nodes'
      },
      {
        label: 'FRP监控',
        key: '/admin/frp/monitor'
      }
    ]
  },
  {
    label: '操作日志',
    key: '/admin/logs',
    icon: () => h(DocumentTextOutline)
  },
  {
    label: '系统设置',
    key: 'system-settings',
    icon: () => h(SettingsOutline),
    children: [
      {
        label: '基础设置',
        key: '/admin/settings'
      },
      {
        label: '公告管理',
        key: '/admin/announcements'
      },
      {
        label: '广告管理',
        key: '/admin/advertisements'
      },
      {
        label: '下载管理',
        key: '/admin/downloads'
      },
      {
        label: '签到设置',
        key: '/admin/signin-settings'
      }
    ]
  }
]

// 用户菜单选项
const userMenuOptions = [
  {
    label: '返回用户面板',
    key: 'dashboard',
    icon: () => h(HomeOutline)
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(LogOutOutline)
  }
]

// 当前激活的菜单项
const activeKey = computed(() => {
  const path = route.path
  // 检查是否是子菜单项
  for (const item of menuOptions) {
    if (item.children) {
      for (const child of item.children) {
        if (child.key === path) {
          return child.key
        }
      }
    } else if (item.key === path) {
      return item.key
    }
  }
  return path
})

// 面包屑导航
const breadcrumbs = computed(() => {
  const path = route.path
  const crumbs = [{ title: '管理面板', path: '/admin' }]
  
  // 根据路径生成面包屑
  if (path.includes('/admin/users')) {
    crumbs.push({ title: '用户管理', path: '/admin/users' })
  } else if (path.includes('/admin/tunnels')) {
    crumbs.push({ title: '隧道管理', path: '/admin/tunnels' })
  } else if (path.includes('/admin/nodes')) {
    crumbs.push({ title: '节点管理', path: '/admin/nodes' })
  } else if (path.includes('/admin/logs')) {
    crumbs.push({ title: '操作日志', path: '/admin/logs' })
  } else if (path.includes('/admin/settings')) {
    crumbs.push({ title: '系统设置', path: '/admin/settings' })
  } else if (path.includes('/admin/announcements')) {
    crumbs.push({ title: '公告管理', path: '/admin/announcements' })
  } else if (path === '/admin/dashboard') {
    crumbs.push({ title: '仪表板', path: '/admin/dashboard' })
  }
  
  return crumbs
})

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  if (key.startsWith('/')) {
    router.push(key)
  }
}

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (key === 'dashboard') {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
  padding: 0 16px;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
}

.logo-mini span {
  font-size: 20px;
  font-weight: 600;
  color: var(--n-text-color);
}

.admin-menu {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

.admin-layout :deep(.n-layout-sider--collapsed) + .n-layout .admin-header {
  margin-left: 64px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-content {
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-layout :deep(.n-layout-sider--collapsed) + .n-layout .admin-content {
  margin-left: 64px;
}

.content-wrapper {
  padding: 24px;
  min-height: 100%;
}
</style>
