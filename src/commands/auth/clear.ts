import { Command, Flags } from '@oclif/core'
import { clearAuth, getMode, normalizeMode, MODE_LABELS } from '../../lib/config.js'
import { renderSuccess, renderError } from '../../lib/output.js'

export default class AuthClear extends Command {
  static description = 'Remove stored API keys for a mode (defaults to the active mode)'
  static examples = [
    '<%= config.bin %> auth clear',
    '<%= config.bin %> auth clear --mode sandbox',
    '<%= config.bin %> auth clear --all',
  ]

  static flags = {
    mode: Flags.string({
      char: 'm',
      description: 'Which mode to clear: prod or sandbox (defaults to current mode)',
      required: false,
    }),
    all: Flags.boolean({
      description: 'Clear stored keys for every mode',
      required: false,
    }),
  }

  async run() {
    const { flags } = await this.parse(AuthClear)

    if (flags.all) {
      clearAuth()
      renderSuccess('Auth cleared for all modes')
      return
    }

    const mode = flags.mode ? normalizeMode(flags.mode) : getMode()
    if (!mode) {
      renderError(`Unknown mode "${flags.mode}". Use "prod" or "sandbox".`)
      this.exit(1)
      return
    }

    clearAuth(mode)
    renderSuccess(`Auth cleared for ${MODE_LABELS[mode]} mode`)
  }
}
