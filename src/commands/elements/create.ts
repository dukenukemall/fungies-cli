import { getClient } from '../../lib/client.js'
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'


import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ElementsCreate extends Command {
  static description = 'Create a checkout element interactively'
  static examples = ['<%= config.bin %> elements create']

  async run() {
    try {
      p.intro('Create a checkout element')
      const answers = await p.group({
        name: () => p.text({ message: 'Element name', validate: (v) => (!v ? 'Required' : undefined) }),
        offerIds: () => p.text({ message: 'Offer IDs (comma-separated)', validate: (v) => (!v ? 'At least one offer ID required' : undefined) }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const client = getClient()
      const element = await client.createElement({
        name: answers.name,
        offers: answers.offerIds.split(',').map((id) => id.trim()).filter(Boolean),
      })
      renderSuccess(`Element created: ${element.id}`)
      renderJson(element)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
