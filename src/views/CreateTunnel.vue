<template>
  <div class="create-tunnel">
    <n-card title="创建隧道" size="large">
      <n-alert type="success" title="页面加载成功">
        创建隧道页面已正常加载，路由配置正确。
      </n-alert>

      <div style="margin-top: 16px;">
        <n-space>
          <n-button @click="$router.push('/dashboard/tunnels')">
            返回隧道列表
          </n-button>
          <n-button type="primary">
            开始创建隧道
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
// 最简单的脚本，确保页面能正常加载
</script>

<style scoped>
.create-tunnel {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
