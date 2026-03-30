import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsList extends Command {
  static description = 'List all products'
  static examples = [
    '<%= config.bin %> products list',
    '<%= config.bin %> products list --format json',
  ]

  static flags = {
    limit: Flags.integer({ description: 'Number of results', default: 20 }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(ProductsList)
    try {
      const client = getClient()
      const result = await client.listProducts({ take: flags.limit })
      const products = result.items ?? []
      const headers = ['ID', 'Name', 'Status']
      const rows = products.map((p) => [p.id, p.name ?? '', p.status ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${products.length} product(s)${result.count ? ` (total: ${result.count})` : ''}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
