import { Args, Command, Flags } from '@oclif/core'
import * as p from '@clack/prompts'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsArchive extends Command {
  static description = 'Archive a product'
  static examples = ['<%= config.bin %> products archive prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    'api-key': Flags.string({ description: 'API key override' }),
    confirm: Flags.boolean({ description: 'Skip confirmation prompt', default: false }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsArchive)
    try {
      if (!flags.confirm) {
        const confirmed = await p.confirm({ message: `Archive product ${args.id}?` })
        if (!confirmed || p.isCancel(confirmed)) { p.cancel('Cancelled'); this.exit(0) }
      }
      const client = getClient(flags['api-key'])
      await client.archiveProduct(args.id)
      renderSuccess(`Product ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
