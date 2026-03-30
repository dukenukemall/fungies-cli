import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class OffersList extends Command {
  static description = 'List offers'
  static examples = ['<%= config.bin %> offers list', '<%= config.bin %> offers list --product-id prod_123']

  static flags = {
    'product-id': Flags.string({ description: 'Filter by product ID' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(OffersList)
    try {
      const client = getClient()
      const result = await client.listOffers({ product: flags['product-id'], take: flags.limit })
      const offers = result.items ?? []
      const headers = ['ID', 'Name', 'Price', 'Currency', 'Interval', 'Status']
      const rows = offers.map((o) => [
        o.id,
        o.name ?? '',
        o.price !== undefined ? (o.price / 100).toFixed(2) : '',
        o.currency ?? '',
        o.recurringInterval ?? 'one-time',
        o.status ?? '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${offers.length} offer(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
