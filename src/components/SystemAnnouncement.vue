<template>
  <div v-if="announcement && announcement.enabled" class="system-announcement">
    <n-alert
      :title="announcement.title"
      :type="announcement.type"
      :closable="true"
      :show-icon="true"
      class="announcement-alert"
      @close="handleClose"
    >
      <div class="announcement-content">
        <div
          ref="contentRef"
          :class="['content-text', { 'collapsed': isCollapsed && shouldCollapse }]"
        >
          {{ announcement.content }}
        </div>
        <div v-if="shouldCollapse" class="expand-controls">
          <n-button
            text
            type="primary"
            size="small"
            @click="toggleCollapse"
          >
            {{ isCollapsed ? '展开' : '收起' }}
            <template #icon>
              <span>{{ isCollapsed ? '▼' : '▲' }}</span>
            </template>
          </n-button>
        </div>
      </div>
    </n-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ApiClient } from '@/utils/api'

interface AnnouncementSettings {
  enabled: boolean
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  show_on_homepage: boolean
  show_on_dashboard: boolean
  show_on_downloads: boolean
  auto_close: boolean
  close_delay: number
}

const props = defineProps<{
  position: 'homepage' | 'dashboard' | 'downloads'
}>()

const announcement = ref<AnnouncementSettings | null>(null)
const visible = ref(true)
const contentRef = ref<HTMLElement>()
const isCollapsed = ref(true)
const shouldCollapse = ref(false)

// 检查是否需要折叠
const checkShouldCollapse = async () => {
  await nextTick()
  if (contentRef.value && announcement.value) {
    // 计算文本行数
    const lineHeight = 20 // 假设每行20px
    const contentHeight = contentRef.value.scrollHeight
    const lines = Math.ceil(contentHeight / lineHeight)

    shouldCollapse.value = lines > 4
    isCollapsed.value = shouldCollapse.value
  }
}

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const fetchAnnouncement = async () => {
  try {
    const data = await ApiClient.get<AnnouncementSettings>('/system/announcement')

    // 根据位置判断是否显示
    if (data.enabled) {
      if (props.position === 'homepage' && data.show_on_homepage) {
        announcement.value = data
        await checkShouldCollapse()
      } else if (props.position === 'dashboard' && data.show_on_dashboard) {
        announcement.value = data
        await checkShouldCollapse()
      } else if (props.position === 'downloads' && data.show_on_downloads) {
        announcement.value = data
        await checkShouldCollapse()
      }

      // 自动关闭
      if (announcement.value && data.auto_close) {
        setTimeout(() => {
          visible.value = false
        }, data.close_delay * 1000)
      }
    }
  } catch (error) {
    console.error('获取系统公告失败:', error)
  }
}

const handleClose = () => {
  visible.value = false
}

onMounted(() => {
  fetchAnnouncement()
})
</script>

<style scoped>
.system-announcement {
  margin-bottom: 1rem;
}

.announcement-alert {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.announcement-content {
  position: relative;
}

.content-text {
  line-height: 1.5;
  transition: all 0.3s ease;
  white-space: pre-wrap;
  word-break: break-word;
}

.content-text.collapsed {
  max-height: 6em; /* 4行 × 1.5行高 */
  overflow: hidden;
  position: relative;
}

.content-text.collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.5em;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));
  pointer-events: none;
}

.expand-controls {
  margin-top: 8px;
  text-align: center;
}

.expand-controls .n-button {
  font-size: 12px;
}
</style>
