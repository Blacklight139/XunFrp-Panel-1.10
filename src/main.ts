import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// AOS动画库
import AOS from 'aos'
import 'aos/dist/aos.css'

// Naive UI
import {
  create,
  NButton,
  NCard,
  NConfigProvider,
  NDialogProvider,
  NInput,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NMessageProvider,
  NNotificationProvider,
  NSpace,
  NTable,
  NTag,
  NForm,
  NFormItem,
  NSelect,
  NCheckbox,
  NRadio,
  NRadioGroup,
  NSwitch,
  NDatePicker,
  NTimePicker,
  NInputNumber,
  NSlider,
  NRate,
  NTransfer,
  NCascader,
  NTreeSelect,
  NUpload,
  NDropdown,
  NPopover,
  NTooltip,
  NModal,
  NDrawer,
  NTabs,
  NTabPane,
  NCollapse,
  NCollapseItem,
  NSteps,
  NStep,
  NBreadcrumb,
  NBreadcrumbItem,
  NPagination,
  NBackTop,
  NAnchor,
  NAnchorLink,
  NAffix,
  NAlert,
  NAvatar,
  NBadge,
  NCalendar,
  NStatistic,
  NProgress,
  NSkeleton,
  NSpin,
  NEmpty,
  NResult,
  NDescriptions,
  NDescriptionsItem,
  NList,
  NListItem,
  NThing,
  NDataTable,
  NTree,
  NLoadingBarProvider,
  darkTheme
} from 'naive-ui'

const naive = create({
  components: [
    NButton,
    NCard,
    NConfigProvider,
    NDialogProvider,
    NInput,
    NLayout,
    NLayoutContent,
    NLayoutHeader,
    NLayoutSider,
    NMenu,
    NMessageProvider,
    NNotificationProvider,
    NSpace,
    NTable,
    NTag,
    NForm,
    NFormItem,
    NSelect,
    NCheckbox,
    NRadio,
    NRadioGroup,
    NSwitch,
    NDatePicker,
    NTimePicker,
    NInputNumber,
    NSlider,
    NRate,
    NTransfer,
    NCascader,
    NTreeSelect,
    NUpload,
    NDropdown,
    NPopover,
    NTooltip,
    NModal,
    NDrawer,
    NTabs,
    NTabPane,
    NCollapse,
    NCollapseItem,
    NSteps,
    NStep,
    NBreadcrumb,
    NBreadcrumbItem,
    NPagination,
    NBackTop,
    NAnchor,
    NAnchorLink,
    NAffix,
    NAlert,
    NAvatar,
    NBadge,
    NCalendar,
    NStatistic,
    NProgress,
    NSkeleton,
    NSpin,
    NEmpty,
    NResult,
    NDescriptions,
    NDescriptionsItem,
    NList,
    NListItem,
    NThing,
    NDataTable,
    NTree,
    NLoadingBarProvider
  ]
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)

app.mount('#app')

// 初始化AOS动画
AOS.init({
  duration: 800, // 动画持续时间
  easing: 'ease-in-out', // 动画缓动函数
  once: true, // 动画只执行一次
  mirror: false, // 滚动回去时不重复动画
  offset: 100, // 触发动画的偏移量
  delay: 0, // 动画延迟
  anchorPlacement: 'top-bottom' // 锚点位置
})
