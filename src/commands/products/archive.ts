import { Args, Command, Flags } from '@oclif/core'
import * as p from '@clack/prompts'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ProductsArchive extends Command {
  static description = 'Archive a product'
  static examples = ['<%= config.bin %> products archive prod_123']

  static args = {
    id: Args.string({ description: 'Product ID', required: true }),
  }

  static flags = {
    confirm: Flags.boolean({ description: 'Skip confirmation prompt', default: false }),
  }

  async run() {
    const { args, flags } = await this.parse(ProductsArchive)
    const key = getSecretKey()
    try {
      requireAuth(key)
      if (!flags.confirm) {
        const confirmed = await p.confirm({ message: `Archive product ${args.id}?` })
        if (!confirmed || p.isCancel(confirmed)) { p.cancel('Cancelled'); this.exit(0) }
      }
      const client = new FungiesApiClient(key)
      await client.archiveProduct(args.id)
      renderSuccess(`Product ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
