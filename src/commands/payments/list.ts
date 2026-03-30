import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class PaymentsList extends Command {
  static description = 'List payments'
  static examples = ['<%= config.bin %> payments list']

  static flags = {
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
    from: Flags.string({ description: 'Start date (ISO format)' }),
  }

  async run() {
    const { flags } = await this.parse(PaymentsList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listPayments({ limit: flags.limit, from: flags.from })
      const payments = result.data ?? []
      const headers = ['ID', 'Amount', 'Currency', 'Status', 'Created']
      const rows = payments.map((p) => [p.id, (p.amount / 100).toFixed(2), p.currency, p.status, p.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
