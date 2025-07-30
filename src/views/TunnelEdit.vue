<template>
  <div class="tunnel-edit">
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item @click="$router.push('/dashboard/tunnels')">
          隧道管理
        </n-breadcrumb-item>
        <n-breadcrumb-item>
          编辑隧道
        </n-breadcrumb-item>
      </n-breadcrumb>
      
      <h1 class="page-title">编辑隧道</h1>
      <p class="page-description">修改隧道配置</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-container">
      <n-steps :current="2" status="process">
        <n-step title="选择节点" description="节点已选择" />
        <n-step title="配置隧道" description="修改隧道参数" />
        <n-step title="完成" description="保存修改" />
      </n-steps>
    </div>

    <!-- 编辑内容 -->
    <div class="edit-content">
      <TunnelConfigForm
        v-if="tunnelData"
        :selected-node="tunnelData.node"
        :is-edit="true"
        :edit-data="tunnelData"
        @back="goBack"
        @cancel="goBack"
        @success="onEditSuccess"
      />
      
      <div v-else class="loading-state">
        <n-spin size="large">
          <template #description>
            正在加载隧道数据...
          </template>
        </n-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { ApiClient } from '@/utils/api'
import TunnelConfigForm from '@/components/tunnel/TunnelConfigForm.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const tunnelData = ref<any>(null)

// 获取隧道数据
const fetchTunnelData = async () => {
  try {
    const tunnelId = route.params.id
    const data = await ApiClient.get(`/tunnels/${tunnelId}`)
    tunnelData.value = data
  } catch (error: any) {
    console.error('获取隧道数据失败:', error)
    message.error('获取隧道数据失败')
    router.push('/dashboard/tunnels')
  }
}

// 编辑成功
const onEditSuccess = () => {
  message.success('隧道修改成功')
  router.push('/dashboard/tunnels')
}

// 返回
const goBack = () => {
  router.push('/dashboard/tunnels')
}

onMounted(() => {
  fetchTunnelData()
})
</script>

<style scoped>
.tunnel-edit {
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
  margin: 8px 0 4px 0;
  color: #333;
}

.page-description {
  color: #666;
  margin: 0;
}

.steps-container {
  margin-bottom: 32px;
  padding: 0 24px;
}

.edit-content {
  min-height: 400px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
