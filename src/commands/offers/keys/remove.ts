import { Args, Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../../lib/config.js'
import { FungiesApiClient } from '../../../lib/api-client.js'
import { renderSuccess, renderError } from '../../../lib/output.js'
import { requireAuth, formatApiError } from '../../../lib/errors.js'

export default class OffersKeysRemove extends Command {
  static description = 'Remove keys from an offer'
  static examples = [
    '<%= config.bin %> offers keys remove off_123 --key-id key_abc',
    '<%= config.bin %> offers keys remove off_123 --all-unsold',
  ]

  static args = { offerId: Args.string({ description: 'Offer ID', required: true }) }
  static flags = {
    'key-id': Flags.string({ description: 'Specific key ID to remove' }),
    'all-unsold': Flags.boolean({ description: 'Remove all unsold keys', default: false }),
  }

  async run() {
    const { args, flags } = await this.parse(OffersKeysRemove)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      if (flags['all-unsold']) {
        const result = await client.removeAllUnsoldKeys(args.offerId)
        renderSuccess(`Removed ${result.removed} unsold keys from offer ${args.offerId}`)
      } else if (flags['key-id']) {
        await client.removeKey(args.offerId, flags['key-id'])
        renderSuccess(`Removed key ${flags['key-id']} from offer ${args.offerId}`)
      } else {
        renderError('Provide --key-id or --all-unsold')
        this.exit(1)
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
