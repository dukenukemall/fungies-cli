import { Args, Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderJson, renderTable, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsGet extends Command {
  static description = 'Get product details'
  static examples = ['<%= config.bin %> products get prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
    'api-key': Flags.string({ description: 'API key override' }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsGet)
    try {
      const client = getClient(flags['api-key'])
      const product = await client.getProduct(args.id)
      if (flags.format === 'json') {
        renderJson(product)
      } else {
        renderTable(
          ['Field', 'Value'],
          [
            ['ID', product.id],
            ['Name', product.name],
            ['Type', product.type],
            ['Status', product.status],
            ['Slug', product.slug],
            ['Description', product.description ?? ''],
            ['Created', product.createdAt],
            ['Updated', product.updatedAt],
          ],
        )
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
