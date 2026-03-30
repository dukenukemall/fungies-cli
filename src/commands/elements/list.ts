import { Command, Flags } from '@oclif/core'
import { getClient } from '../../lib/client.js'
import { renderOutput, renderError, type OutputFormat } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ElementsList extends Command {
  static description = 'List checkout elements'
  static examples = ['<%= config.bin %> elements list']

  static flags = {
    format: Flags.string({ description: 'Output format', options: ['table', 'json', 'csv'], default: 'table' }),
  }

  async run() {
    const { flags } = await this.parse(ElementsList)
    try {
      const client = getClient()
      const result = await client.listElements()
      const elements = result.items ?? []
      const headers = ['ID', 'Name', 'Created']
      const rows = elements.map((e) => [
        e.id,
        e.name ?? '',
        e.createdAt ? new Date(e.createdAt as number).toISOString().slice(0, 10) : '',
      ])
      renderOutput(flags.format as OutputFormat, headers, rows, result)
      if (flags.format === 'table') console.log(`\n  ${elements.length} element(s)`)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
