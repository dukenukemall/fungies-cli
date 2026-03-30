import { getClient } from '../../lib/client.js'
import { Args, Command, Flags } from '@oclif/core'


import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersInventory extends Command {
  static description = "Get a user's inventory"
  static examples = ['<%= config.bin %> users inventory usr_123']

  static args = { id: Args.string({ description: 'User ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(UsersInventory)
    try {
      const client = getClient()
      const result = await client.getUserInventory(args.id)
      if (flags.format === 'json') {
        renderJson(result)
      } else {
        renderTable(['Item'], (result.data ?? []).map((item) => [JSON.stringify(item)]))
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
