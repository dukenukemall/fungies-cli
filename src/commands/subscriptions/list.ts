import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class SubscriptionsList extends Command {
  static description = 'List subscriptions'
  static examples = ['<%= config.bin %> subscriptions list', '<%= config.bin %> subscriptions list --status active']

  static flags = {
    status: Flags.string({ description: 'Filter by status', options: ['active', 'cancelled', 'paused', 'past_due'] }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(SubscriptionsList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listSubscriptions({ status: flags.status, limit: flags.limit })
      const subs = result.data ?? []
      const headers = ['ID', 'UserID', 'Status', 'Offer', 'Period End', 'Created']
      const rows = subs.map((s) => [s.id, s.userId, s.status, s.offerId, s.currentPeriodEnd?.slice(0, 10) ?? '', s.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
