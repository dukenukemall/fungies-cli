import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

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
    'api-key': Flags.string({ description: 'API key override' }),
  }

  async run() {
    const { flags } = await this.parse(ProductsList)
    try {
      const client = getClient(flags['api-key'])
      const result = await client.listProducts({ type: flags.type, limit: flags.limit })
      const products = result.data ?? []
      const headers = ['ID', 'Name', 'Type', 'Status', 'Created']
      const rows = products.map((p) => [
        flags.format === 'table' ? p.id.slice(0, 12) : p.id,
        p.name,
        p.type,
        p.status,
        p.createdAt?.slice(0, 10) ?? '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
