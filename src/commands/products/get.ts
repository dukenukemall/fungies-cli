import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderJson, renderTable, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ProductsGet extends Command {
  static description = 'Get product details'
  static examples = ['<%= config.bin %> products get prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsGet)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
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
            ['Slug', product.slug],
            ['Status', product.status],
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
