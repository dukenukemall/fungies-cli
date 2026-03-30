import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

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
    try {
      const client = getClient()
      const result = await client.listPayments({ take: flags.limit, createdFrom: flags.from })
      const payments = result.items ?? []
      const headers = ['ID', 'Number', 'Type', 'Status', 'Value', 'Currency', 'Created']
      const rows = payments.map((p) => [
        p.id,
        p.number ?? '',
        p.type ?? '',
        p.status ?? '',
        p.value !== undefined ? (p.value / 100).toFixed(2) : '',
        p.currency ?? '',
        p.createdAt ? new Date(p.createdAt as number).toISOString().slice(0, 10) : '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${payments.length} payment(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
