import { FungiesApiClient } from './api-client.js'
import { getSecretKey } from './config.js'

export function getClient(apiKeyOverride?: string): FungiesApiClient {
  const key = apiKeyOverride ?? getSecretKey()
  if (!key) {
    throw new Error('No API key configured. Run `fungies auth set --key sk_...` to authenticate.')
  }
  return new FungiesApiClient(key)
}
