import Conf from 'conf'

export type Mode = 'prod' | 'sandbox'

interface Credentials {
  publicKey?: string
  secretKey?: string
}

interface StoreShape {
  mode?: Mode
  prod?: Credentials
  sandbox?: Credentials
  // Legacy flat keys (pre-mode CLI versions) — migrated into `prod` on read.
  publicKey?: string
  secretKey?: string
}

const store = new Conf<StoreShape>({ projectName: 'fungies', projectSuffix: '' })

export const BASE_URLS: Record<Mode, string> = {
  prod: 'https://api.fungies.io/v0',
  sandbox: 'https://api.stage.fungies.net/v0',
}

export const MODE_LABELS: Record<Mode, string> = {
  prod: 'Production',
  sandbox: 'Sandbox',
}

const MODE_ALIASES: Record<string, Mode> = {
  prod: 'prod', production: 'prod', live: 'prod', p: 'prod',
  sandbox: 'sandbox', stage: 'sandbox', staging: 'sandbox', test: 'sandbox', s: 'sandbox',
}

export function normalizeMode(value: string): Mode | undefined {
  return MODE_ALIASES[value.trim().toLowerCase()]
}

// One-time migration: fold pre-mode flat keys into the prod profile.
function migrateLegacy(): void {
  const legacyPub = store.get('publicKey')
  if (!legacyPub) return
  const prod = store.get('prod') ?? {}
  store.set('prod', { publicKey: prod.publicKey ?? legacyPub, secretKey: prod.secretKey ?? store.get('secretKey') })
  store.delete('publicKey')
  store.delete('secretKey')
  if (!store.get('mode')) store.set('mode', 'prod')
}

function creds(mode: Mode): Credentials {
  migrateLegacy()
  return store.get(mode) ?? {}
}

export function getMode(): Mode {
  migrateLegacy()
  return store.get('mode') ?? 'prod'
}

export function setMode(mode: Mode): void {
  store.set('mode', mode)
}

export function getBaseUrl(mode: Mode = getMode()): string {
  return BASE_URLS[mode]
}

export function getPublicKey(mode: Mode = getMode()): string | undefined {
  return creds(mode).publicKey
}

export function getSecretKey(mode: Mode = getMode()): string | undefined {
  return creds(mode).secretKey
}

export function setPublicKey(key: string, mode: Mode = getMode()): void {
  store.set(mode, { ...creds(mode), publicKey: key })
}

export function setSecretKey(key: string, mode: Mode = getMode()): void {
  store.set(mode, { ...creds(mode), secretKey: key })
}

export function clearAuth(mode?: Mode): void {
  if (mode) store.delete(mode)
  else {
    store.delete('prod')
    store.delete('sandbox')
  }
}

export function isAuthenticated(mode: Mode = getMode()): boolean {
  return Boolean(creds(mode).publicKey)
}

export function hasAnyCredentials(): boolean {
  return Boolean(creds('prod').publicKey || creds('sandbox').publicKey)
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}
