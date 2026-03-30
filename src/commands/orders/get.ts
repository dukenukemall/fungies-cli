import { getClient } from '../../lib/client.js'
import { Args, Command, Flags } from '@oclif/core'


import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class OrdersGet extends Command {
  static description = 'Get order details'
  static examples = ['<%= config.bin %> orders get ord_123']

  static args = { id: Args.string({ description: 'Order ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(OrdersGet)
    try {
      const client = getClient()
      const order = await client.getOrder(args.id)
      if (flags.format === 'json') {
        renderJson(order)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', order.id],
          ['Order Number', order.orderNumber],
          ['Status', order.status],
          ['User ID', order.userId],
          ['Total', (order.total / 100).toFixed(2)],
          ['Currency', order.currency],
          ['Created', order.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
