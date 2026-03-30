import { Args, Command } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ProductsDuplicate extends Command {
  static description = 'Duplicate a product'
  static examples = ['<%= config.bin %> products duplicate prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  async run() {
    const { args } = await this.parse(ProductsDuplicate)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const product = await client.duplicateProduct(args.id)
      renderSuccess(`Product duplicated: ${product.id}`)
      renderJson(product)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
