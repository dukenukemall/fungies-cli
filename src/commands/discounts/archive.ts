import { Args, Command } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class DiscountsArchive extends Command {
  static description = 'Archive a discount'
  static examples = ['<%= config.bin %> discounts archive disc_123']

  static args = { id: Args.string({ description: 'Discount ID', required: true }) }

  async run() {
    const { args } = await this.parse(DiscountsArchive)
    try {
      const client = getClient()
      await client.archiveDiscount(args.id)
      renderSuccess(`Discount ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
