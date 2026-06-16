import { Command, Flags } from '@oclif/core'
import { setPublicKey, setSecretKey, getMode, normalizeMode, MODE_LABELS } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'

export default class AuthSet extends Command {
  static description = 'Save your Fungies API keys for a given mode (defaults to the active mode)'
  static examples = [
    '<%= config.bin %> auth set --public-key pub_... --secret-key sec_...',
    '<%= config.bin %> auth set -p pub_... -s sec_... --mode sandbox',
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
    mode: Flags.string({
      char: 'm',
      description: 'Which mode these keys belong to: prod or sandbox (defaults to current mode)',
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

    const mode = flags.mode ? normalizeMode(flags.mode) : getMode()
    if (!mode) {
      renderError(`Unknown mode "${flags.mode}". Use "prod" or "sandbox".`)
      this.exit(1)
      return
    }

    setPublicKey(pubKey, mode)
    if (secKey) setSecretKey(secKey, mode)
    renderSuccess(
      `API keys saved for ${MODE_LABELS[mode]} mode${secKey ? ' (public + secret)' : ' (public only — read-only mode)'}`,
    )
  }
}
