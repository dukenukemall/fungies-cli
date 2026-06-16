import { Command } from '@oclif/core'
import { getPublicKey, getSecretKey, getMode, getBaseUrl, maskKey, MODE_LABELS } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { FungiesApiClient } from '../../lib/api-client.js'

export default class AuthWhoami extends Command {
  static description = 'Verify your API keys and connection for the active mode'
  static examples = ['<%= config.bin %> auth whoami']

  async run() {
    const mode = getMode()
    const pubKey = getPublicKey(mode)
    if (!pubKey) {
      renderError(`No API key configured for ${MODE_LABELS[mode]} mode. Run \`fungies auth set --public-key pub_... --secret-key sec_... --mode ${mode}\` to authenticate.`)
      this.exit(1)
      return
    }

    const secKey = getSecretKey(mode)
    const client = new FungiesApiClient(pubKey, secKey, getBaseUrl(mode))
    try {
      await client.listOrders({ take: 1 })
      renderSuccess(
        `Connected | Mode: ${MODE_LABELS[mode]} | Public: ${maskKey(pubKey)}${secKey ? ` | Secret: ${maskKey(secKey)}` : ' | read-only mode'}`,
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      renderError(`Connection failed: ${message}`)
      this.exit(1)
    }
  }
}
