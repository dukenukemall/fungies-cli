import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

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
    const key = getSecretKey()
    try {
      requireAuth(key)
      const updates: Record<string, string> = {}
      if (flags.name) updates.name = flags.name
      if (flags.email) updates.email = flags.email
      if (Object.keys(updates).length === 0) { renderError('Provide at least one field to update'); this.exit(1) }
      const client = new FungiesApiClient(key)
      await client.updateUser(args.id, updates)
      renderSuccess(`User ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
