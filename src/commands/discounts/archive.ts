import { Args, Command } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class DiscountsArchive extends Command {
  static description = 'Archive a discount'
  static examples = ['<%= config.bin %> discounts archive disc_123']

  static args = { id: Args.string({ description: 'Discount ID', required: true }) }

  async run() {
    const { args } = await this.parse(DiscountsArchive)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      await client.archiveDiscount(args.id)
      renderSuccess(`Discount ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
