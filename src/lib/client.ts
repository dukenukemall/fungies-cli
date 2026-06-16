import { FungiesApiClient } from './api-client.js'
import { getPublicKey, getSecretKey, getBaseUrl, getMode, MODE_LABELS } from './config.js'

export function getClient(): FungiesApiClient {
  const mode = getMode()
  const pubKey = getPublicKey(mode)
  if (!pubKey) {
    throw new Error(`No API key configured for ${MODE_LABELS[mode]} mode. Run \`fungies auth set --public-key pub_... --secret-key sec_... --mode ${mode}\` to authenticate.`)
  }
  const secKey = getSecretKey(mode)
  return new FungiesApiClient(pubKey, secKey, getBaseUrl(mode))
}
