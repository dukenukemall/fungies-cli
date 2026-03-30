import { Command } from '@oclif/core'
import { getPublicKey, getSecretKey, maskKey } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { FungiesApiClient } from '../../lib/api-client.js'

export default class AuthWhoami extends Command {
  static description = 'Verify your API keys and connection'
  static examples = ['<%= config.bin %> auth whoami']

  async run() {
    const pubKey = getPublicKey()
    if (!pubKey) {
      renderError('No API key configured. Run `fungies auth set --public-key pub_... --secret-key sec_...` to authenticate.')
      this.exit(1)
      return
    }

    const secKey = getSecretKey()
    const client = new FungiesApiClient(pubKey, secKey)
    try {
      await client.listOrders({ take: 1 })
      renderSuccess(`Connected | Public: ${maskKey(pubKey)}${secKey ? ` | Secret: ${maskKey(secKey)}` : ' | read-only mode'}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      renderError(`Connection failed: ${message}`)
      this.exit(1)
    }
  }
}
