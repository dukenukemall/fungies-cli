import { Args, Command } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class UsersUnarchive extends Command {
  static description = 'Unarchive a user'
  static examples = ['<%= config.bin %> users unarchive usr_123']

  static args = { id: Args.string({ description: 'User ID', required: true }) }

  async run() {
    const { args } = await this.parse(UsersUnarchive)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      await client.unarchiveUser(args.id)
      renderSuccess(`User ${args.id} unarchived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
