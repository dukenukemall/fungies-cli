import { Args, Command } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class SubscriptionsPause extends Command {
  static description = 'Pause a subscription'
  static examples = ['<%= config.bin %> subscriptions pause sub_123']

  static args = { id: Args.string({ description: 'Subscription ID', required: true }) }

  async run() {
    const { args } = await this.parse(SubscriptionsPause)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      await client.pauseSubscription(args.id)
      renderSuccess(`Subscription ${args.id} paused`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
