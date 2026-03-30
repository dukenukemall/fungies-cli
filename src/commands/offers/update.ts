import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class OffersUpdate extends Command {
  static description = 'Update an offer'
  static examples = ['<%= config.bin %> offers update off_123 --name "New Name"']

  static args = { id: Args.string({ description: 'Offer ID', required: true }) }
  static flags = {
    name: Flags.string({ description: 'New name' }),
    price: Flags.integer({ description: 'New price in cents' }),
  }

  async run() {
    const { args, flags } = await this.parse(OffersUpdate)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const updates: Record<string, unknown> = {}
      if (flags.name) updates.name = flags.name
      if (flags.price !== undefined) updates.price = flags.price
      if (Object.keys(updates).length === 0) { renderError('Provide at least one field to update'); this.exit(1) }
      const client = new FungiesApiClient(key)
      await client.updateOffer(args.id, updates as never)
      renderSuccess(`Offer ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
