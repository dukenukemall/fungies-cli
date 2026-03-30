import { getClient } from '../../lib/client.js'
import { Args, Command, Flags } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class SubscriptionsCancel extends Command {
  static description = 'Cancel a subscription'
  static examples = ['<%= config.bin %> subscriptions cancel sub_123']

  static args = { id: Args.string({ description: 'Subscription ID', required: true }) }
  static flags = {
    immediately: Flags.boolean({ description: 'Cancel immediately', default: true, allowNo: true }),
    refund: Flags.boolean({ description: 'Issue refund', default: false }),
  }

  async run() {
    const { args, flags } = await this.parse(SubscriptionsCancel)
    try {
      const client = getClient()
      await client.cancelSubscription(args.id, { immediately: flags.immediately, refund: flags.refund })
      renderSuccess(`Subscription ${args.id} cancelled`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
