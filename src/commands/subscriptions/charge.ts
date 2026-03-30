import { getClient } from '../../lib/client.js'
import { Args, Command, Flags } from '@oclif/core'


import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class SubscriptionsCharge extends Command {
  static description = 'Charge a subscription an additional amount'
  static examples = ['<%= config.bin %> subscriptions charge sub_123 --amount 999 --currency USD']

  static args = { id: Args.string({ description: 'Subscription ID', required: true }) }
  static flags = {
    amount: Flags.integer({ description: 'Amount in cents', required: true }),
    currency: Flags.string({ description: 'Currency code (e.g. USD)', required: true }),
  }

  async run() {
    const { args, flags } = await this.parse(SubscriptionsCharge)
    try {
      const client = getClient()
      const payment = await client.chargeSubscription(args.id, { amount: flags.amount, currency: flags.currency })
      renderSuccess(`Charged subscription ${args.id}`)
      renderJson(payment)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
