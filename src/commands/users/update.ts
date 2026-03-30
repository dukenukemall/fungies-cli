import { getClient } from '../../lib/client.js'
import { Args, Command, Flags } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersUpdate extends Command {
  static description = 'Update a user'
  static examples = ['<%= config.bin %> users update usr_123 --name "Jane Doe"']

  static args = { id: Args.string({ description: 'User ID', required: true }) }
  static flags = {
    name: Flags.string({ description: 'New name' }),
    email: Flags.string({ description: 'New email' }),
  }

  async run() {
    const { args, flags } = await this.parse(UsersUpdate)
    try {
      const updates: Record<string, string> = {}
      if (flags.name) updates.name = flags.name
      if (flags.email) updates.email = flags.email
      if (Object.keys(updates).length === 0) { renderError('Provide at least one field to update'); this.exit(1) }
      const client = getClient()
      await client.updateUser(args.id, updates)
      renderSuccess(`User ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
