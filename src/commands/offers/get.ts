import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class OffersGet extends Command {
  static description = 'Get offer details'
  static examples = ['<%= config.bin %> offers get off_123']

  static args = { id: Args.string({ description: 'Offer ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(OffersGet)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const offer = await client.getOffer(args.id)
      if (flags.format === 'json') {
        renderJson(offer)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', offer.id],
          ['Name', offer.name],
          ['Product ID', offer.productId],
          ['Price', (offer.price / 100).toFixed(2)],
          ['Currency', offer.currency],
          ['Type', offer.recurring ? `${offer.recurring.interval}ly` : 'one-time'],
          ['Status', offer.status],
          ['Key Count', String(offer.keyCount ?? 0)],
          ['Created', offer.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
