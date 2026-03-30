import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class ElementsCreate extends Command {
  static description = 'Create a checkout element interactively'
  static examples = ['<%= config.bin %> elements create']

  async run() {
    const key = getSecretKey()
    try {
      requireAuth(key)
      p.intro('Create a checkout element')
      const answers = await p.group({
        name: () => p.text({ message: 'Element name', validate: (v) => (!v ? 'Required' : undefined) }),
        offerIds: () => p.text({ message: 'Offer IDs (comma-separated)', validate: (v) => (!v ? 'At least one offer ID required' : undefined) }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const client = new FungiesApiClient(key)
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
