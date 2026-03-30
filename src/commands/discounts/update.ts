import { Args, Command, Flags } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class DiscountsUpdate extends Command {
  static description = 'Update a discount'
  static examples = ['<%= config.bin %> discounts update disc_123 --name "Summer Sale"']

  static args = { id: Args.string({ description: 'Discount ID', required: true }) }
  static flags = {
    name: Flags.string({ description: 'New name' }),
    amount: Flags.integer({ description: 'New amount' }),
    'expires-at': Flags.string({ description: 'New expiry date (ISO)' }),
  }

  async run() {
    const { args, flags } = await this.parse(DiscountsUpdate)
    try {
      const updates: Record<string, unknown> = {}
      if (flags.name) updates.name = flags.name
      if (flags.amount !== undefined) updates.amount = flags.amount
      if (flags['expires-at']) updates.expiresAt = flags['expires-at']
      if (Object.keys(updates).length === 0) { renderError('Provide at least one field to update'); this.exit(1) }
      const client = getClient()
      await client.updateDiscount(args.id, updates as never)
      renderSuccess(`Discount ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
