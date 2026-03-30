import Conf from 'conf'

const store = new Conf<{ publicKey?: string; secretKey?: string }>({
  projectName: 'fungies',
  projectSuffix: '',
})

export function getPublicKey(): string | undefined {
  return store.get('publicKey')
}

export function getSecretKey(): string | undefined {
  return store.get('secretKey')
}

export function setPublicKey(key: string): void {
  store.set('publicKey', key)
}

export function setSecretKey(key: string): void {
  store.set('secretKey', key)
}

export function clearAuth(): void {
  store.delete('publicKey')
  store.delete('secretKey')
}

export function isAuthenticated(): boolean {
  return Boolean(store.get('publicKey'))
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}
