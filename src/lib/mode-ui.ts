import chalk from 'chalk'
import * as p from '@clack/prompts'
import { getMode, getBaseUrl, isAuthenticated, MODE_LABELS, type Mode } from './config.js'

const MODES: Mode[] = ['prod', 'sandbox']

export function printModeStatus(): void {
  const active = getMode()
  console.log(chalk.bold('\n  API mode\n'))
  for (const mode of MODES) {
    const isActive = mode === active
    const pointer = isActive ? chalk.green('●') : chalk.dim('○')
    const label = isActive ? chalk.green.bold(MODE_LABELS[mode]) : chalk.dim(MODE_LABELS[mode])
    const creds = isAuthenticated(mode) ? chalk.dim('keys set') : chalk.yellow('no keys')
    console.log(`  ${pointer} ${label.padEnd(22)} ${chalk.dim(getBaseUrl(mode))}  ${creds}`)
  }
  console.log(chalk.dim('\n  Switch with: ') + chalk.cyan('fungies mode sandbox') + chalk.dim(' or ') + chalk.cyan('fungies mode prod') + '\n')
}

export async function promptModeSelection(): Promise<Mode | undefined> {
  const active = getMode()
  const selected = await p.select({
    message: 'Select API mode',
    initialValue: active,
    options: MODES.map((mode) => ({
      value: mode,
      label: `${MODE_LABELS[mode]}${mode === active ? ' (current)' : ''}`,
      hint: isAuthenticated(mode) ? getBaseUrl(mode) : `${getBaseUrl(mode)} — no keys yet`,
    })),
  })
  if (p.isCancel(selected)) return undefined
  return selected as Mode
}
