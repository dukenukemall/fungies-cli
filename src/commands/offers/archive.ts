import { Args, Command, Flags } from '@oclif/core'
import * as p from '@clack/prompts'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class OffersArchive extends Command {
  static description = 'Archive an offer'
  static examples = ['<%= config.bin %> offers archive off_123']

  static args = { id: Args.string({ description: 'Offer ID', required: true }) }
  static flags = {
    'api-key': Flags.string({ description: 'API key override' }),
    confirm: Flags.boolean({ description: 'Skip confirmation prompt', default: false }),
  }

  async run() {
    const { args, flags } = await this.parse(OffersArchive)
    try {
      if (!flags.confirm) {
        const confirmed = await p.confirm({ message: `Archive offer ${args.id}?` })
        if (!confirmed || p.isCancel(confirmed)) { p.cancel('Cancelled'); this.exit(0) }
      }
      const client = getClient(flags['api-key'])
      await client.archiveOffer(args.id)
      renderSuccess(`Offer ${args.id} archived`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
