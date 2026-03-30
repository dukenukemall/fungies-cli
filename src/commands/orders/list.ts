import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class OrdersList extends Command {
  static description = 'List orders'
  static examples = ['<%= config.bin %> orders list', '<%= config.bin %> orders list --status paid']

  static flags = {
    status: Flags.string({ description: 'Filter by status', options: ['paid', 'pending', 'cancelled', 'refunded'] }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
    from: Flags.string({ description: 'Start date (ISO format)' }),
  }

  async run() {
    const { flags } = await this.parse(OrdersList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listOrders({ status: flags.status, limit: flags.limit, from: flags.from })
      const orders = result.data ?? []
      const headers = ['ID', 'Order#', 'Status', 'Total', 'Currency', 'Created']
      const rows = orders.map((o) => [o.id, o.orderNumber, o.status, (o.total / 100).toFixed(2), o.currency, o.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
