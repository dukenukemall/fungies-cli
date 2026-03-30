import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { getSecretKey } from '../../lib/config.js'
import { FungiesApiClient } from '../../lib/api-client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { requireAuth, formatApiError } from '../../lib/errors.js'

export default class UsersCreate extends Command {
  static description = 'Create a new user interactively'
  static examples = ['<%= config.bin %> users create']

  async run() {
    const key = getSecretKey()
    try {
      requireAuth(key)
      p.intro('Create a new user')
      const answers = await p.group({
        email: () => p.text({ message: 'Email address', validate: (v) => (!v || !v.includes('@') ? 'Valid email required' : undefined) }),
        name: () => p.text({ message: 'Full name (optional)' }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const client = new FungiesApiClient(key)
      const user = await client.createUser(answers)
      renderSuccess(`User created: ${user.id}`)
      renderJson(user)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
