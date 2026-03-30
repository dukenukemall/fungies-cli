import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

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
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listOffers({ productId: flags['product-id'], limit: flags.limit })
      const offers = result.data ?? []
      const headers = ['ID', 'Name', 'Price', 'Currency', 'Type', 'Status']
      const rows = offers.map((o) => [
        o.id, o.name,
        (o.price / 100).toFixed(2),
        o.currency,
        o.recurring ? `${o.recurring.interval}ly` : 'one-time',
        o.status,
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
