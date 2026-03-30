import { Args, Command, Flags } from '@oclif/core'


import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class SubscriptionsGet extends Command {
  static description = 'Get subscription details'
  static examples = ['<%= config.bin %> subscriptions get sub_123']

  static args = { id: Args.string({ description: 'Subscription ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(SubscriptionsGet)
    try {
      const client = getClient()
      const sub = await client.getSubscription(args.id)
      if (flags.format === 'json') {
        renderJson(sub)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', sub.id],
          ['User ID', sub.userId],
          ['Offer ID', sub.offerId],
          ['Status', sub.status],
          ['Period End', sub.currentPeriodEnd],
          ['Created', sub.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
