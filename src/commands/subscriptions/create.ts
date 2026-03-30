import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class SubscriptionsCreate extends Command {
  static description = 'Create a subscription interactively'
  static examples = ['<%= config.bin %> subscriptions create']

  async run() {
    const key = getSecretKey()
    try {
      requireAuth(key)
      p.intro('Create a subscription')
      const answers = await p.group({
        userId: () => p.text({ message: 'User ID', validate: (v) => (!v ? 'Required' : undefined) }),
        offerId: () => p.text({ message: 'Offer ID', validate: (v) => (!v ? 'Required' : undefined) }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const client = new FungiesApiClient(key)
      const sub = await client.createSubscription(answers)
      renderSuccess(`Subscription created: ${sub.id}`)
      renderJson(sub)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
