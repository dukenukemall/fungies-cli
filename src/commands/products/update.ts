import { Args, Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsUpdate extends Command {
  static description = 'Update a product'
  static examples = ['<%= config.bin %> products update prod_123 --name "New Name"']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    name: Flags.string({ description: 'New product name' }),
    description: Flags.string({ description: 'New description' }),
    'api-key': Flags.string({ description: 'API key override' }),
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsUpdate)
    try {
      const updates: Record<string, string> = {}
      if (flags.name) updates.name = flags.name
      if (flags.description) updates.description = flags.description
      if (Object.keys(updates).length === 0) {
        renderError('Provide at least one field to update (--name, --description)')
        this.exit(1)
      }
      const client = getClient(flags['api-key'])
      await client.updateProduct(args.id, updates)
      renderSuccess(`Product ${args.id} updated`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
