import { getClient } from '../../lib/client.js'
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'


import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class UsersCreate extends Command {
  static description = 'Create a new user interactively'
  static examples = ['<%= config.bin %> users create']

  async run() {
    try {
      p.intro('Create a new user')
      const answers = await p.group({
        email: () => p.text({ message: 'Email address', validate: (v) => (!v || !v.includes('@') ? 'Valid email required' : undefined) }),
        name: () => p.text({ message: 'Full name (optional)' }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const client = getClient()
      const user = await client.createUser(answers)
      renderSuccess(`User created: ${user.id}`)
      renderJson(user)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
