import { Args, Command } from '@oclif/core'


import { renderSuccess, renderError } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ElementsOpen extends Command {
  static description = 'Print checkout URL for an element (and attempt to open in browser)'
  static examples = ['<%= config.bin %> elements open elem_123']

  static args = { id: Args.string({ description: 'Element ID', required: true }) }

  async run() {
    const { args } = await this.parse(ElementsOpen)
    try {
      const client = getClient()
      const element = await client.listElements()
      const found = (element.data ?? []).find((e) => e.id === args.id)
      if (!found) {
        renderError(`Element ${args.id} not found`)
        this.exit(1)
      }
      const url = `https://checkout.fungies.io/e/${args.id}`
      renderSuccess(`Checkout URL: ${url}`)
      try {
        const { default: open } = await import('open')
        await open(url)
      } catch {
        // open package not available, just print URL
      }
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
