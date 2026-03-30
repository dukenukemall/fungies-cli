import { FungiesApiClient } from './api-client.js'
import { getPublicKey, getSecretKey } from './config.js'

export function getClient(): FungiesApiClient {
  const pubKey = getPublicKey()
  if (!pubKey) {
    throw new Error('No API key configured. Run `fungies auth set --public-key pub_... --secret-key sec_...` to authenticate.')
  }
  const secKey = getSecretKey()
  return new FungiesApiClient(pubKey, secKey)
}
