import type { Hook } from '@oclif/core'
import chalk from 'chalk'
import * as p from '@clack/prompts'
import { isAuthenticated, setPublicKey, setSecretKey } from '../lib/config.js'

const SKIP_COMMANDS = ['help', 'version', 'auth:set', 'auth:clear', 'auth:whoami']
const HELP_FLAGS = ['--help', '-h', '--version', '-v', '-V']

const hook: Hook<'init'> = async function (opts) {
  const cmd = opts.id ?? ''

  // Skip onboarding when the user just wants help or version info
  // (covers `fungies`, `fungies --help`, `fungies -h`, `fungies <cmd> --help`, etc.)
  const argv = process.argv.slice(2)
  const wantsHelp = argv.length === 0 || argv.some(a => HELP_FLAGS.includes(a))
  if (wantsHelp) return

  // Skip onboarding for meta/auth commands
  if (cmd === '' || cmd.startsWith('help') || cmd.startsWith('version')) return
  if (SKIP_COMMANDS.includes(cmd)) return

  // Skip if already authenticated
  if (isAuthenticated()) return

  // Skip onboarding in non-interactive environments (piped, CI, etc.)
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(chalk.red('✗ Not authenticated. Run: fungies auth set --public-key pub_... --secret-key sec_...'))
    process.exit(1)
  }

  // First-time onboarding (interactive TTY only)
  console.log()
  console.log(chalk.hex('#8B5CF6').bold('  Welcome to Fungies CLI! 🍄'))
  console.log(chalk.dim('  Let\'s get you connected to your store.\n'))
  console.log(chalk.dim(`  Get your API keys at: ${chalk.cyan('https://app.fungies.io/devs/api-keys')}\n`))

  p.intro(chalk.bold('  Quick Setup'))

  const keys = await p.group(
    {
      publicKey: () =>
        p.text({
          message: 'Public Key',
          placeholder: 'pub_...',
          validate: (val) => {
            if (!val) return 'Public key is required'
            if (!val.startsWith('pub_')) return 'Public key must start with "pub_"'
          },
        }),
      secretKey: () =>
        p.text({
          message: 'Secret Key ' + chalk.dim('(needed for write operations, press Enter to skip)'),
          placeholder: 'sec_...',
          validate: (val) => {
            if (val && !val.startsWith('sec_')) return 'Secret key must start with "sec_"'
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel(chalk.dim('Setup cancelled. Run any command again to retry, or use: fungies auth set'))
        process.exit(0)
      },
    }
  )

  if (p.isCancel(keys)) {
    process.exit(0)
  }

  setPublicKey(keys.publicKey as string)
  if (keys.secretKey) setSecretKey(keys.secretKey as string)

  p.outro(
    chalk.green('✓ Connected! ') +
    chalk.dim(`Run ${chalk.cyan('fungies auth whoami')} to verify, or try ${chalk.cyan('fungies orders list')}`)
  )

  console.log()
}

export default hook
