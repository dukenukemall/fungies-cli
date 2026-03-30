import { Command, Flags } from '@oclif/core'
import { setPublicKey, setSecretKey } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'

export default class AuthSet extends Command {
  static description = 'Save your Fungies API keys'
  static examples = [
    '<%= config.bin %> auth set --public-key pub_... --secret-key sec_...',
    '<%= config.bin %> auth set -p pub_... -s sec_...',
  ]

  static flags = {
    'public-key': Flags.string({
      char: 'p',
      description: 'Your Fungies public key (pub_...)',
      required: true,
    }),
    'secret-key': Flags.string({
      char: 's',
      description: 'Your Fungies secret key (sec_...)',
      required: false,
    }),
  }

  async run() {
    const { flags } = await this.parse(AuthSet)
    const pubKey = flags['public-key']
    const secKey = flags['secret-key']

    if (!pubKey.startsWith('pub_')) {
      renderError('Public key must start with "pub_"')
      this.exit(1)
    }

    if (secKey && !secKey.startsWith('sec_')) {
      renderError('Secret key must start with "sec_"')
      this.exit(1)
    }

    setPublicKey(pubKey)
    if (secKey) setSecretKey(secKey)
    renderSuccess(`API keys saved successfully${secKey ? ' (public + secret)' : ' (public only — read-only mode)'}`)
  }
}
