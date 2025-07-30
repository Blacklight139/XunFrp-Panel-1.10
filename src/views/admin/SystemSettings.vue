<template>
  <div class="admin-system-settings">
    <div class="container">
      <div class="page-header">
        <h1>系统设置</h1>
        <p>配置系统参数和功能设置</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <n-spin size="large">
          <template #description>
            正在加载设置...
          </template>
        </n-spin>
      </div>

      <!-- 设置内容 -->
      <n-tabs v-else type="line" animated>
        <!-- 公告设置 -->
        <n-tab-pane name="announcement" tab="公告设置">
          <n-card title="公告配置" class="setting-card">
            <n-form
              ref="announcementFormRef"
              :model="announcementForm"
              :rules="announcementRules"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
            >
              <n-form-item label="启用公告" path="enabled">
                <n-switch v-model:value="announcementForm.enabled" />
              </n-form-item>

              <n-form-item label="公告标题" path="title">
                <n-input
                  v-model:value="announcementForm.title"
                  placeholder="系统公告"
                  :disabled="!announcementForm.enabled"
                />
              </n-form-item>

              <n-form-item label="公告内容" path="content">
                <n-input
                  v-model:value="announcementForm.content"
                  type="textarea"
                  placeholder="请输入公告内容"
                  :disabled="!announcementForm.enabled"
                  :rows="4"
                />
              </n-form-item>

              <n-form-item label="公告类型" path="type">
                <n-select
                  v-model:value="announcementForm.type"
                  :options="announcementTypeOptions"
                  :disabled="!announcementForm.enabled"
                />
              </n-form-item>

              <n-form-item label="在首页显示" path="show_on_homepage">
                <n-switch v-model:value="announcementForm.show_on_homepage" :disabled="!announcementForm.enabled" />
              </n-form-item>

              <n-form-item label="在仪表板显示" path="show_on_dashboard">
                <n-switch v-model:value="announcementForm.show_on_dashboard" :disabled="!announcementForm.enabled" />
              </n-form-item>

              <n-form-item label="在下载页显示" path="show_on_downloads">
                <n-switch v-model:value="announcementForm.show_on_downloads" :disabled="!announcementForm.enabled" />
              </n-form-item>

              <n-form-item label="自动关闭" path="auto_close">
                <n-switch v-model:value="announcementForm.auto_close" :disabled="!announcementForm.enabled" />
              </n-form-item>

              <n-form-item label="关闭延时(秒)" path="close_delay" v-if="announcementForm.auto_close">
                <n-input-number
                  v-model:value="announcementForm.close_delay"
                  :min="1"
                  :max="60"
                  :disabled="!announcementForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>

              <n-form-item>
                <n-button type="primary" @click="saveAnnouncementSettings" :loading="saving">
                  保存设置
                </n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-tab-pane>

        <!-- 广告位设置 -->
        <n-tab-pane name="advertisement" tab="广告位设置">
          <n-card title="广告位管理" class="setting-card">
            <template #header-extra>
              <n-button type="primary" @click="openCreateAdModal">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                添加广告位
              </n-button>
            </template>

            <div class="advertisement-management">
              <!-- 广告位统计 -->
              <div class="ad-stats">
                <n-statistic label="总广告位数" :value="adList.length" />
                <n-statistic label="启用中" :value="adList.filter(ad => ad.enabled).length" />
                <n-statistic label="禁用中" :value="adList.filter(ad => !ad.enabled).length" />
              </div>

              <!-- 广告位列表 -->
              <n-data-table
                :columns="adColumns"
                :data="adList"
                :loading="adLoading"
                :pagination="false"
                :bordered="false"
                :row-key="(row) => row.id"
                class="ad-table"
              />
            </div>
          </n-card>
        </n-tab-pane>

        <!-- 签到系统设置 -->
        <n-tab-pane name="signin" tab="签到设置">
          <n-card title="签到系统配置" class="setting-card">
            <n-form
              ref="signinFormRef"
              :model="signinForm"
              :rules="signinRules"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
            >
              <n-form-item label="启用签到" path="enabled">
                <n-switch v-model:value="signinForm.enabled" />
              </n-form-item>
              
              <n-form-item label="每日奖励流量(MB)" path="daily_reward">
                <n-input-number
                  v-model:value="signinForm.daily_reward"
                  :min="0"
                  :max="10240"
                  placeholder="100"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>

              <n-form-item label="每日奖励积分" path="daily_points">
                <n-input-number
                  v-model:value="signinForm.daily_points"
                  :min="0"
                  :max="1000"
                  placeholder="10"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>
              
              <n-form-item label="连续签到奖励倍数" path="consecutive_multiplier">
                <n-input-number
                  v-model:value="signinForm.consecutive_multiplier"
                  :min="1"
                  :max="10"
                  :step="0.1"
                  placeholder="1.5"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>

              <n-form-item label="积分翻倍设置" path="points_double_enabled">
                <n-switch v-model:value="signinForm.points_double_enabled" :disabled="!signinForm.enabled" />
              </n-form-item>

              <n-form-item v-if="signinForm.points_double_enabled" label="积分翻倍倍数" path="points_double_multiplier">
                <n-input-number
                  v-model:value="signinForm.points_double_multiplier"
                  :min="2"
                  :max="10"
                  :step="1"
                  placeholder="2"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>
              
              <n-form-item label="最大连续奖励天数" path="max_consecutive_days">
                <n-input-number
                  v-model:value="signinForm.max_consecutive_days"
                  :min="1"
                  :max="365"
                  placeholder="7"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>
              
              <n-form-item label="重置连续签到时间(小时)" path="reset_hour">
                <n-input-number
                  v-model:value="signinForm.reset_hour"
                  :min="0"
                  :max="23"
                  placeholder="0"
                  :disabled="!signinForm.enabled"
                  style="width: 100%"
                />
              </n-form-item>
              
              <n-form-item>
                <n-button type="primary" @click="saveSigninSettings" :loading="saving">
                  保存设置
                </n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-tab-pane>

        <!-- 系统参数设置 -->
        <n-tab-pane name="system" tab="系统参数">
          <n-card title="系统基础配置" class="setting-card">
            <n-form
              ref="systemFormRef"
              :model="systemForm"
              :rules="systemRules"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
            >
              <n-form-item label="网站标题" path="site_title">
                <n-input
                  v-model:value="systemForm.site_title"
                  placeholder="XunFrp 内网穿透"
                />
              </n-form-item>
              
              <n-form-item label="网站描述" path="site_description">
                <n-input
                  v-model:value="systemForm.site_description"
                  type="textarea"
                  placeholder="专业的内网穿透服务"
                  :rows="3"
                />
              </n-form-item>
              
              <!-- 注册功能已永久开启，移除开关 -->

              <n-form-item label="需要邮箱验证" path="require_email_verify">
                <n-switch v-model:value="systemForm.require_email_verify" />
              </n-form-item>
              
              <n-form-item label="默认用户组" path="default_user_group">
                <n-select
                  v-model:value="systemForm.default_user_group"
                  :options="userGroupOptions"
                  placeholder="请选择默认用户组"
                />
              </n-form-item>
              
              <n-form-item>
                <n-button type="primary" @click="saveSystemSettings" :loading="saving">
                  保存设置
                </n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-tab-pane>

        <!-- 下载管理设置 -->
        <n-tab-pane name="downloads" tab="下载管理">
          <n-card title="客户端下载管理" class="setting-card">
            <div class="downloads-management">
              <!-- 软件列表 -->
              <div class="software-list">
                <div class="list-header">
                  <h3>客户端软件列表</h3>
                  <n-button type="primary" @click="showCreateModal = true">
                    添加软件
                  </n-button>
                </div>

                <n-data-table
                  :columns="softwareColumns"
                  :data="softwareList"
                  :loading="softwareLoading"
                  :pagination="false"
                  :bordered="false"
                />
              </div>
            </div>
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 添加/编辑软件弹窗 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="软件管理">
      <template #header>
        <div>{{ editingSoftware ? '编辑软件' : '添加软件' }}</div>
      </template>

      <n-form
        ref="softwareFormRef"
        :model="softwareForm"
        :rules="softwareRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="软件名称" path="name">
          <n-input v-model:value="softwareForm.name" placeholder="如：FRP客户端 Windows版" />
        </n-form-item>

        <n-form-item label="版本号" path="version">
          <n-input v-model:value="softwareForm.version" placeholder="如：v0.51.2" />
        </n-form-item>

        <n-form-item label="平台" path="platform">
          <n-select
            v-model:value="softwareForm.platform"
            :options="platformOptions"
            placeholder="选择平台"
          />
        </n-form-item>

        <n-form-item label="架构" path="architecture">
          <n-select
            v-model:value="softwareForm.architecture"
            :options="architectureOptions"
            placeholder="选择架构"
          />
        </n-form-item>

        <n-form-item label="下载链接" path="download_url">
          <n-input v-model:value="softwareForm.download_url" placeholder="https://..." />
        </n-form-item>

        <n-form-item label="文件大小" path="file_size">
          <n-input v-model:value="softwareForm.file_size" placeholder="如：12.5MB" />
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="softwareForm.description"
            type="textarea"
            placeholder="软件描述"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="启用状态" path="is_active">
          <n-switch v-model:value="softwareForm.is_active">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>

        <n-form-item label="快捷下载" path="is_quick">
          <n-switch v-model:value="softwareForm.is_quick">
            <template #checked>显示在快捷下载</template>
            <template #unchecked>不显示在快捷下载</template>
          </n-switch>
        </n-form-item>

        <n-form-item label="排序" path="sort_order">
          <n-input-number v-model:value="softwareForm.sort_order" :min="1" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSoftwareSubmit">
            {{ editingSoftware ? '更新' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 添加/编辑广告位弹窗 -->
    <n-modal v-model:show="showCreateAdModal" preset="dialog" title="广告位管理">
      <template #header>
        <div>{{ editingAd ? '编辑广告位' : '添加广告位' }}</div>
      </template>

      <n-form
        ref="adFormRef"
        :model="adForm"
        :rules="adRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="广告标题" path="title">
          <n-input v-model:value="adForm.title" placeholder="如：推广广告" />
        </n-form-item>

        <n-form-item label="广告内容" path="content">
          <n-input
            v-model:value="adForm.content"
            type="textarea"
            placeholder="广告内容描述"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="图片链接" path="image_url">
          <n-input v-model:value="adForm.image_url" placeholder="https://example.com/ad.jpg" />
        </n-form-item>

        <n-form-item label="跳转链接" path="link_url">
          <n-input v-model:value="adForm.link_url" placeholder="https://example.com" />
        </n-form-item>

        <n-form-item label="显示位置" path="position">
          <n-select
            v-model:value="adForm.position"
            :options="availablePositions"
            placeholder="选择显示位置"
          />
        </n-form-item>

        <n-form-item label="启用状态" path="enabled">
          <n-switch v-model:value="adForm.enabled">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>

        <n-form-item label="允许关闭" path="closeable">
          <n-switch v-model:value="adForm.closeable">
            <template #checked>可关闭</template>
            <template #unchecked>不可关闭</template>
          </n-switch>
        </n-form-item>

        <n-form-item label="自动关闭" path="auto_close">
          <n-switch v-model:value="adForm.auto_close">
            <template #checked>自动关闭</template>
            <template #unchecked>手动关闭</template>
          </n-switch>
        </n-form-item>

        <n-form-item v-if="adForm.auto_close" label="关闭延时(秒)" path="close_delay">
          <n-input-number v-model:value="adForm.close_delay" :min="1" :max="60" />
        </n-form-item>

        <n-form-item label="排序" path="sort_order">
          <n-input-number v-model:value="adForm.sort_order" :min="1" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="showCreateAdModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleAdSubmit">
            {{ editingAd ? '更新' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { AddOutline, SaveOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const message = useMessage()

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)

// 表单引用
const announcementFormRef = ref<FormInst | null>(null)
const adFormRef = ref<FormInst | null>(null)
const signinFormRef = ref<FormInst | null>(null)
const systemFormRef = ref<FormInst | null>(null)

// 公告设置表单
const announcementForm = reactive({
  enabled: false,
  title: '系统公告',
  content: '欢迎使用XunFrp内网穿透服务！',
  type: 'info',
  show_on_homepage: true,
  show_on_dashboard: true,
  show_on_downloads: true,
  auto_close: false,
  close_delay: 5,
})

// 广告位管理相关数据
const adList = ref([])
const adLoading = ref(false)
const showCreateAdModal = ref(false)
const editingAd = ref<any>(null)

// 广告位表单数据
const adForm = reactive({
  title: '',
  content: '',
  image_url: '',
  link_url: '',
  position: '',
  enabled: true,
  closeable: true,
  auto_close: false,
  close_delay: 5,
  sort_order: 1,
})

// 所有可用的广告位位置
const allPositions = [
  { label: '顶部横幅', value: 'top-banner' },
  { label: '左侧边栏', value: 'left-sidebar' },
  { label: '右侧边栏', value: 'right-sidebar' },
  { label: '底部横幅', value: 'bottom-banner' },
  { label: '内容区域上方', value: 'content-top' },
  { label: '内容区域下方', value: 'content-bottom' },
  { label: '导航栏下方', value: 'nav-bottom' },
  { label: '页脚上方', value: 'footer-top' },
  { label: '弹窗广告', value: 'popup' },
  { label: '浮动广告', value: 'floating' },
]

// 计算可用位置（允许同一位置多个广告位）
const availablePositions = computed(() => {
  return allPositions
})

// 签到设置表单
const signinForm = reactive({
  enabled: true,
  daily_reward: 100,
  daily_points: 10,
  consecutive_multiplier: 1.5,
  max_consecutive_days: 7,
  reset_hour: 0,
  points_double_enabled: false,
  points_double_multiplier: 2,
})

// 系统设置表单
const systemForm = reactive({
  site_title: 'XunFrp 内网穿透',
  site_description: '专业的内网穿透服务',
  require_email_verify: true,
  default_user_group: 'unverified',
})

// 下载管理相关数据
const softwareList = ref([])
const softwareLoading = ref(false)
const showCreateModal = ref(false)
const editingSoftware = ref<any>(null)
const submitting = ref(false)
const softwareFormRef = ref()

// 软件表单数据
const softwareForm = reactive({
  name: '',
  version: '',
  platform: '',
  architecture: '',
  download_url: '',
  file_size: '',
  description: '',
  is_active: true,
  is_quick: false,
  sort_order: 1,
})

// 平台选项
const platformOptions = [
  { label: 'Windows', value: 'windows' },
  { label: 'Linux', value: 'linux' },
  { label: 'macOS', value: 'darwin' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
]

// 架构选项
const architectureOptions = [
  { label: 'x86_64 (64位)', value: 'amd64' },
  { label: 'x86 (32位)', value: '386' },
  { label: 'ARM64', value: 'arm64' },
  { label: 'ARM', value: 'arm' },
]

// 用户组选项
const userGroupOptions = [
  { label: '未认证用户', value: 'unverified' },
  { label: '已认证用户', value: 'verified' },
  { label: '赞助用户', value: 'sponsor' },
]

// 公告类型选项
const announcementTypeOptions = [
  { label: '信息', value: 'info' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
]

// 广告位位置选项
const adPositionOptions = [
  { label: '顶部', value: 'top' },
  { label: '底部', value: 'bottom' },
  { label: '侧边栏', value: 'sidebar' },
]

// 表单验证规则
const announcementRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ],
}

const adRules: FormRules = {
  title: [
    { required: true, message: '请输入广告标题', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请选择显示位置', trigger: 'change' }
  ]
}

const signinRules: FormRules = {
  daily_reward: [
    { type: 'number', required: true, message: '请输入每日奖励流量', trigger: 'blur' }
  ],
  consecutive_multiplier: [
    { type: 'number', required: true, message: '请输入连续签到奖励倍数', trigger: 'blur' }
  ],
}

const systemRules: FormRules = {
  site_title: [
    { required: true, message: '请输入网站标题', trigger: 'blur' }
  ],
  default_user_group: [
    { required: true, message: '请选择默认用户组', trigger: 'change' }
  ],
}

// 加载设置
const loadSettings = async () => {
  try {
    loading.value = true
    const response = await ApiClient.get('/admin/settings')

    // 修复：正确访问嵌套的data属性
    const settings = response.data || response

    console.log('加载的设置数据:', settings)

    // 加载公告设置
    if (settings.announcement) {
      Object.assign(announcementForm, settings.announcement)
    }

    // 加载广告位设置
    if (settings.advertisement) {
      Object.assign(adForm, settings.advertisement)
    }

    // 加载签到设置
    if (settings.signin) {
      Object.assign(signinForm, settings.signin)
    }

    // 加载系统设置
    if (settings.system) {
      Object.assign(systemForm, settings.system)
    }

    message.success('设置加载成功')
  } catch (error: any) {
    console.error('加载设置失败:', error)
    message.error('加载设置失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 保存公告设置
const saveAnnouncementSettings = async () => {
  if (!announcementFormRef.value) return

  try {
    await announcementFormRef.value.validate()
    saving.value = true

    await ApiClient.put('/admin/settings/announcement', announcementForm)
    message.success('公告设置保存成功')
  } catch (error: any) {
    console.error('保存公告设置失败:', error)
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 保存广告位设置
const saveAdSettings = async () => {
  if (!adFormRef.value) return

  try {
    await adFormRef.value.validate()
    saving.value = true

    await ApiClient.put('/admin/settings/advertisement', adForm)
    message.success('广告位设置保存成功')
  } catch (error: any) {
    console.error('保存广告位设置失败:', error)
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 保存签到设置
const saveSigninSettings = async () => {
  if (!signinFormRef.value) return
  
  try {
    await signinFormRef.value.validate()
    saving.value = true
    
    await ApiClient.put('/admin/settings/signin', signinForm)
    message.success('签到设置保存成功')
  } catch (error: any) {
    console.error('保存签到设置失败:', error)
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 保存系统设置
const saveSystemSettings = async () => {
  if (!systemFormRef.value) return
  
  try {
    await systemFormRef.value.validate()
    saving.value = true
    
    await ApiClient.put('/admin/settings/system', systemForm)
    message.success('系统设置保存成功')
  } catch (error: any) {
    console.error('保存系统设置失败:', error)
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 广告位表格列配置
const adColumns = [
  {
    title: '广告标题',
    key: 'title',
    width: 150,
  },
  {
    title: '显示位置',
    key: 'position',
    width: 120,
    render: (row: any) => {
      const position = allPositions.find(p => p.value === row.position)
      return position ? position.label : row.position
    }
  },
  {
    title: '状态',
    key: 'enabled',
    width: 80,
    render: (row: any) => row.enabled ? '启用' : '禁用'
  },
  {
    title: '可关闭',
    key: 'closeable',
    width: 80,
    render: (row: any) => row.closeable ? '是' : '否'
  },
  {
    title: '自动关闭',
    key: 'auto_close',
    width: 80,
    render: (row: any) => row.auto_close ? '是' : '否'
  },
  {
    title: '排序',
    key: 'sort_order',
    width: 80,
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: any) => [
      h('n-button', {
        size: 'small',
        type: 'primary',
        style: { marginRight: '8px' },
        onClick: () => editAd(row)
      }, '编辑'),
      h('n-button', {
        size: 'small',
        type: row.enabled ? 'warning' : 'success',
        style: { marginRight: '8px' },
        onClick: () => toggleAdStatus(row)
      }, row.enabled ? '禁用' : '启用'),
      h('n-button', {
        size: 'small',
        type: 'error',
        onClick: () => deleteAd(row)
      }, '删除')
    ]
  }
]



// 广告位管理方法
const fetchAdList = async () => {
  try {
    adLoading.value = true
    console.log('🔍 获取广告位列表...')

    const response = await fetch('/api/v1/admin/advertisements', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    console.log('📋 广告位响应:', data)

    if (data.code === 200) {
      adList.value = data.data || []
      console.log('✅ 广告位列表获取成功，数量:', adList.value.length)
    } else {
      console.error('❌ API返回错误:', data.message)
      message.error(data.message || '获取广告位列表失败')
    }
  } catch (error) {
    console.error('❌ 获取广告位列表失败:', error)
    message.error('获取广告位列表失败')
  } finally {
    adLoading.value = false
  }
}

const handleAdSubmit = async () => {
  try {
    await adFormRef.value?.validate()
    submitting.value = true

    const url = editingAd.value
      ? `/api/v1/admin/advertisements/${editingAd.value.id}`
      : '/api/v1/admin/advertisements/'

    const method = editingAd.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(adForm)
    })

    const data = await response.json()
    if (data.code === 200 || data.code === 201) {
      message.success(editingAd.value ? '广告位更新成功' : '广告位创建成功')
      showCreateAdModal.value = false
      resetAdForm()
      await fetchAdList()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error: any) {
    console.error('广告位操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetAdForm = () => {
  Object.assign(adForm, {
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: '',
    enabled: true,
    closeable: true,
    auto_close: false,
    close_delay: 5,
    sort_order: 1,
  })
  editingAd.value = null
}

const openCreateAdModal = () => {
  resetAdForm()
  editingAd.value = null
  showCreateAdModal.value = true
}

const closeAdModal = () => {
  showCreateAdModal.value = false
  resetAdForm()
}

const editAd = (ad: any) => {
  Object.assign(adForm, ad)
  editingAd.value = ad
  showCreateAdModal.value = true
}

const toggleAdStatus = async (ad: any) => {
  try {
    const response = await fetch(`/api/v1/admin/advertisements/${ad.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...ad,
        enabled: !ad.enabled
      })
    })

    const data = await response.json()
    if (data.code === 200) {
      message.success(`广告位已${ad.enabled ? '禁用' : '启用'}`)
      await fetchAdList()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error: any) {
    console.error('切换广告位状态失败:', error)
    message.error('操作失败')
  }
}

const deleteAd = async (ad: any) => {
  try {
    const response = await fetch(`/api/v1/admin/advertisements/${ad.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    if (data.code === 200) {
      message.success('广告位删除成功')
      await fetchAdList()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error: any) {
    console.error('删除广告位失败:', error)
    message.error('删除失败')
  }
}

// 下载管理相关方法
const fetchSoftwareList = async () => {
  try {
    softwareLoading.value = true
    console.log('🔍 获取下载列表...')

    const response = await fetch('/api/v1/admin/downloads/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    console.log('📋 下载数据:', data)

    if (data.code === 200) {
      softwareList.value = data.data || []
      console.log('✅ 获取成功，数量:', softwareList.value.length)
    } else {
      console.error('❌ API返回错误:', data.message)
      message.error(data.message || '获取下载列表失败')
    }
  } catch (error) {
    console.error('❌ 获取下载列表失败:', error)
    message.error('获取下载列表失败')
  } finally {
    softwareLoading.value = false
  }
}

const handleSoftwareSubmit = async () => {
  try {
    await softwareFormRef.value?.validate()
    submitting.value = true

    const url = editingSoftware.value
      ? `/api/v1/admin/downloads/${editingSoftware.value.id}`
      : '/api/v1/admin/downloads/'

    const method = editingSoftware.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(softwareForm)
    })

    const data = await response.json()
    if (data.code === 200 || data.code === 201) {
      message.success(editingSoftware.value ? '下载项更新成功' : '下载项创建成功')
      showCreateModal.value = false
      resetSoftwareForm()
      await fetchSoftwareList()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (error: any) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetSoftwareForm = () => {
  Object.assign(softwareForm, {
    name: '',
    version: '',
    platform: '',
    architecture: '',
    download_url: '',
    file_size: '',
    description: '',
    is_active: true,
    is_quick: false,
    sort_order: 1,
  })
  editingSoftware.value = null
}

const editSoftware = (software: any) => {
  Object.assign(softwareForm, software)
  editingSoftware.value = software
  showCreateModal.value = true
}

const deleteSoftware = async (software: any) => {
  try {
    const response = await fetch(`/api/v1/admin/downloads/${software.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = await response.json()
    if (data.code === 200) {
      message.success('下载项删除成功')
      await fetchSoftwareList()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (error: any) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 软件表格列配置
const softwareColumns = [
  {
    title: '软件名称',
    key: 'name',
    width: 200,
  },
  {
    title: '版本',
    key: 'version',
    width: 100,
  },
  {
    title: '平台',
    key: 'platform',
    width: 100,
  },
  {
    title: '架构',
    key: 'architecture',
    width: 100,
  },
  {
    title: '状态',
    key: 'is_active',
    width: 80,
    render: (row: any) => row.is_active ? '启用' : '禁用'
  },
  {
    title: '快捷下载',
    key: 'is_quick',
    width: 100,
    render: (row: any) => row.is_quick ? '是' : '否'
  },
  {
    title: '排序',
    key: 'sort_order',
    width: 80,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => [
      h('n-button', {
        size: 'small',
        type: 'primary',
        style: { marginRight: '8px' },
        onClick: () => editSoftware(row)
      }, '编辑'),
      h('n-button', {
        size: 'small',
        type: 'error',
        onClick: () => deleteSoftware(row)
      }, '删除')
    ]
  }
]

// 软件表单验证规则
const softwareRules = {
  name: [
    { required: true, message: '请输入软件名称', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
  download_url: [
    { required: true, message: '请输入下载链接', trigger: 'blur' }
  ]
}

onMounted(() => {
  loadSettings()
  fetchSoftwareList()
  fetchAdList()
})
</script>

<style scoped>
.admin-system-settings {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.setting-card {
  margin-bottom: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #fafafa;
  border-radius: 8px;
  margin: 2rem 0;
}

.advertisement-management {
  width: 100%;
}

.ad-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.downloads-management {
  width: 100%;
}

.software-list {
  width: 100%;
}

.ad-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.ad-table {
  margin-top: 16px;
}
</style>
