import { Command, Flags } from '@oclif/core'
import { setSecretKey } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'

export default class AuthSet extends Command {
  static description = 'Save your Fungies API key'
  static examples = ['<%= config.bin %> auth set --key sk_your_key_here']

  static flags = {
    key: Flags.string({
      char: 'k',
      description: 'Your Fungies API secret key',
      required: true,
    }),
  }

  async run() {
    const { flags } = await this.parse(AuthSet)
    const key = flags.key

    if (!key.startsWith('sk_') && !key.startsWith('pk_')) {
      renderError('API key must start with "sk_" or "pk_"')
      this.exit(1)
    }

    setSecretKey(key)
    renderSuccess('API key saved successfully')
  }
}
