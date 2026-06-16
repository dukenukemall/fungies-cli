import type { Hook } from '@oclif/core'
import chalk from 'chalk'
import { isAuthenticated } from '../lib/config.js'
import { runOnboarding } from '../lib/onboarding.js'

const SKIP_COMMANDS = ['help', 'version', 'mode', 'auth:set', 'auth:clear', 'auth:whoami']
const HELP_FLAGS = ['--help', '-h', '--version', '-v', '-V']

const hook: Hook<'init'> = async function (opts) {
  const cmd = opts.id ?? ''

  // Skip onboarding when the user just wants help or version info
  // (covers `fungies`, `fungies --help`, `fungies -h`, `fungies <cmd> --help`, etc.)
  const argv = process.argv.slice(2)
  const wantsHelp = argv.length === 0 || argv.some((a) => HELP_FLAGS.includes(a))
  if (wantsHelp) return

  // Skip onboarding for meta/auth/mode commands
  if (cmd === '' || cmd.startsWith('help') || cmd.startsWith('version')) return
  if (SKIP_COMMANDS.includes(cmd)) return

  // Skip if the active mode already has credentials
  if (isAuthenticated()) return

  // Skip onboarding in non-interactive environments (piped, CI, etc.)
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(chalk.red('✗ Not authenticated. Run: fungies auth set --public-key pub_... --secret-key sec_...'))
    process.exit(1)
  }

  await runOnboarding()
}

export default hook
