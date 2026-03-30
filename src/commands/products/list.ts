import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ProductsList extends Command {
  static description = 'List all products'
  static examples = [
    '<%= config.bin %> products list',
    '<%= config.bin %> products list --type Subscription',
    '<%= config.bin %> products list --format json',
  ]

  static flags = {
    type: Flags.string({ description: 'Filter by product type', options: ['OneTimePayment', 'Subscription', 'Membership', 'GameKey'] }),
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(ProductsList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listProducts({ type: flags.type, limit: flags.limit })
      const products = result.data ?? []
      const headers = ['ID', 'Name', 'Type', 'Status', 'Created']
      const rows = products.map((p) => [p.id, p.name, p.type, p.status, p.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
