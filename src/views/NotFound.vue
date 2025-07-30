<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <div class="error-code">404</div>
        <h1 class="title">页面不存在</h1>
        <p class="description">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div class="actions">
          <n-button type="primary" @click="$router.push('/')">
            返回首页
          </n-button>
          <n-button @click="$router.back()">
            返回上页
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面组件
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.container {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #2c5aa0;
  line-height: 1;
  margin-bottom: 1rem;
}

.title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 6rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
