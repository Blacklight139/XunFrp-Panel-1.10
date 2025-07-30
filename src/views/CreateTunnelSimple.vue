<template>
  <div class="create-tunnel">
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item @click="$router.push('/dashboard/tunnels')">
          隧道管理
        </n-breadcrumb-item>
        <n-breadcrumb-item>
          创建隧道
        </n-breadcrumb-item>
      </n-breadcrumb>
      
      <h1 class="page-title">创建隧道</h1>
    </div>

    <n-card title="创建隧道" size="large">
      <n-alert type="info" style="margin-bottom: 16px;">
        这是简化版的创建隧道页面，用于测试路由是否正常工作。
      </n-alert>
      
      <n-space>
        <n-button @click="$router.push('/dashboard/tunnels')">
          返回隧道列表
        </n-button>
        <n-button type="primary">
          创建隧道
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.create-tunnel {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 0 0;
  color: #333;
}
</style>
