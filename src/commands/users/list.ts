import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

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
    try {
      const client = getClient()
      const result = await client.listUsers({ term: flags.search, take: flags.limit })
      const users = result.items ?? []
      const headers = ['ID', 'Email', 'Username', 'InternalID']
      const rows = users.map((u) => [u.id, u.email ?? '', u.username ?? '', u.internalId ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${users.length} user(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
