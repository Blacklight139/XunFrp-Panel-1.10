<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    title="人机验证"
    :mask-closable="false"
    :close-on-esc="false"
    style="width: 400px"
  >
    <div class="captcha-container">
      <p class="captcha-tip">请完成人机验证以继续操作</p>
      <div id="captcha-box" class="captcha-box"></div>
    </div>
    
    <template #action>
      <n-button @click="handleCancel">取消</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

// 扩展Window类型
declare global {
  interface Window {
    captcha68Api?: any
  }
}

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'success', token: string): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
let captchaInstance: any = null

// 监听show属性变化
watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) {
    nextTick(() => {
      initCaptcha()
    })
  } else {
    destroyCaptcha()
  }
})

// 监听visible变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:show', newVal)
})

// 初始化验证码
const initCaptcha = () => {
  if (!window.captcha68Api) {
    console.error('人机验证API未加载')
    return
  }

  const box = document.getElementById('captcha-box')
  if (!box) {
    console.error('验证码容器未找到')
    return
  }

  // 清空容器
  box.innerHTML = ''

  try {
    captchaInstance = window.captcha68Api.init(box, function(token: string) {
      console.log('人机验证成功，token:', token)
      emit('success', token)
      visible.value = false
    }, {
      appId: '6853'  // 使用提供的appId
    })
  } catch (error) {
    console.error('初始化人机验证失败:', error)
  }
}

// 销毁验证码实例
const destroyCaptcha = () => {
  if (captchaInstance && captchaInstance.destroy) {
    try {
      captchaInstance.destroy()
    } catch (error) {
      console.error('销毁验证码实例失败:', error)
    }
  }
  captchaInstance = null
  
  // 清空容器
  const box = document.getElementById('captcha-box')
  if (box) {
    box.innerHTML = ''
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped>
.captcha-container {
  padding: 1rem 0;
  text-align: center;
}

.captcha-tip {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.captcha-box {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.captcha-box:empty::before {
  content: '正在加载人机验证...';
  color: #999;
  font-size: 0.9rem;
}
</style>
