import { Args, Command } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersArchive extends Command {
  static description = 'Archive a user'
  static examples = ['<%= config.bin %> users archive usr_123']

  static args = { id: Args.string({ description: 'User ID', required: true }) }

  async run() {
    const { args } = await this.parse(UsersArchive)
    try {
      const client = getClient()
      await client.archiveUser(args.id)
      renderSuccess(`User ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
