import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

interface WebhookEvent {
  type: string
  description: string
  triggers: string
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    type: 'payment.success',
    description: 'Fires when a payment is successfully processed.',
    triggers: 'One-time purchases, first subscription payments, subscription renewals',
  },
  {
    type: 'payment.refunded',
    description: 'Fires when a payment or partial payment is refunded.',
    triggers: 'Manual refunds issued from the dashboard or via API',
  },
  {
    type: 'payment.failed',
    description: 'Fires when a payment attempt fails.',
    triggers: 'Card declines, expired cards, insufficient funds, failed renewals',
  },
  {
    type: 'subscription.created',
    description: 'Fires when a new subscription is created.',
    triggers: 'Customer completes checkout for a subscription product',
  },
  {
    type: 'subscription.interval',
    description: 'Fires on each successful subscription renewal.',
    triggers: 'Monthly/yearly renewal payment succeeds',
  },
  {
    type: 'subscription.updated',
    description: 'Fires when a subscription is modified.',
    triggers: 'Plan upgrade/downgrade, pause, status changes',
  },
  {
    type: 'subscription.cancelled',
    description: 'Fires when a subscription is cancelled.',
    triggers: 'Customer cancels, admin cancels via API or dashboard, payment failure cancellation',
  },
]

export default class WebhooksEvents extends Command {
  static description = 'List all supported Fungies webhook event types'
  static examples = [
    '<%= config.bin %> webhooks events',
    '<%= config.bin %> webhooks events --format json',
  ]

  static flags = {
    format: Flags.string({
      description: 'Output format',
      options: ['table', 'json'],
      default: 'table',
    }),
  }

  async run() {
    const { flags } = await this.parse(WebhooksEvents)

    if (flags.format === 'json') {
      console.log(JSON.stringify(WEBHOOK_EVENTS, null, 2))
      return
    }

    console.log()
    console.log(chalk.bold('  Fungies Webhook Events'))
    console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
    console.log()

    for (const event of WEBHOOK_EVENTS) {
      const [category, action] = event.type.split('.')
      const coloredType =
        category === 'payment'
          ? chalk.hex('#8B5CF6')(event.type)
          : chalk.hex('#E05A2A')(event.type)

      console.log(`  ${coloredType}`)
      console.log(`  ${chalk.white(event.description)}`)
      console.log(`  ${chalk.dim('Triggers:')} ${chalk.dim(event.triggers)}`)
      console.log()
    }

    console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
    console.log(
      chalk.dim(`  ${WEBHOOK_EVENTS.length} events · Configure at `) +
      chalk.cyan('https://app.fungies.io/devs/webhooks') +
      chalk.dim(' · Docs: ') +
      chalk.cyan('https://help.fungies.io/for-saas-developers/using-webhooks'),
    )
    console.log()
  }
}
