import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class DiscountsList extends Command {
  static description = 'List discounts'
  static examples = ['<%= config.bin %> discounts list']

  static flags = {
    status: Flags.string({ description: 'Filter by status (active, archived)' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(DiscountsList)
    try {
      const client = getClient()
      const result = await client.listDiscounts({ status: flags.status, take: flags.limit })
      const discounts = result.items ?? []
      const headers = ['ID', 'Name', 'Code', 'Type', 'Amount', 'Used', 'Status']
      const rows = discounts.map((d) => [
        d.id,
        d.name ?? '',
        d.discountCode ?? '',
        d.amountType ?? '',
        d.amountType === 'percentage' ? `${d.amount}%` : `${d.amount}`,
        String(d.timesUsed ?? 0),
        d.status ?? '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${discounts.length} discount(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
