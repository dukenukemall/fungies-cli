import chalk from 'chalk'
import * as p from '@clack/prompts'
import { setPublicKey, setSecretKey, setMode, getBaseUrl, MODE_LABELS, type Mode } from './config.js'
import { printBanner } from './banner.js'

export async function runOnboarding(): Promise<void> {
  printBanner(process.stdout)
  console.log(chalk.hex('#8B5CF6').bold('  Welcome to Fungies CLI! 🍄'))
  console.log(chalk.dim('  Let\'s get you connected to your store.\n'))

  p.intro(chalk.bold('  Quick Setup'))

  const result = await p.group(
    {
      mode: () =>
        p.select({
          message: 'Which environment do you want to use?',
          initialValue: 'prod' as Mode,
          options: [
            { value: 'prod' as Mode, label: 'Production', hint: getBaseUrl('prod') },
            { value: 'sandbox' as Mode, label: 'Sandbox / Staging', hint: getBaseUrl('sandbox') },
          ],
        }),
      _hint: ({ results }) => {
        const mode = results.mode as Mode
        const url = mode === 'sandbox' ? 'https://app.stage.fungies.net/devs/api-keys' : 'https://app.fungies.io/devs/api-keys'
        p.note(`Get your ${MODE_LABELS[mode]} keys at:\n${chalk.cyan(url)}`, 'API keys')
        return Promise.resolve(undefined)
      },
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
    },
  )

  if (p.isCancel(result)) process.exit(0)

  const mode = result.mode as Mode
  setMode(mode)
  setPublicKey(result.publicKey as string, mode)
  if (result.secretKey) setSecretKey(result.secretKey as string, mode)

  p.outro(
    chalk.green(`✓ Connected in ${MODE_LABELS[mode]} mode! `) +
      chalk.dim(`Verify with ${chalk.cyan('fungies auth whoami')} · switch with ${chalk.cyan('fungies mode')}`),
  )
  console.log()
}
