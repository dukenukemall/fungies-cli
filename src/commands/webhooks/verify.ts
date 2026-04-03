import { Command, Flags } from '@oclif/core'
import { createHmac } from 'node:crypto'
import { renderSuccess, renderError } from '../../lib/output.js'

export default class WebhooksVerify extends Command {
  static description = 'Verify a Fungies webhook signature'
  static examples = [
    '<%= config.bin %> webhooks verify --payload \'{"event":"payment.success"}\' --signature abc123 --secret sec_your_key',
    '<%= config.bin %> webhooks verify --payload-file ./payload.json --signature abc123 --secret sec_your_key',
  ]

  static flags = {
    payload: Flags.string({
      description: 'Raw webhook payload string (JSON)',
      exclusive: ['payload-file'],
    }),
    'payload-file': Flags.string({
      description: 'Path to a file containing the raw webhook payload',
      exclusive: ['payload'],
    }),
    signature: Flags.string({
      description: 'Signature value from the x-fngs-signature header',
      required: true,
    }),
    secret: Flags.string({
      description: 'Your Fungies secret key (sec_...) used to sign webhooks',
      required: true,
    }),
    algorithm: Flags.string({
      description: 'HMAC algorithm used for signing',
      default: 'sha256',
      options: ['sha256', 'sha512'],
    }),
  }

  async run() {
    const { flags } = await this.parse(WebhooksVerify)

    let payload: string

    if (flags['payload-file']) {
      const { readFileSync } = await import('node:fs')
      try {
        payload = readFileSync(flags['payload-file'], 'utf8')
      } catch {
        renderError(`Cannot read file: ${flags['payload-file']}`)
        this.exit(1)
        return
      }
    } else if (flags.payload) {
      payload = flags.payload
    } else {
      renderError('Provide --payload or --payload-file')
      this.exit(1)
      return
    }

    const secret = flags.secret
    const signature = flags.signature
    const algorithm = flags.algorithm as string

    // Compute expected signature
    const expected = createHmac(algorithm, secret).update(payload, 'utf8').digest('hex')

    // Timing-safe comparison
    const match = timingSafeEqual(expected, signature)

    if (match) {
      renderSuccess(`Signature is VALID  (${algorithm.toUpperCase()})`)
      this.log()
      this.log(`  Expected:  ${expected}`)
      this.log(`  Received:  ${signature}`)
    } else {
      renderError(`Signature is INVALID (${algorithm.toUpperCase()})`)
      this.log()
      this.log(`  Expected:  ${expected}`)
      this.log(`  Received:  ${signature}`)
      this.log()
      this.log('  Possible causes:')
      this.log('  · Wrong secret key — check app.fungies.io/devs/api-keys')
      this.log('  · Payload was modified in transit or by a proxy')
      this.log('  · You are using the raw body before JSON parsing? (required)')
      this.log('  · Algorithm mismatch — try --algorithm sha512')
      this.exit(1)
    }
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Both strings are hashed again so length differences don't leak.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const ha = createHmac('sha256', 'fungies-cli-cmp').update(a).digest()
  const hb = createHmac('sha256', 'fungies-cli-cmp').update(b).digest()
  if (ha.length !== hb.length) return false
  let diff = 0
  for (let i = 0; i < ha.length; i++) {
    diff |= ha[i] ^ hb[i]
  }
  return diff === 0
}
