import { ApiError } from './api-client.js'

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message
  }
  if (err instanceof Error) {
    return err.message
  }
  return String(err)
}

export function requireAuth(key: string | undefined): asserts key is string {
  if (!key) {
    throw new Error('No API key configured. Run `fungies auth set --key sk_...` to authenticate.')
  }
}
