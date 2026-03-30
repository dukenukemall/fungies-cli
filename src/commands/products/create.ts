import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import ora from 'ora'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class ProductsCreate extends Command {
  static description = 'Create a new product interactively'
  static examples = ['<%= config.bin %> products create']

  async run() {
    try {
      const client = getClient()
      p.intro('Create a new product')
      const answers = await p.group({
        name: () => p.text({ message: 'Product name', validate: (v) => (!v ? 'Name is required' : undefined) }),
        type: () => p.select({
          message: 'Product type',
          options: [
            { value: 'OneTimePayment', label: 'One-Time Payment' },
            { value: 'Subscription', label: 'Subscription' },
            { value: 'Membership', label: 'Membership' },
            { value: 'GameKey', label: 'Game Key' },
          ],
        }),
        description: () => p.text({ message: 'Description (optional)' }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const spinner = ora('Creating product...').start()
      const product = await client.createProduct(answers)
      spinner.stop()
      renderSuccess(`Product created: ${product.id}`)
      renderJson(product)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
