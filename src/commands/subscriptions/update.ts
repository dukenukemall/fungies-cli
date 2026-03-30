import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class SubscriptionsUpdate extends Command {
  static description = 'Update a subscription'
  static examples = ['<%= config.bin %> subscriptions update sub_123 --offer-id off_456']

  static args = { id: Args.string({ description: 'Subscription ID', required: true }) }
  static flags = {
    'offer-id': Flags.string({ description: 'New offer ID' }),
  }

  async run() {
    const { args, flags } = await this.parse(SubscriptionsUpdate)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const updates: Record<string, unknown> = {}
      if (flags['offer-id']) updates.offerId = flags['offer-id']
      if (Object.keys(updates).length === 0) { renderError('Provide at least one field to update'); this.exit(1) }
      const client = new FungiesApiClient(key)
      await client.updateSubscription(args.id, updates)
      renderSuccess(`Subscription ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
