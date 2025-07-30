<template>
  <div class="profile-page">
    <div class="profile-grid">
      <!-- 左侧账户设置 -->
      <div class="left-panel">
        <n-card title="账户设置" class="settings-card">
          <div class="setting-item">
            <div class="setting-header">
              <h4>重置访问密钥</h4>
              <p>此操作不可逆，重置后所有客户端均需重新登录</p>
            </div>
            <n-button type="warning" @click="showResetKeyModal = true">
              重置密钥
            </n-button>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <h4>修改用户名</h4>
              <p>点击这里可以修改您的用户名</p>
            </div>
            <n-button @click="showUsernameModal = true">
              修改用户名
            </n-button>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <h4>更改头像</h4>
              <p>不支持上传图片文件，只要图片链接</p>
            </div>
            <n-button @click="showAvatarModal = true">
              更改头像
            </n-button>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <h4>修改密码</h4>
              <p>点击这里可以修改您的登录密码</p>
            </div>
            <n-button @click="showPasswordModal = true">
              修改密码
            </n-button>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <h4>更改邮箱</h4>
              <p>此操作风险较大，请谨慎操作</p>
            </div>
            <n-button type="warning" @click="showEmailModal = true">
              更改邮箱
            </n-button>
          </div>
        </n-card>
      </div>

      <!-- 右侧账户详情 -->
      <div class="right-panel">
        <n-card class="account-details-card">
          <template #header>
            <div class="card-header">
              <span>账户详情</span>
              <n-button
                text
                type="error"
                @click="showDeleteAccountModal = true"
                class="delete-btn"
              >
                <template #icon>
                  <n-icon><CloseOutline /></n-icon>
                </template>
              </n-button>
            </div>
          </template>

          <div class="account-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">用户名</span>
                <span class="value">{{ authStore.user?.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">用户 ID</span>
                <span class="value">{{ authStore.user?.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">实名认证</span>
                <n-tag :type="authStore.user?.is_verified ? 'success' : 'warning'">
                  {{ authStore.user?.is_verified ? '已认证' : '未认证' }}
                </n-tag>
              </div>
              <div class="info-item">
                <span class="label">用户组</span>
                <span class="value">{{ authStore.user?.user_group }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册时间</span>
                <span class="value">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册邮箱</span>
                <span class="value">{{ authStore.user?.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">隧道数量</span>
                <span class="value">{{ userStats.tunnelCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">剩余积分</span>
                <span class="value">{{ userStats.points || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="label">入站带宽</span>
                <span class="value">{{ userStats.inboundBandwidth || '无限制' }}</span>
              </div>
              <div class="info-item">
                <span class="label">出站带宽</span>
                <span class="value">{{ userStats.outboundBandwidth || '无限制' }}</span>
              </div>
            </div>

            <div class="access-key-section">
              <n-button
                @click="toggleAccessKey"
                :type="showAccessKey ? 'default' : 'primary'"
              >
                {{ showAccessKey ? '隐藏访问密钥' : '显示访问密钥' }}
              </n-button>
              
              <div v-if="showAccessKey" class="access-key">
                <n-input
                  :value="accessKey"
                  readonly
                  @click="copyAccessKey"
                  placeholder="点击复制访问密钥"
                />
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 重置访问密钥模态框 -->
    <n-modal v-model:show="showResetKeyModal">
      <n-card style="width: 500px;" title="警告" :bordered="false">
        <p>重置访问密钥后旧的配置文件均无法使用，这代表着您的所有隧道需要重新获取配置文件再启动、且所有保存登录的设备均需重新登录。</p>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showResetKeyModal = false">取消</n-button>
            <n-button type="error" @click="handleResetKey">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 修改用户名模态框 -->
    <n-modal v-model:show="showUsernameModal">
      <n-card style="width: 400px;" title="修改用户名" :bordered="false">
        <n-form ref="usernameFormRef" :model="usernameForm" :rules="usernameRules">
          <n-form-item path="username" label="新用户名">
            <n-input v-model:value="usernameForm.username" placeholder="请输入新用户名" />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showUsernameModal = false">取消</n-button>
            <n-button type="primary" @click="handleUpdateUsername">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 更改头像模态框 -->
    <n-modal v-model:show="showAvatarModal">
      <n-card style="width: 400px;" title="更改头像" :bordered="false">
        <n-alert type="info" style="margin-bottom: 16px;">
          图片链接仅支持直链，且无反盗链的链接
        </n-alert>
        <n-form ref="avatarFormRef" :model="avatarForm" :rules="avatarRules">
          <n-form-item path="avatar" label="头像链接">
            <n-input v-model:value="avatarForm.avatar" placeholder="请输入图片链接" />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showAvatarModal = false">取消</n-button>
            <n-button type="primary" @click="handleUpdateAvatar">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 修改密码模态框 -->
    <n-modal v-model:show="showPasswordModal">
      <n-card style="width: 400px;" title="修改密码" :bordered="false">
        <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules">
          <n-form-item path="oldPassword" label="原密码">
            <n-input
              v-model:value="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item path="newPassword" label="新密码">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item path="confirmPassword" label="确认密码">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password-on="click"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showPasswordModal = false">取消</n-button>
            <n-button type="primary" @click="handleUpdatePassword">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 更改邮箱模态框 -->
    <n-modal v-model:show="showEmailModal">
      <n-card style="width: 400px;" title="更改邮箱" :bordered="false">
        <n-form ref="emailFormRef" :model="emailForm" :rules="emailRules">
          <n-form-item path="oldEmailCode" label="旧邮箱验证码">
            <div class="code-input-group">
              <n-input v-model:value="emailForm.oldEmailCode" placeholder="请输入验证码" />
              <n-button @click="sendOldEmailCode" :disabled="oldEmailCodeSending">
                {{ oldEmailCodeSending ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
          </n-form-item>
          <n-form-item path="newEmail" label="新邮箱">
            <n-input v-model:value="emailForm.newEmail" placeholder="请输入新邮箱" />
          </n-form-item>
          <n-form-item path="newEmailCode" label="新邮箱验证码">
            <div class="code-input-group">
              <n-input v-model:value="emailForm.newEmailCode" placeholder="请输入验证码" />
              <n-button @click="sendNewEmailCode" :disabled="newEmailCodeSending">
                {{ newEmailCodeSending ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showEmailModal = false">取消</n-button>
            <n-button type="primary" @click="handleUpdateEmail">确定</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 注销账户模态框 -->
    <n-modal v-model:show="showDeleteAccountModal">
      <n-card style="width: 500px;" title="注销账户" :bordered="false">
        <n-alert type="error" style="margin-bottom: 16px;">
          注销账户后，您在本站的所有信息将被永久删除，无法恢复。注销账户后该服务将终止。请注意，账户注销后，您将不再受当前的服务条款和隐私策略约束，但与账户注销前产生的事务相关的法律义务仍将继续适用。
        </n-alert>
        
        <div v-if="deleteCountdown > 0" class="countdown">
          请仔细阅读上述内容，{{ deleteCountdown }} 秒后可以操作
        </div>
        
        <n-form v-else ref="deleteFormRef" :model="deleteForm" :rules="deleteRules">
          <n-form-item path="emailCode" label="邮箱验证码">
            <p style="margin-bottom: 8px; color: #666;">为了确保安全，我们需要对您的邮箱发送验证码，以确认本人操作。</p>
            <div class="code-input-group">
              <n-input v-model:value="deleteForm.emailCode" placeholder="请输入验证码" />
              <n-button @click="sendDeleteEmailCode" :disabled="deleteEmailCodeSending">
                {{ deleteEmailCodeSending ? '发送中...' : '发送验证码' }}
              </n-button>
            </div>
          </n-form-item>
        </n-form>
        
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showDeleteAccountModal = false">取消</n-button>
            <n-button
              v-if="deleteCountdown === 0"
              type="error"
              @click="showFinalDeleteModal = true"
              :disabled="!deleteForm.emailCode"
            >
              执行注销
            </n-button>
          </div>
        </template>
      </n-card>
    </n-modal>

    <!-- 最终确认注销模态框 -->
    <n-modal v-model:show="showFinalDeleteModal">
      <n-card style="width: 400px;" title="最后确认" :bordered="false">
        <n-alert type="error">
          注销账户立即执行，请确认注销，这是最后一道提示。
        </n-alert>
        <template #footer>
          <div class="modal-footer">
            <n-button @click="showFinalDeleteModal = false">取消</n-button>
            <n-button type="error" @click="handleDeleteAccount">确定注销</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CloseOutline } from '@vicons/ionicons5'
import { ApiClient } from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showAccessKey = ref(false)
const accessKey = ref('')
const userStats = ref({
  tunnelCount: 0,
  points: 0,
  inboundBandwidth: '',
  outboundBandwidth: ''
})

// 模态框显示状态
const showResetKeyModal = ref(false)
const showUsernameModal = ref(false)
const showAvatarModal = ref(false)
const showPasswordModal = ref(false)
const showEmailModal = ref(false)
const showDeleteAccountModal = ref(false)
const showFinalDeleteModal = ref(false)

// 表单数据
const usernameForm = reactive({ username: '' })
const avatarForm = reactive({ avatar: '' })
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const emailForm = reactive({
  oldEmailCode: '',
  newEmail: '',
  newEmailCode: ''
})
const deleteForm = reactive({ emailCode: '' })

// 验证码发送状态
const oldEmailCodeSending = ref(false)
const newEmailCodeSending = ref(false)
const deleteEmailCodeSending = ref(false)

// 注销倒计时
const deleteCountdown = ref(5)
let deleteTimer: NodeJS.Timeout | null = null

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 切换访问密钥显示
const toggleAccessKey = async () => {
  if (!showAccessKey.value) {
    try {
      const response = await ApiClient.get('/user/access-key')
      if (response.code === 200) {
        accessKey.value = response.data.key
        showAccessKey.value = true
      }
    } catch (error) {
      console.error('获取访问密钥失败:', error)
      window.$message?.error('获取访问密钥失败')
    }
  } else {
    showAccessKey.value = false
    accessKey.value = ''
  }
}

// 复制访问密钥
const copyAccessKey = async () => {
  try {
    await navigator.clipboard.writeText(accessKey.value)
    window.$message?.success('访问密钥已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    window.$message?.error('复制失败，请手动复制')
  }
}

// 处理重置访问密钥
const handleResetKey = async () => {
  try {
    const response = await ApiClient.post('/user/reset-access-key')
    if (response.code === 200) {
      window.$message?.success('访问密钥重置成功')
      showResetKeyModal.value = false
      showAccessKey.value = false
      accessKey.value = ''
    }
  } catch (error) {
    console.error('重置访问密钥失败:', error)
    window.$message?.error('重置访问密钥失败')
  }
}

// 获取用户统计
const fetchUserStats = async () => {
  try {
    const response = await ApiClient.get('/user/stats')
    if (response.code === 200) {
      userStats.value = response.data
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 开始注销倒计时
const startDeleteCountdown = () => {
  deleteTimer = setInterval(() => {
    deleteCountdown.value--
    if (deleteCountdown.value <= 0) {
      if (deleteTimer) {
        clearInterval(deleteTimer)
        deleteTimer = null
      }
    }
  }, 1000)
}

// 监听注销模态框显示
const handleDeleteModalShow = () => {
  if (showDeleteAccountModal.value) {
    deleteCountdown.value = 5
    startDeleteCountdown()
  } else {
    if (deleteTimer) {
      clearInterval(deleteTimer)
      deleteTimer = null
    }
  }
}

onMounted(() => {
  fetchUserStats()
})

onUnmounted(() => {
  if (deleteTimer) {
    clearInterval(deleteTimer)
  }
})

// 监听模态框变化
watch(showDeleteAccountModal, handleDeleteModalShow)
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-panel {
  grid-column: 1;
}

.right-panel {
  grid-column: 2;
}

.settings-card {
  height: fit-content;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
}

.setting-header p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.account-details-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.delete-btn {
  color: #d03050 !important;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
}

.access-key-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 1.5rem;
}

.access-key {
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.code-input-group {
  display: flex;
  gap: 0.5rem;
}

.code-input-group .n-input {
  flex: 1;
}

.countdown {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .left-panel,
  .right-panel {
    grid-column: 1;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .code-input-group {
    flex-direction: column;
  }
}
</style>
