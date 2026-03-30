import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class OrdersList extends Command {
  static description = 'List orders'
  static examples = ['<%= config.bin %> orders list', '<%= config.bin %> orders list --status PAID']

  static flags = {
    status: Flags.string({ description: 'Filter by status (PAID, PENDING, CANCELLED, REFUNDED)' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
    from: Flags.string({ description: 'Start date (ISO format)' }),
  }

  async run() {
    const { flags } = await this.parse(OrdersList)
    try {
      const client = getClient()
      const result = await client.listOrders({ statuses: flags.status, take: flags.limit, createdFrom: flags.from })
      const orders = result.items ?? []
      const headers = ['ID', 'Order#', 'Status', 'Value', 'Currency', 'Country', 'Created']
      const rows = orders.map((o) => [
        o.id,
        o.number ?? o.orderNumber ?? '',
        o.status ?? '',
        o.value !== undefined ? (o.value / 100).toFixed(2) : '',
        o.currency ?? '',
        o.country ?? '',
        o.createdAt ? new Date(o.createdAt as number).toISOString().slice(0, 10) : '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${orders.length} order(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
