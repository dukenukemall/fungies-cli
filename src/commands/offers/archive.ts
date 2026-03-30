import { Args, Command } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class OffersArchive extends Command {
  static description = 'Archive an offer'
  static examples = ['<%= config.bin %> offers archive off_123']

  static args = { id: Args.string({ description: 'Offer ID', required: true }) }

  async run() {
    const { args } = await this.parse(OffersArchive)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      await client.archiveOffer(args.id)
      renderSuccess(`Offer ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
