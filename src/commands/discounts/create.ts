import { getClient } from '../../lib/client.js'
import { Command } from '@oclif/core'
import * as p from '@clack/prompts'


import { renderSuccess, renderError, renderJson } from '../../lib/output.js'
import { formatApiError } from '../../lib/errors.js'

export default class DiscountsCreate extends Command {
  static description = 'Create a discount interactively'
  static examples = ['<%= config.bin %> discounts create']

  async run() {
    try {
      p.intro('Create a discount')
      const type = await p.select({ message: 'Discount type', options: [{ value: 'coupon', label: 'Coupon code' }, { value: 'sale', label: 'Automatic sale' }] })
      if (p.isCancel(type)) { p.cancel('Cancelled'); this.exit(0) }
      const answers = await p.group({
        ...(type === 'coupon' ? { code: () => p.text({ message: 'Coupon code', validate: (v) => (!v ? 'Required' : undefined) }) } : {}),
        name: () => p.text({ message: 'Display name (optional)' }),
        amountType: () => p.select({ message: 'Amount type', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }] }),
        amount: () => p.text({ message: 'Amount (percentage or cents)', validate: (v) => (!v || isNaN(Number(v)) ? 'Must be a number' : undefined) }),
        expiresAt: () => p.text({ message: 'Expiry date (YYYY-MM-DD, optional)' }),
      })
      if (p.isCancel(answers)) { p.cancel('Cancelled'); this.exit(0) }
      const data: Record<string, unknown> = { type, ...answers, amount: parseInt(answers.amount as string, 10) }
      if (!(answers as Record<string, unknown>).expiresAt) delete data.expiresAt
      const client = getClient()
      const discount = await client.createDiscount(data as never)
      renderSuccess(`Discount created: ${discount.id}`)
      renderJson(discount)
    } catch (err) {
      renderError(formatApiError(err))
      this.exit(1)
    }
  }
}
