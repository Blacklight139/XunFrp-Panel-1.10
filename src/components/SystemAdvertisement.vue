<template>
  <div v-if="advertisement && visible" class="system-advertisement" :class="positionClass">
    <div class="ad-content">
      <!-- 广告图片容器 -->
      <div v-if="advertisement.image_url" class="ad-image-container">
        <img :src="advertisement.image_url" :alt="advertisement.title" class="ad-image" @load="onImageLoad" />
      </div>

      <!-- 广告标题 -->
      <h3 v-if="advertisement.title" class="ad-title">{{ advertisement.title }}</h3>

      <!-- 广告内容 -->
      <div v-if="advertisement.content" class="ad-text" v-html="advertisement.content"></div>

      <!-- 关闭按钮 -->
      <button v-if="advertisement.closeable" @click="closeAd" class="ad-close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  position: string
}

const props = defineProps<Props>()

interface Advertisement {
  id: number
  title: string
  content: string
  image_url?: string
  link_url?: string
  position: string
  enabled: boolean
  closeable: boolean
  auto_close: boolean
  close_delay: number
}

const advertisement = ref<Advertisement | null>(null)
const visible = ref(false)

const positionClass = computed(() => {
  return `ad-${props.position}`
})

const fetchAdvertisement = async () => {
  try {
    const response = await fetch(`/api/v1/advertisements?position=${props.position}`)
    const data = await response.json()

    if (data.code === 200 && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // 过滤启用的广告位
      const enabledAds = data.data.filter((ad: Advertisement) => ad.enabled)

      if (enabledAds.length > 0) {
        advertisement.value = enabledAds[0]
        visible.value = true

        // 自动关闭
        if (advertisement.value.auto_close && advertisement.value.close_delay > 0) {
          setTimeout(() => {
            visible.value = false
          }, advertisement.value.close_delay * 1000)
        }
      }
    }
  } catch (error) {
    console.error('获取广告位失败:', error)
  }
}

const closeAd = () => {
  visible.value = false
}

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const container = img.parentElement as HTMLElement

  // 根据图片比例调整容器样式
  const aspectRatio = img.naturalWidth / img.naturalHeight

  if (aspectRatio > 1.5) {
    // 宽图片
    container.classList.add('wide-image')
  } else if (aspectRatio < 0.8) {
    // 高图片
    container.classList.add('tall-image')
  } else {
    // 方形图片
    container.classList.add('square-image')
  }
}

onMounted(() => {
  fetchAdvertisement()
})
</script>

<style scoped>
.system-advertisement {
  margin: 10px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
  position: relative;
}

.ad-content {
  padding: 0; /* 移除内边距，让图片可以完全填充 */
  position: relative;
  overflow: hidden;
}

.ad-image-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.ad-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px 8px 0 0; /* 只对顶部圆角 */
  margin: 0; /* 移除边距 */
  object-fit: cover;
  transition: transform 0.3s ease; /* 添加悬停效果 */
}

.ad-image:hover {
  transform: scale(1.02); /* 轻微放大效果 */
}

/* 不同比例图片的样式 */
.ad-image-container.wide-image .ad-image {
  object-fit: cover;
  height: 100px; /* 限制宽图片的高度 */
}

.ad-image-container.tall-image .ad-image {
  object-fit: cover;
  max-height: 200px; /* 限制高图片的最大高度 */
}

.ad-image-container.square-image .ad-image {
  object-fit: cover;
  max-height: 150px; /* 方形图片的高度 */
}

/* 如果有文字内容，添加内边距 */
.ad-title,
.ad-text {
  padding: 0 15px;
}

.ad-title {
  padding-top: 15px;
}

.ad-text {
  padding-bottom: 15px;
}

.ad-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.ad-text {
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}

.ad-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* 侧边栏广告位特定样式 */
.ad-left-sidebar,
.ad-right-sidebar {
  margin: 0 0 15px 0;
  max-width: 180px; /* 匹配新的宽度 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.ad-left-sidebar:hover,
.ad-right-sidebar:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.ad-left-sidebar .ad-content,
.ad-right-sidebar .ad-content {
  padding: 0; /* 移除内边距，让图片完全填充 */
}

.ad-left-sidebar .ad-title,
.ad-right-sidebar .ad-title {
  font-size: 13px;
  margin: 0;
  padding: 12px 12px 8px 12px;
  font-weight: 600;
  color: #1e293b;
}

.ad-left-sidebar .ad-text,
.ad-right-sidebar .ad-text {
  font-size: 11px;
  line-height: 1.4;
  padding: 0 12px 12px 12px;
  color: #64748b;
}

.ad-left-sidebar .ad-image-container,
.ad-right-sidebar .ad-image-container {
  width: 100%;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.ad-left-sidebar .ad-image,
.ad-right-sidebar .ad-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  margin: 0;
  border-radius: 0; /* 移除圆角，让图片完全填充 */
  transition: transform 0.3s ease;
}

.ad-left-sidebar .ad-image:hover,
.ad-right-sidebar .ad-image:hover {
  transform: scale(1.05);
}

/* 侧边栏不同比例图片的样式 */
.ad-left-sidebar .ad-image-container.wide-image .ad-image,
.ad-right-sidebar .ad-image-container.wide-image .ad-image {
  height: 80px; /* 侧边栏宽图片高度 */
}

.ad-left-sidebar .ad-image-container.tall-image .ad-image,
.ad-right-sidebar .ad-image-container.tall-image .ad-image {
  max-height: 160px; /* 侧边栏高图片最大高度 */
}

.ad-left-sidebar .ad-image-container.square-image .ad-image,
.ad-right-sidebar .ad-image-container.square-image .ad-image {
  height: 120px; /* 侧边栏方形图片高度 */
}

/* 纯图片广告样式 */
.ad-left-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)),
.ad-right-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)) {
  padding: 0;
}

.ad-left-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)) .ad-image-container,
.ad-right-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)) .ad-image-container {
  border-radius: 8px;
}

.ad-left-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)) .ad-image,
.ad-right-sidebar .ad-content:has(.ad-image-container):not(:has(.ad-title)):not(:has(.ad-text)) .ad-image {
  border-radius: 8px;
}

/* 位置样式 */
.ad-top-banner {
  margin: 0 0 20px 0;
}

.ad-bottom-banner {
  margin: 20px 0 0 0;
}

.ad-left-sidebar,
.ad-right-sidebar {
  max-width: 300px;
}

.ad-content-top {
  margin: 0 0 15px 0;
}

.ad-content-bottom {
  margin: 15px 0 0 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .ad-left-sidebar,
  .ad-right-sidebar {
    max-width: 100%;
  }
  
  .ad-content {
    padding: 10px;
  }
  
  .ad-title {
    font-size: 14px;
  }
  
  .ad-text {
    font-size: 13px;
  }
}
</style>
