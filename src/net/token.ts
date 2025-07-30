// Token管理
export function getToken(): string {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || ''
}

export function storeToken(token: string, remember: boolean = false, expires?: number): void {
  if (remember) {
    localStorage.setItem('token', token)
    if (expires) {
      localStorage.setItem('token_expires', expires.toString())
    }
  } else {
    sessionStorage.setItem('token', token)
    if (expires) {
      sessionStorage.setItem('token_expires', expires.toString())
    }
  }
}

export function removeToken(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('token_expires')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('token_expires')
}

export function isTokenExpired(): boolean {
  const expires = localStorage.getItem('token_expires') || sessionStorage.getItem('token_expires')
  if (!expires) return false
  
  return Date.now() > parseInt(expires) * 1000
}
