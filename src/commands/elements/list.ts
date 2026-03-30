import { Command, Flags } from '@oclif/core'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ElementsList extends Command {
  static description = 'List checkout elements'
  static examples = ['<%= config.bin %> elements list']

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(ElementsList)
    const key = getSecretKey()
    try {
      requireAuth(key)
      const client = new FungiesApiClient(key)
      const result = await client.listElements()
      const elements = result.data ?? []
      const headers = ['ID', 'Name', 'Offers', 'Created']
      const rows = elements.map((e) => [e.id, e.name, (e.offers ?? []).length, e.createdAt?.slice(0, 10) ?? ''])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
