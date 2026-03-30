import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class DiscountsList extends Command {
  static description = 'List discounts'
  static examples = ['<%= config.bin %> discounts list', '<%= config.bin %> discounts list --active']

  static flags = {
    active: Flags.boolean({ description: 'Show only active discounts' }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(DiscountsList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listDiscounts({ active: flags.active, limit: flags.limit })
      const discounts = result.data ?? []
      const headers = ['ID', 'Code/Name', 'Type', 'Amount', 'Usage', 'Expires']
      const rows = discounts.map((d) => [
        d.id,
        d.code ?? d.name ?? '',
        d.type,
        d.amountType === 'percentage' ? `${d.amount}%` : `${(d.amount / 100).toFixed(2)}`,
        String(d.usageCount),
        d.expiresAt?.slice(0, 10) ?? 'never',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
