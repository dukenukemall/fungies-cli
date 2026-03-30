import Conf from 'conf'

const store = new Conf<{ secretKey?: string }>({
  projectName: 'fungies',
  projectSuffix: '',
})

export function getSecretKey(): string | undefined {
  return store.get('secretKey')
}

export function setSecretKey(key: string): void {
  store.set('secretKey', key)
}

export function clearAuth(): void {
  store.delete('secretKey')
}

export function isAuthenticated(): boolean {
  return Boolean(store.get('secretKey'))
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}
