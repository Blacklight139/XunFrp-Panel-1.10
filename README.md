# XunFrp 管理系统

基于 Vue 3 + TypeScript + Naive UI + Golang 的 FRP 隧道管理系统

## 技术栈

### 前端
- Vue 3
- TypeScript
- Naive UI
- Vite
- 端口: 3000

### 后端
- Golang
- Gin 框架
- GORM
- MySQL
- 端口: 8080

## 功能特性

- 用户注册登录
- 实名认证
- 隧道管理 (TCP/UDP/HTTP/HTTPS)
- 节点管理
- 流量统计
- 用户组权限管理
- 管理员后台

## 用户组权限

| 用户组 | 带宽限制 | 隧道数量 | 说明 |
|--------|----------|----------|---------|
| 未实名认证 | 8Mbps | 3条 | 默认注册用户组 |
| 正式用户 | 24Mbps | 10条 | 实名认证后 |
| 赞助者 | 128Mbps | 25条 | 赞助用户 |
| 管理员 | 不限制 | 不限制 | 系统管理员 |

## 项目结构

```
XunFrp/
├── frontend/          # Vue 3 前端
├── backend/           # Golang 后端
└── README.md
```