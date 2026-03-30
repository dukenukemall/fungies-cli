import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class UsersList extends Command {
  static description = 'List users'
  static examples = ['<%= config.bin %> users list', '<%= config.bin %> users list --search user@example.com']

  static flags = {
    search: Flags.string({ description: 'Search by email or name' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(UsersList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listUsers({ search: flags.search, limit: flags.limit })
      const users = result.data ?? []
      const headers = ['ID', 'Email', 'Name', 'Created']
      const rows = users.map((u) => [u.id, u.email, u.name ?? '', u.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
