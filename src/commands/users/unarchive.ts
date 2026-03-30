import { Args, Command } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersUnarchive extends Command {
  static description = 'Unarchive a user'
  static examples = ['<%= config.bin %> users unarchive usr_123']

  static args = { id: Args.string({ description: 'User ID', required: true }) }

  async run() {
    const { args } = await this.parse(UsersUnarchive)
    try {
      const client = getClient()
      await client.unarchiveUser(args.id)
      renderSuccess(`User ${args.id} unarchived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
