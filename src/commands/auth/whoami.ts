import { Command } from '@oclif/core'
import { getSecretKey, maskKey } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { FungiesApiClient } from '../../lib/api-client.js'

export default class AuthWhoami extends Command {
  static description = 'Verify your API key and connection'
  static examples = ['<%= config.bin %> auth whoami']

  async run() {
    const key = getSecretKey()
    if (!key) {
      renderError('No API key configured. Run `fungies auth set --key sk_...` to authenticate.')
      this.exit(1)
    }

    const client = new FungiesApiClient(key)
    try {
      await client.listProducts({ limit: 1 })
      renderSuccess(`Connected | Key: ${maskKey(key)}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      renderError(`Connection failed: ${message}`)
      this.exit(1)
    }
  }
}
