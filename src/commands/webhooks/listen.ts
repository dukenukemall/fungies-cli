import { Command, Flags } from '@oclif/core'
import { createHmac } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import chalk from 'chalk'

// ─── Pretty-print helpers ───────────────────────────────────────────────────

const EVENT_COLORS: Record<string, (s: string) => string> = {
  'payment.success': (s) => chalk.green(s),
  'payment.refunded': (s) => chalk.yellow(s),
  'payment.failed': (s) => chalk.red(s),
  'subscription.created': (s) => chalk.hex('#8B5CF6')(s),
  'subscription.interval': (s) => chalk.hex('#8B5CF6')(s),
  'subscription.updated': (s) => chalk.hex('#E05A2A')(s),
  'subscription.cancelled': (s) => chalk.red(s),
}

const EVENT_ICONS: Record<string, string> = {
  'payment.success': '💰',
  'payment.refunded': '↩️ ',
  'payment.failed': '❌',
  'subscription.created': '✨',
  'subscription.interval': '🔄',
  'subscription.updated': '✏️ ',
  'subscription.cancelled': '🚫',
}

function colorEvent(type: string): string {
  const colorFn = EVENT_COLORS[type] ?? ((s: string) => chalk.white(s))
  return colorFn(type)
}

function iconFor(type: string): string {
  return EVENT_ICONS[type] ?? '📦'
}

function separator(): void {
  console.log(chalk.dim('  ' + '─'.repeat(62)))
}

function formatValue(val: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (val === null || val === undefined) return chalk.dim('null')
  if (typeof val === 'boolean') return chalk.yellow(String(val))
  if (typeof val === 'number') return chalk.cyan(String(val))
  if (typeof val === 'string') return chalk.green(`"${val}"`)
  if (Array.isArray(val)) {
    if (val.length === 0) return chalk.dim('[]')
    const items = val.map((v) => `${pad}    ${formatValue(v, indent + 1)}`).join(',\n')
    return `[\n${items}\n${pad}  ]`
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>)
    if (entries.length === 0) return chalk.dim('{}')
    const lines = entries
      .map(([k, v]) => `${pad}    ${chalk.blue(k)}: ${formatValue(v, indent + 1)}`)
      .join('\n')
    return `{\n${lines}\n${pad}  }`
  }
  return String(val)
}

function prettyPrintPayload(body: Record<string, unknown>, indent = 1): void {
  const pad = '  '.repeat(indent)
  for (const [key, val] of Object.entries(body)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      console.log(`${pad}${chalk.blue(key)}:`)
      prettyPrintPayload(val as Record<string, unknown>, indent + 1)
    } else {
      console.log(`${pad}${chalk.blue(key)}: ${formatValue(val, indent)}`)
    }
  }
}

// ─── Signature verification ─────────────────────────────────────────────────

function verifySignature(secret: string, payload: string, sig: string): boolean {
  const expected = createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  const ha = createHmac('sha256', 'cmp').update(expected).digest()
  const hb = createHmac('sha256', 'cmp').update(sig).digest()
  if (ha.length !== hb.length) return false
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i]
  return diff === 0
}

// ─── Body reader ────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

// ─── Main command ───────────────────────────────────────────────────────────

export default class WebhooksListen extends Command {
  static description =
    'Start a local HTTP server to receive and display incoming Fungies webhook events'

  static examples = [
    '<%= config.bin %> webhooks listen',
    '<%= config.bin %> webhooks listen --port 4242',
    '<%= config.bin %> webhooks listen --secret sec_your_key --port 3000',
    '<%= config.bin %> webhooks listen --path /webhooks/fungies',
  ]

  static flags = {
    port: Flags.integer({
      description: 'Local port to listen on',
      default: 4242,
      char: 'p',
    }),
    path: Flags.string({
      description: 'URL path to listen on',
      default: '/webhook',
    }),
    secret: Flags.string({
      description:
        'Secret key to verify webhook signatures (sec_... or any signing secret). If omitted, signatures are not verified.',
    }),
    'print-full': Flags.boolean({
      description: 'Print the full raw JSON payload (unformatted)',
      default: false,
    }),
    'filter-event': Flags.string({
      description: 'Only display events matching this type (e.g. payment.success)',
      multiple: true,
    }),
  }

  async run() {
    const { flags } = await this.parse(WebhooksListen)

    const port = flags.port
    const path = flags.path.startsWith('/') ? flags.path : `/${flags.path}`
    const secret = flags.secret
    const filterEvents = flags['filter-event'] ?? []

    let requestCount = 0
    let errorCount = 0

    console.log()
    console.log(
      chalk.bold.hex('#8B5CF6')('  ⚡ Fungies Webhook Listener') +
      chalk.dim(` · Port ${port}${path}`),
    )
    separator()
    console.log(`  ${chalk.dim('Listening on')} ${chalk.cyan(`http://localhost:${port}${path}`)}`)
    if (secret) {
      console.log(`  ${chalk.dim('Verification')} ${chalk.green('✓ Signature checking enabled')}`)
    } else {
      console.log(
        `  ${chalk.dim('Verification')} ${chalk.yellow('⚠ No --secret provided — signatures not verified')}`,
      )
    }
    if (filterEvents.length > 0) {
      console.log(`  ${chalk.dim('Filter')}       ${chalk.white(filterEvents.join(', '))}`)
    }
    separator()
    console.log()
    console.log(
      chalk.dim(
        '  Point your Fungies dashboard webhook URL to your public tunnel, e.g.:',
      ),
    )
    console.log(chalk.dim(`  ngrok http ${port}  →  copy the HTTPS URL → paste into`) +
      chalk.cyan(' app.fungies.io/devs/webhooks'))
    console.log()
    separator()
    console.log()

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const url = req.url ?? '/'

      // Health-check endpoint
      if (req.method === 'GET' && url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', listener: 'fungies-cli' }))
        return
      }

      if (req.method !== 'POST' || url !== path) {
        res.writeHead(404)
        res.end('Not found')
        return
      }

      const rawBody = await readBody(req).catch(() => '')
      requestCount++
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

      // Signature check
      const sig = req.headers['x-fngs-signature'] as string | undefined
      let sigStatus = ''
      if (secret) {
        if (!sig) {
          sigStatus = chalk.yellow(' [no signature header]')
        } else if (verifySignature(secret, rawBody, sig)) {
          sigStatus = chalk.green(' [✓ verified]')
        } else {
          sigStatus = chalk.red(' [✗ signature mismatch]')
          errorCount++
        }
      }

      // Parse payload
      let body: Record<string, unknown> = {}
      try {
        body = JSON.parse(rawBody) as Record<string, unknown>
      } catch {
        console.log(
          chalk.red(`  [${timestamp}] #${requestCount} `) +
          chalk.red('Invalid JSON payload'),
        )
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ received: false, error: 'invalid json' }))
        return
      }

      const eventType = (body.event ?? body.type ?? body.eventType ?? 'unknown') as string

      // Filter check
      if (filterEvents.length > 0 && !filterEvents.includes(eventType)) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ received: true, skipped: true }))
        return
      }

      // Header line
      console.log(
        `  ${chalk.dim(`[${timestamp}]`)} ` +
        `${chalk.bold(`#${requestCount}`)} ` +
        `${iconFor(eventType)} ${colorEvent(eventType)}` +
        sigStatus,
      )

      // Pretty print or raw
      if (flags['print-full']) {
        console.log(chalk.dim('  ── raw payload ──────────────────────────────'))
        console.log(
          rawBody
            .split('\n')
            .map((l) => '  ' + l)
            .join('\n'),
        )
      } else {
        console.log()
        prettyPrintPayload(body)
      }

      console.log()
      separator()
      console.log()

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ received: true }))
    })

    server.listen(port, () => {
      // ready
    })

    // Graceful shutdown
    const shutdown = () => {
      console.log()
      separator()
      console.log(
        `  ${chalk.bold('Session summary')} · ${chalk.cyan(requestCount)} request(s) received` +
        (errorCount > 0 ? `, ${chalk.red(errorCount)} signature error(s)` : ''),
      )
      console.log()
      server.close(() => process.exit(0))
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    // Keep alive
    await new Promise<void>(() => { /* never resolves — server runs until SIGINT */ })
  }
}
