import { Args, Command, Flags } from '@oclif/core'
import { readFileSync } from 'node:fs'
import { getClient } from '../../../lib/client.js'
import { renderSuccess, renderError } from '../../../lib/output.js'
import { formatApiError } from '../../../lib/errors.js'

export default class OffersKeysAdd extends Command {
  static description = 'Add keys to an offer'
  static examples = [
    '<%= config.bin %> offers keys add off_123 --keys "KEY1,KEY2,KEY3"',
    '<%= config.bin %> offers keys add off_123 --file ./keys.txt',
  ]

  static args = { offerId: Args.string({ description: 'Offer ID', required: true }) }
  static flags = {
    keys: Flags.string({ description: 'Comma-separated keys' }),
    file: Flags.string({ description: 'Path to file with one key per line' }),
    'api-key': Flags.string({ description: 'API key override' }),
  }

  async run() {
    const { args, flags } = await this.parse(OffersKeysAdd)
    try {
      let keys: string[] = []
      if (flags.keys) {
        keys = flags.keys.split(',').map((k) => k.trim()).filter(Boolean)
      } else if (flags.file) {
        const content = readFileSync(flags.file, 'utf-8')
        keys = content.split('\n').map((k) => k.trim()).filter(Boolean)
      } else {
        renderError('Provide --keys or --file')
        this.exit(1)
      }
      const client = getClient(flags['api-key'])
      const result = await client.addKeys(args.offerId, keys)
      renderSuccess(`Added ${result.added} keys to offer ${args.offerId}`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
