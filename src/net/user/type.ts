// 基础响应类型
export interface BaseResponse {
  code: number
  message: string
}

export interface CodeResponse extends BaseResponse {
  data?: any
}

// 登录相关类型
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
  url?: string
}

export interface LoginResponse extends BaseResponse {
  data: {
    token: string
    user: {
      id: number
      username: string
      email: string
      nickname?: string
      user_group: string
      is_active: boolean
      is_verified: boolean
    }
  }
  expires?: number
}

export interface LoginInfo {
  email: string
  username: string
  nickname?: string
  user_group: string
  is_active: boolean
  is_verified: boolean
}

// 注册相关类型
export interface RegisterParams {
  username: string
  nickname?: string
  password: string
  email: string
  code: string
}

// 忘记密码类型
export interface ForgetParams {
  email: string
  password: string
  code: string
}

// 用户信息类型
export interface UserInfoResponse extends BaseResponse {
  data: {
    id: number
    username: string
    email: string
    nickname?: string
    user_group: string
    is_active: boolean
    is_verified: boolean
    created_at: string
    updated_at: string
  }
}

// 用户流量类型
export interface UserTrafficResponse extends BaseResponse {
  data: {
    used_traffic: number
    total_traffic: number
    remaining_traffic: number
    today_traffic: number
  }
}

// 流量趋势类型
export interface TrafficTrendResponse extends BaseResponse {
  data: Array<{
    date: string
    traffic: number
  }>
}

// 用户组类型
export interface GroupResponse extends BaseResponse {
  data: Array<{
    id: number
    name: string
    description: string
  }>
}

// 签到类型
export interface SignResponse extends BaseResponse {
  data: {
    signed: boolean
    reward?: number
    consecutive_days: number
  }
}

// 公告类型
export interface BroadcastResponse extends BaseResponse {
  data: Array<{
    id: number
    title: string
    content: string
    type: string
    created_at: string
  }>
}

// 软件下载类型
export interface SoftwaresResponse extends BaseResponse {
  data: Array<{
    id: number
    name: string
    platform: string
    architecture: string
    version: string
    download_url: string
    size: number
  }>
}

// 下载源类型
export interface DownloadSourcesResponse extends BaseResponse {
  data: Array<{
    id: number
    name: string
    url: string
    description: string
  }>
}

// 软件版本类型
export interface SoftwareVersionsResponse extends BaseResponse {
  data: Array<{
    version: string
    release_date: string
    changelog: string
  }>
}

// 产品类型
export interface ProductsResponse extends BaseResponse {
  data: Array<{
    id: number
    name: string
    description: string
    price: number
    traffic: number
    duration: number
  }>
}

// 购买产品类型
export interface BuyProductParams {
  product_id: number
  payment_method: string
}

export interface BuyProductResponse extends BaseResponse {
  data: {
    order_id: string
    payment_url?: string
  }
}

// 登出类型
export interface LogoutResponse extends BaseResponse {}

// 更新用户名类型
export interface UpdateUsernameParams {
  username: string
}

export interface UpdateUsernameResponse extends BaseResponse {}

// 更新昵称类型
export interface UpdateNicknameResponse extends BaseResponse {}

// 更新密码类型
export interface UpdatePasswordParams {
  old_password: string
  new_password: string
}

export interface UpdatePasswordResponse extends BaseResponse {}

// 更新头像类型
export interface UpdateAvatarResponse extends BaseResponse {}

// 实名认证类型
export interface RealnameParams {
  real_name: string
  id_card: string
}

export interface SubmitRealnameResponse extends BaseResponse {}

// GitHub提交类型
export interface GitHubCommitsResponse extends BaseResponse {
  data: Array<{
    sha: string
    commit: {
      message: string
      author: {
        name: string
        date: string
      }
    }
  }>
}
