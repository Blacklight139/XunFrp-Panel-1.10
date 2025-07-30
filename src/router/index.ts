import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteMeta } from '@/types'

// 路由组件懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/LoginNew.vue')
const Register = () => import('@/views/RegisterNew.vue')
const ResetPassword = () => import('@/views/ResetPasswordNew.vue')
const Privacy = () => import('@/views/Privacy.vue')
const Terms = () => import('@/views/Terms.vue')

// 路由组件懒加载
const Dashboard = () => import('@/views/DashboardNew.vue')
const DashboardHome = () => import('@/views/dashboard/Home.vue')
const DashboardProfile = () => import('@/views/dashboard/Profile.vue')
const DashboardAbout = () => import('@/views/dashboard/About.vue')
const UserCenter = () => import('@/views/UserCenter.vue')
const TunnelList = () => import('@/views/TunnelList.vue')
const CreateTunnel = () => import('@/views/TunnelCreate.vue')
const EditTunnel = () => import('@/views/TunnelEdit.vue')
const Downloads = () => import('@/views/Downloads.vue')
const NodeStatus = () => import('@/views/NodeStatus.vue')
// 管理员布局和页面
const AdminLayout = () => import('@/layouts/AdminLayout.vue')
const AdminDashboard = () => import('@/views/admin/Dashboard.vue')
const AdminUsers = () => import('@/views/admin/UserList.vue')
const AdminNodes = () => import('@/views/admin/NodeList.vue')
const AdminTunnels = () => import('@/views/admin/TunnelList.vue')
const AdminAnnouncements = () => import('@/views/admin/AnnouncementList.vue')
const AdminSettings = () => import('@/views/admin/SystemSettings.vue')
const AdminLogs = () => import('@/views/admin/OperationLogs.vue')

const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
    } as RouteMeta,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
    } as RouteMeta,
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      title: '重置密码',
    } as RouteMeta,
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy,
    meta: {
      title: '隐私政策',
    } as RouteMeta,
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms,
    meta: {
      title: '服务条款',
    } as RouteMeta,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    redirect: '/dashboard/home',
    meta: {
      title: '用户面板',
      requiresAuth: true,
    },
    children: [
      {
        path: 'home',
        name: 'DashboardHome',
        component: DashboardHome,
        meta: {
          title: '首页',
          requiresAuth: true,
        },
      },
      {
        path: 'profile',
        name: 'DashboardProfile',
        component: DashboardProfile,
        meta: {
          title: '个人资料',
          requiresAuth: true,
        },
      },
      {
        path: 'about',
        name: 'DashboardAbout',
        component: DashboardAbout,
        meta: {
          title: '关于面板',
          requiresAuth: true,
        },
      },
      {
        path: 'tunnels',
        name: 'DashboardTunnels',
        component: TunnelList,
        meta: {
          title: '隧道管理',
          requiresAuth: true,
        },
      },
      {
        path: 'tunnels/create',
        name: 'DashboardCreateTunnel',
        component: CreateTunnel,
        meta: {
          title: '创建隧道',
          requiresAuth: true,
        },
      },
      {
        path: 'tunnels/:id/edit',
        name: 'DashboardEditTunnel',
        component: EditTunnel,
        meta: {
          title: '编辑隧道',
          requiresAuth: true,
        },
      },
      {
        path: 'nodes',
        name: 'DashboardNodes',
        component: NodeStatus,
        meta: {
          title: '节点状态',
          requiresAuth: true,
        },
      },
      {
        path: 'downloads',
        name: 'DashboardDownloads',
        component: Downloads,
        meta: {
          title: '客户端下载',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: UserCenter,
    meta: {
      title: '用户中心',
      requiresAuth: true,
    },
  },
  // 管理员路由
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: {
          title: '管理员面板',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: {
          title: '用户管理',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'nodes',
        name: 'AdminNodes',
        component: AdminNodes,
        meta: {
          title: '节点管理',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'tunnels',
        name: 'AdminTunnels',
        component: AdminTunnels,
        meta: {
          title: '隧道管理',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: AdminAnnouncements,
        meta: {
          title: '公告管理',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: AdminSettings,
        meta: {
          title: '系统设置',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'frp/nodes',
        name: 'AdminFRPNodes',
        component: () => import('@/views/admin/FRPNodeManagement.vue'),
        meta: {
          title: 'FRP节点管理',
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: 'frp/monitor',
        name: 'AdminFRPMonitor',
        component: () => import('@/views/admin/FRPAPIMonitor.vue'),
        meta: {
          title: 'FRP API监控',
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: 'frp/status-test',
        name: 'AdminFRPStatusTest',
        component: () => import('@/views/admin/NodeStatusTest.vue'),
        meta: {
          title: '节点状态测试',
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: 'frp/api-test',
        name: 'AdminFRPAPITest',
        component: () => import('@/views/admin/FRPAPITest.vue'),
        meta: {
          title: 'FRP API测试',
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: AdminLogs,
        meta: {
          title: '操作日志',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在',
    } as RouteMeta,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - XunFrp`
  } else {
    document.title = 'XunFrp - 内网穿透服务'
  }
  
  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      })
      return
    }
    
    // 如果用户信息不存在，尝试获取
    if (!authStore.user) {
      try {
        await authStore.initUser()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        next({ name: 'Login' })
        return
      }
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta?.requiresAdmin) {
    if (!authStore.isAdmin) {
      next({ name: 'Dashboard' })
      return
    }
  }
  
  // 如果已登录用户访问登录/注册页面，重定向到面板
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
})

export default router
