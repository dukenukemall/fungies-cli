import { Args, Command, Flags } from '@oclif/core'
import ora from 'ora'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsDuplicate extends Command {
  static description = 'Duplicate a product'
  static examples = ['<%= config.bin %> products duplicate prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    'api-key': Flags.string({ description: 'API key override' }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsDuplicate)
    try {
      const client = getClient(flags['api-key'])
      const spinner = ora('Duplicating product...').start()
      const product = await client.duplicateProduct(args.id)
      spinner.stop()
      renderSuccess(`Product duplicated: ${product.id}`)
      renderJson(product)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
