import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class PaymentsGet extends Command {
  static description = 'Get payment details'
  static examples = ['<%= config.bin %> payments get pay_123']

  static args = { id: Args.string({ description: 'Payment ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(PaymentsGet)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const payment = await client.getPayment(args.id)
      if (flags.format === 'json') {
        renderJson(payment)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', payment.id],
          ['Order ID', payment.orderId],
          ['User ID', payment.userId],
          ['Amount', (payment.amount / 100).toFixed(2)],
          ['Currency', payment.currency],
          ['Status', payment.status],
          ['Created', payment.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
