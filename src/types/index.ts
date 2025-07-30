// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  access_key: string
  user_group: UserGroup
  is_active: boolean
  is_banned: boolean
  ban_reason?: string
  banned_at?: string
  real_name?: string
  id_card?: string
  is_verified: boolean
  verified_at?: string
  inbound_bandwidth: number
  outbound_bandwidth: number
  tunnel_limit: number
  traffic_used: number
  traffic_limit: number
  last_sign_in?: string
  sign_in_days: number
  total_sign_in: number
  points?: number
  created_at: string
  updated_at: string
}

export type UserGroup = 'unverified' | 'verified' | 'sponsor' | 'admin'

// 节点相关类型
export interface Node {
  id: number
  name: string
  description: string
  server_addr: string
  server_port: number
  status: NodeStatus
  is_active: boolean
  is_banned: boolean
  total_inbound: number
  total_outbound: number
  today_inbound: number
  today_outbound: number
  online_users: number
  online_tunnels: number
  max_tunnels: number
  max_bandwidth: number
  country: string
  region: string
  city: string
  allowed_user_groups: string
  last_heartbeat?: string
  created_at: string
  updated_at: string
}

export type NodeStatus = 'online' | 'offline' | 'banned' | 'disabled'

// 隧道相关类型
export interface Tunnel {
  id: number
  user_id: number
  node_id: number
  name: string
  type: TunnelType
  status: TunnelStatus
  local_ip: string
  local_port: number
  remote_port?: number
  custom_domains?: string
  use_encryption: boolean
  use_compression: boolean
  plugin_local_addr?: string
  plugin_crt_path?: string
  plugin_key_path?: string
  is_active: boolean
  is_banned: boolean
  error_message?: string
  inbound_traffic: number
  outbound_traffic: number
  today_inbound: number
  today_outbound: number
  current_connections: number
  total_connections: number
  last_connected?: string
  created_at: string
  updated_at: string
  user?: User
  node?: Node
}

export type TunnelType = 'tcp' | 'udp' | 'http' | 'https'
export type TunnelStatus = 'offline' | 'online' | 'banned' | 'error'

// 公告相关类型
export interface Announcement {
  id: number
  title: string
  content: string
  type: AnnouncementType
  is_active: boolean
  is_top: boolean
  created_at: string
  updated_at: string
}

export type AnnouncementType = 'info' | 'warning' | 'error' | 'success'

// 流量记录类型
export interface TrafficRecord {
  id: number
  user_id: number
  tunnel_id: number
  node_id: number
  inbound_bytes: number
  outbound_bytes: number
  record_time: string
  created_at: string
}

// 系统统计类型
export interface SystemStats {
  total_users: number
  online_users: number
  total_nodes: number
  online_nodes: number
  total_tunnels: number
  online_tunnels: number
  today_inbound: number
  today_outbound: number
  total_inbound: number
  total_outbound: number
  today_new_users: number
  today_new_tunnels: number
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  error?: string  // 添加可选的error字段
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 注册请求类型
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirm_password: string
  verify_code: string
}

// 登录响应类型
export interface LoginResponse {
  token: string
  user: User
  expires_in: number
}

// 创建隧道请求类型
export interface CreateTunnelRequest {
  node_id: number
  name: string
  type: TunnelType
  local_ip: string
  local_port: number
  remote_port?: number
  custom_domains?: string
  use_encryption?: boolean
  use_compression?: boolean
  plugin_local_addr?: string
  plugin_crt_path?: string
  plugin_key_path?: string
}

// 流量历史数据类型
export interface TrafficHistoryData {
  date: string
  inbound: number
  outbound: number
}

// 下载链接类型
export interface DownloadLinks {
  windows: Record<string, string>
  linux: Record<string, string>
  darwin: Record<string, string>
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  icon?: string
  hidden?: boolean
}

// 菜单项类型
export interface MenuItem {
  key: string
  label: string
  icon?: string
  children?: MenuItem[]
  disabled?: boolean
  show?: boolean
}
