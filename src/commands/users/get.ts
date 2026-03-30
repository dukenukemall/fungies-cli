import { Args, Command, Flags } from '@oclif/core'


import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersGet extends Command {
  static description = 'Get user details'
  static examples = ['<%= config.bin %> users get usr_123']

  static args = { id: Args.string({ description: 'User ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(UsersGet)
    try {
      const client = getClient()
      const user = await client.getUser(args.id)
      if (flags.format === 'json') {
        renderJson(user)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', user.id],
          ['Email', user.email],
          ['Name', user.name ?? ''],
          ['Status', user.status ?? 'active'],
          ['Created', user.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
