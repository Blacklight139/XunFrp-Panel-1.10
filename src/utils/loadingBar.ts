// 全局进度条管理器
export class LoadingBarManager {
  private static instance: LoadingBarManager
  private loadingBar: any = null
  private isInitialized = false
  private retryCount = 0
  private maxRetries = 10

  private constructor() {}

  static getInstance(): LoadingBarManager {
    if (!LoadingBarManager.instance) {
      LoadingBarManager.instance = new LoadingBarManager()
    }
    return LoadingBarManager.instance
  }

  // 初始化进度条API
  init(loadingBarRef: any) {
    console.log('尝试初始化进度条API:', loadingBarRef)

    // 检查多种可能的引用路径
    let loadingBarInst = null

    if (loadingBarRef && loadingBarRef.loadingBarInstRef) {
      loadingBarInst = loadingBarRef.loadingBarInstRef
    } else if (loadingBarRef && loadingBarRef.value && loadingBarRef.value.loadingBarInstRef) {
      loadingBarInst = loadingBarRef.value.loadingBarInstRef
    } else if (loadingBarRef && typeof loadingBarRef.start === 'function') {
      loadingBarInst = loadingBarRef
    }

    if (loadingBarInst && typeof loadingBarInst.start === 'function') {
      this.loadingBar = loadingBarInst
      this.isInitialized = true
      window.loadingBar = this.loadingBar
      console.log('进度条API已初始化:', this.loadingBar)
      console.log('进度条API方法:', Object.keys(this.loadingBar))
      return true
    }

    console.warn('进度条API初始化失败，loadingBarRef:', loadingBarRef)
    return false
  }

  // 延迟初始化
  async delayedInit(loadingBarRef: any): Promise<boolean> {
    return new Promise((resolve) => {
      const tryInit = () => {
        if (this.init(loadingBarRef)) {
          resolve(true)
          return
        }

        this.retryCount++
        if (this.retryCount < this.maxRetries) {
          console.log(`进度条初始化重试 ${this.retryCount}/${this.maxRetries}`)
          setTimeout(tryInit, 100)
        } else {
          console.error('进度条初始化失败，已达到最大重试次数')
          resolve(false)
        }
      }

      tryInit()
    })
  }

  // 检查是否已初始化
  isReady(): boolean {
    return this.isInitialized && 
           this.loadingBar && 
           typeof this.loadingBar.start === 'function'
  }

  // 启动进度条
  start(): boolean {
    if (this.isReady()) {
      try {
        this.loadingBar.start()
        return true
      } catch (error) {
        console.error('启动进度条失败:', error)
        return false
      }
    } else {
      console.warn('进度条API未就绪')
      return false
    }
  }

  // 完成进度条
  finish(): boolean {
    if (this.isReady()) {
      try {
        this.loadingBar.finish()
        return true
      } catch (error) {
        console.error('完成进度条失败:', error)
        return false
      }
    } else {
      console.warn('进度条API未就绪')
      return false
    }
  }

  // 错误进度条
  error(): boolean {
    if (this.isReady()) {
      try {
        this.loadingBar.error()
        return true
      } catch (error) {
        console.error('显示错误进度条失败:', error)
        return false
      }
    } else {
      console.warn('进度条API未就绪')
      return false
    }
  }

  // 获取调试信息
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      hasLoadingBar: !!this.loadingBar,
      isReady: this.isReady(),
      retryCount: this.retryCount,
      loadingBarMethods: this.loadingBar ? Object.keys(this.loadingBar) : [],
      windowLoadingBar: !!window.loadingBar
    }
  }
}

// 导出单例实例
export const loadingBarManager = LoadingBarManager.getInstance()
