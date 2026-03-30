import { Command } from '@oclif/core'
import { clearAuth } from '../../lib/config.js'
import { renderSuccess } from '../../lib/output.js'

export default class AuthClear extends Command {
  static description = 'Remove stored API key'
  static examples = ['<%= config.bin %> auth clear']

  async run() {
    clearAuth()
    renderSuccess('Auth cleared')
  }
}
