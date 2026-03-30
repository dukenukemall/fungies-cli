import { Command } from '@oclif/core'
import * as p from '@clack/prompts'
import { getClient } from '../../lib/client.js'
import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class OffersCreate extends Command {
  static description = 'Create a new offer interactively'
  static examples = ['<%= config.bin %> offers create']

  async run() {
    try {
      const client = getClient()
      p.intro('Create a new offer')
      const answers = await p.group({
        productId: () => p.text({ message: 'Product ID', validate: (v) => (!v ? 'Required' : undefined) }),
        name: () => p.text({ message: 'Offer name', validate: (v) => (!v ? 'Required' : undefined) }),
        price: () => p.text({ message: 'Price in cents (e.g. 999 = $9.99)', validate: (v) => (!v || isNaN(Number(v)) ? 'Must be a number' : undefined) }),
        currency: () => p.select({
          message: 'Currency',
          options: [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' },
            { value: 'PLN', label: 'PLN' },
          ],
        }),
        type: () => p.select({ message: 'Type', options: [{ value: 'one-time', label: 'One-time' }, { value: 'subscription', label: 'Subscription' }] }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const offerData: Record<string, unknown> = {
        productId: answers.productId,
        name: answers.name,
        price: parseInt(answers.price, 10),
        currency: answers.currency,
      }
      if (answers.type === 'subscription') {
        const interval = await p.select({ message: 'Billing interval', options: [{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' }] })
        if (!p.isCancel(interval)) offerData.recurring = { interval, intervalCount: 1 }
      }
      const offer = await client.createOffer(offerData as never)
      renderSuccess(`Offer created: ${offer.id}`)
      renderJson(offer)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
