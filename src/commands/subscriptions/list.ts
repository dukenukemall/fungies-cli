import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class SubscriptionsList extends Command {
  static description = 'List subscriptions'
  static examples = ['<%= config.bin %> subscriptions list', '<%= config.bin %> subscriptions list --status active']

  static flags = {
    status: Flags.string({ description: 'Filter by status' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(SubscriptionsList)
    try {
      const client = getClient()
      const result = await client.listSubscriptions({ status: flags.status, take: flags.limit })
      const subs = result.items ?? []
      const headers = ['ID', 'UserID', 'Status', 'Order#', 'Interval End', 'Created']
      const rows = subs.map((s) => [
        s.id,
        s.userId ?? '',
        s.status ?? '',
        s.orderId ?? '',
        s.currentIntervalEnd ? new Date(s.currentIntervalEnd as number).toISOString().slice(0, 10) : '',
        s.createdAt ? new Date(s.createdAt as number).toISOString().slice(0, 10) : '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${subs.length} subscription(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
