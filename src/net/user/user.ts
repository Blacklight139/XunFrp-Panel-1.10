import { get, post, put, del } from '../request'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  ForgetParams,
  UserInfoResponse,
  UserTrafficResponse,
  TrafficTrendResponse,
  GroupResponse,
  SignResponse,
  BroadcastResponse,
  SoftwaresResponse,
  DownloadSourcesResponse,
  SoftwareVersionsResponse,
  ProductsResponse,
  BuyProductParams,
  BuyProductResponse,
  LogoutResponse,
  UpdateUsernameParams,
  UpdateUsernameResponse,
  UpdateNicknameResponse,
  UpdatePasswordParams,
  UpdatePasswordResponse,
  UpdateAvatarResponse,
  RealnameParams,
  SubmitRealnameResponse,
  GitHubCommitsResponse,
  CodeResponse,
} from './type'

// 登录
export function login(params: LoginParams): Promise<LoginResponse> {
  return post('/login', params)
}

// 注册
export function register(params: RegisterParams): Promise<CodeResponse> {
  return post('/register', params)
}

// 发送验证码
export function sendCode(email: string, type: string = 'register'): Promise<CodeResponse> {
  return post('/send-verify-code', { email, type })
}

// 忘记密码
export function forget(params: ForgetParams): Promise<CodeResponse> {
  return post('/password-reset/confirm', {
    email: params.email,
    new_password: params.password,
    verification_code: params.code
  })
}

// 获取用户信息
export function getUserInfo(): Promise<UserInfoResponse> {
  return get('/user/profile')
}

// 获取用户流量信息
export function getUserTraffic(): Promise<UserTrafficResponse> {
  return get('/user/traffic-history')
}

// 获取流量趋势
export function getTrafficTrend(): Promise<TrafficTrendResponse> {
  return get('/user/traffic-history')
}

// 获取用户组
export function getGroups(): Promise<GroupResponse> {
  return get('/user/profile')
}

// 签到
export function sign(): Promise<SignResponse> {
  return post('/user/sign-in')
}

// 获取公告
export function getBroadcast(): Promise<BroadcastResponse> {
  return get('/announcements')
}

// 获取软件列表
export function getSoftwares(): Promise<SoftwaresResponse> {
  return get('/client/available')
}

// 获取下载源
export function getDownloadSources(): Promise<DownloadSourcesResponse> {
  return get('/downloads')
}

// 获取软件版本
export function getSoftwareVersions(): Promise<SoftwareVersionsResponse> {
  return get('/downloads')
}

// 获取产品列表
export function getProducts(): Promise<ProductsResponse> {
  return get('/downloads')
}

// 购买产品
export function buyProduct(params: BuyProductParams): Promise<BuyProductResponse> {
  return post('/downloads', params)
}

// 登出
export function logout(): Promise<LogoutResponse> {
  return post('/user/logout')
}

// 更新用户名
export function updateUsername(params: UpdateUsernameParams): Promise<UpdateUsernameResponse> {
  return put('/user/profile', params)
}

// 更新昵称
export function updateNickname(nickname: string): Promise<UpdateNicknameResponse> {
  return put('/user/profile', { nickname })
}

// 更新密码
export function updatePassword(params: UpdatePasswordParams): Promise<UpdatePasswordResponse> {
  return put('/user/change-password', params)
}

// 更新头像
export function updateAvatar(avatar: File): Promise<UpdateAvatarResponse> {
  const formData = new FormData()
  formData.append('avatar', avatar)
  return post('/user/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 实名认证
export function submitRealname(params: RealnameParams): Promise<SubmitRealnameResponse> {
  return post('/user/verify-identity', params)
}

// 获取GitHub提交记录
export function getGitHubCommits(): Promise<GitHubCommitsResponse> {
  return get('/stats')
}

// 获取系统统计
export function getSystemStats(): Promise<any> {
  return get('/stats')
}

// 获取在线用户
export function getOnlineUsers(): Promise<any> {
  return get('/stats')
}

// 获取节点列表
export function getNodes(): Promise<any> {
  return get('/nodes')
}

// 获取隧道列表
export function getTunnels(): Promise<any> {
  return get('/tunnels')
}

// 创建隧道
export function createTunnel(params: any): Promise<any> {
  return post('/tunnels', params)
}

// 更新隧道
export function updateTunnel(id: number, params: any): Promise<any> {
  return put(`/tunnels/${id}`, params)
}

// 删除隧道
export function deleteTunnel(id: number): Promise<any> {
  return del(`/tunnels/${id}`)
}

// 启动隧道 - 这些API在当前后端中不存在，需要使用FRP相关的API
export function startTunnel(id: number): Promise<any> {
  return post(`/tunnels/${id}/start`)
}

// 停止隧道 - 这些API在当前后端中不存在，需要使用FRP相关的API
export function stopTunnel(id: number): Promise<any> {
  return post(`/tunnels/${id}/stop`)
}
