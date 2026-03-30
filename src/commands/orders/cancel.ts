import { Args, Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class OrdersCancel extends Command {
  static description = 'Cancel an order'
  static examples = ['<%= config.bin %> orders cancel ord_123']

  static args = { id: Args.string({ description: 'Order ID', required: true }) }

  async run() {
    const { args } = await this.parse(OrdersCancel)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const confirmed = await p.confirm({ message: `Cancel order ${args.id}? This does not automatically issue a refund.` })
      if (!confirmed || p.isCancel(confirmed)) { p.cancel('Cancelled'); this.exit(0) }
      const client = new FungiesApiClient(key)
      await client.cancelOrder(args.id)
      renderSuccess(`Order ${args.id} cancelled`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
