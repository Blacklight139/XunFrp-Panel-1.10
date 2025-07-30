// 动画组合式函数
import { onMounted, onUnmounted, nextTick } from 'vue'
import AOS from 'aos'

// 页面动画钩子
export const usePageAnimation = () => {
  onMounted(() => {
    // 确保DOM已渲染完成后刷新AOS
    nextTick(() => {
      AOS.refresh()
    })
  })
  
  onUnmounted(() => {
    // 清理动画
    AOS.refresh()
  })
  
  return {
    refreshAnimations: () => AOS.refresh()
  }
}

// 列表动画钩子
export const useListAnimation = (delay = 100) => {
  const animateItems = (items: NodeListOf<Element> | Element[]) => {
    Array.from(items).forEach((item, index) => {
      item.setAttribute('data-aos', 'fade-up')
      item.setAttribute('data-aos-delay', String(index * delay))
    })
    AOS.refresh()
  }
  
  return {
    animateItems
  }
}

// 表单动画钩子
export const useFormAnimation = () => {
  const animateFormFields = (formElement: Element) => {
    const fields = formElement.querySelectorAll('.n-form-item')
    fields.forEach((field, index) => {
      field.setAttribute('data-aos', 'fade-up')
      field.setAttribute('data-aos-delay', String(index * 100))
    })
    AOS.refresh()
  }
  
  return {
    animateFormFields
  }
}

// 卡片动画钩子
export const useCardAnimation = () => {
  const animateCards = (cardSelector: string, staggerDelay = 100) => {
    const cards = document.querySelectorAll(cardSelector)
    cards.forEach((card, index) => {
      card.setAttribute('data-aos', 'fade-up')
      card.setAttribute('data-aos-delay', String(index * staggerDelay))
    })
    AOS.refresh()
  }
  
  return {
    animateCards
  }
}

// 路由动画钩子
export const useRouteAnimation = () => {
  onMounted(() => {
    // 页面加载时刷新动画
    setTimeout(() => {
      AOS.refresh()
    }, 100)
  })
  
  return {
    refreshOnRoute: () => {
      nextTick(() => {
        AOS.refresh()
      })
    }
  }
}
