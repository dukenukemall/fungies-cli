import { Args, Command } from '@oclif/core'
import {
  getMode,
  setMode,
  getBaseUrl,
  isAuthenticated,
  normalizeMode,
  MODE_LABELS,
  type Mode,
} from '../lib/config.js'
import { renderSuccess, renderError, renderWarning } from '../lib/output.js'
import { printModeStatus, promptModeSelection } from '../lib/mode-ui.js'

export default class ModeCommand extends Command {
  static description = 'Show or switch between Production and Sandbox API modes'
  static examples = [
    '<%= config.bin %> mode',
    '<%= config.bin %> mode sandbox',
    '<%= config.bin %> mode prod',
  ]

  static args = {
    target: Args.string({
      description: 'Mode to switch to: prod (live) or sandbox (staging)',
      required: false,
    }),
  }

  async run() {
    const { args } = await this.parse(ModeCommand)

    if (!args.target) {
      const interactive = process.stdin.isTTY && process.stdout.isTTY
      if (!interactive) {
        printModeStatus()
        return
      }
      const selected = await promptModeSelection()
      if (!selected) return
      this.applyMode(selected)
      return
    }

    const target = normalizeMode(args.target)
    if (!target) {
      renderError(`Unknown mode "${args.target}". Use "prod" or "sandbox".`)
      this.exit(1)
      return
    }
    this.applyMode(target)
  }

  private applyMode(target: Mode): void {
    if (target === getMode()) {
      renderWarning(`Already in ${MODE_LABELS[target]} mode (${getBaseUrl(target)})`)
      return
    }
    setMode(target)
    renderSuccess(`Switched to ${MODE_LABELS[target]} mode → ${getBaseUrl(target)}`)
    if (!isAuthenticated(target)) {
      renderWarning(`No API keys saved for ${MODE_LABELS[target]} mode yet. Run: fungies auth set --public-key pub_... --secret-key sec_... --mode ${target}`)
    }
  }
}
