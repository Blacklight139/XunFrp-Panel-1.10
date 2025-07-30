// AOS动画配置工具
import AOS from 'aos'

// AOS动画类型定义
export type AOSAnimation = 
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-up-right'
  | 'fade-up-left'
  | 'fade-down-right'
  | 'fade-down-left'
  | 'flip-up'
  | 'flip-down'
  | 'flip-left'
  | 'flip-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-in-up'
  | 'zoom-in-down'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'zoom-out'
  | 'zoom-out-up'
  | 'zoom-out-down'
  | 'zoom-out-left'
  | 'zoom-out-right'

// AOS配置选项
export interface AOSOptions {
  duration?: number
  delay?: number
  easing?: string
  once?: boolean
  mirror?: boolean
  offset?: number
  anchorPlacement?: string
}

// 默认AOS配置
export const defaultAOSConfig: AOSOptions = {
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  mirror: false,
  offset: 100,
  delay: 0,
  anchorPlacement: 'top-bottom'
}

// 预设动画配置
export const animationPresets = {
  // 页面进入动画
  pageEnter: {
    header: { animation: 'fade-down', duration: 800, delay: 0 },
    content: { animation: 'fade-up', duration: 800, delay: 200 },
    sidebar: { animation: 'fade-right', duration: 800, delay: 400 }
  },
  
  // 卡片动画
  card: {
    single: { animation: 'fade-up', duration: 600, delay: 0 },
    staggered: (index: number) => ({
      animation: 'fade-up',
      duration: 600,
      delay: index * 100
    })
  },
  
  // 表单动画
  form: {
    container: { animation: 'fade-up', duration: 1000, delay: 0 },
    header: { animation: 'fade-down', duration: 800, delay: 200 },
    fields: { animation: 'fade-up', duration: 800, delay: 400 }
  },
  
  // 列表动画
  list: {
    container: { animation: 'fade-up', duration: 800, delay: 0 },
    item: (index: number) => ({
      animation: 'fade-up',
      duration: 600,
      delay: index * 50
    })
  },
  
  // 模态框动画
  modal: {
    backdrop: { animation: 'fade', duration: 300, delay: 0 },
    content: { animation: 'zoom-in', duration: 400, delay: 100 }
  }
}

// 初始化AOS
export const initAOS = (options?: AOSOptions) => {
  AOS.init({
    ...defaultAOSConfig,
    ...options
  })
}

// 刷新AOS
export const refreshAOS = () => {
  AOS.refresh()
}

// 生成AOS属性
export const generateAOSProps = (
  animation: AOSAnimation,
  options?: AOSOptions
) => {
  const props: Record<string, string | number> = {
    'data-aos': animation
  }
  
  if (options?.duration) {
    props['data-aos-duration'] = options.duration
  }
  
  if (options?.delay) {
    props['data-aos-delay'] = options.delay
  }
  
  if (options?.easing) {
    props['data-aos-easing'] = options.easing
  }
  
  if (options?.once !== undefined) {
    props['data-aos-once'] = options.once
  }
  
  if (options?.mirror !== undefined) {
    props['data-aos-mirror'] = options.mirror
  }
  
  if (options?.offset) {
    props['data-aos-offset'] = options.offset
  }
  
  if (options?.anchorPlacement) {
    props['data-aos-anchor-placement'] = options.anchorPlacement
  }
  
  return props
}

// Vue组合式函数：使用AOS
export const useAOS = () => {
  const addAnimation = (
    element: HTMLElement,
    animation: AOSAnimation,
    options?: AOSOptions
  ) => {
    const props = generateAOSProps(animation, options)
    
    Object.entries(props).forEach(([key, value]) => {
      element.setAttribute(key, String(value))
    })
    
    // 刷新AOS以应用新动画
    refreshAOS()
  }
  
  const removeAnimation = (element: HTMLElement) => {
    const aosAttributes = [
      'data-aos',
      'data-aos-duration',
      'data-aos-delay',
      'data-aos-easing',
      'data-aos-once',
      'data-aos-mirror',
      'data-aos-offset',
      'data-aos-anchor-placement'
    ]
    
    aosAttributes.forEach(attr => {
      element.removeAttribute(attr)
    })
    
    refreshAOS()
  }
  
  return {
    addAnimation,
    removeAnimation,
    refreshAOS,
    generateAOSProps,
    animationPresets
  }
}

// 动画工具函数
export const animationUtils = {
  // 为列表项添加交错动画
  staggerList: (selector: string, baseDelay = 0, increment = 100) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element, index) => {
      element.setAttribute('data-aos', 'fade-up')
      element.setAttribute('data-aos-delay', String(baseDelay + index * increment))
    })
    refreshAOS()
  },
  
  // 为网格项添加动画
  animateGrid: (selector: string, animation: AOSAnimation = 'fade-up') => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element, index) => {
      element.setAttribute('data-aos', animation)
      element.setAttribute('data-aos-delay', String(index * 100))
    })
    refreshAOS()
  },
  
  // 为表单字段添加动画
  animateForm: (formSelector: string) => {
    const form = document.querySelector(formSelector)
    if (!form) return
    
    const fields = form.querySelectorAll('.n-form-item, .form-item')
    fields.forEach((field, index) => {
      field.setAttribute('data-aos', 'fade-up')
      field.setAttribute('data-aos-delay', String(index * 100))
    })
    refreshAOS()
  }
}

export default {
  initAOS,
  refreshAOS,
  generateAOSProps,
  useAOS,
  animationPresets,
  animationUtils
}
