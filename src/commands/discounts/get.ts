import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class DiscountsGet extends Command {
  static description = 'Get discount details'
  static examples = ['<%= config.bin %> discounts get disc_123']

  static args = { id: Args.string({ description: 'Discount ID', required: true }) }
  static flags = { format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }) }

  async run() {
    const { args, flags } = await this.parse(DiscountsGet)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const discount = await client.getDiscount(args.id)
      if (flags.format === 'json') {
        renderJson(discount)
      } else {
        renderTable(['Field', 'Value'], [
          ['ID', discount.id],
          ['Code', discount.code ?? ''],
          ['Name', discount.name ?? ''],
          ['Type', discount.type],
          ['Amount', discount.amountType === 'percentage' ? `${discount.amount}%` : `${(discount.amount / 100).toFixed(2)}`],
          ['Status', discount.status],
          ['Usage Count', String(discount.usageCount)],
          ['Expires', discount.expiresAt ?? 'never'],
          ['Created', discount.createdAt],
        ])
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
