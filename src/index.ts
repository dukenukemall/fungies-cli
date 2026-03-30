import { run, handle, flush } from '@oclif/core'
import chalk from 'chalk'
import { isAuthenticated } from './lib/config.js'

const BANNER = `
${chalk.hex('#8B5CF6')('  ███████╗██╗   ██╗███╗   ██╗ ██████╗ ██╗███████╗███████╗')}
${chalk.hex('#9D6FDB')('  ██╔════╝██║   ██║████╗  ██║██╔════╝ ██║██╔════╝██╔════╝')}
${chalk.hex('#B080C4')('  █████╗  ██║   ██║██╔██╗ ██║██║  ███╗██║█████╗  ███████╗')}
${chalk.hex('#C490A8')('  ██╔══╝  ██║   ██║██║╚██╗██║██║   ██║██║██╔══╝  ╚════██║')}
${chalk.hex('#D4699B')('  ██║     ╚██████╔╝██║ ╚████║╚██████╔╝██║███████╗███████║')}
${chalk.hex('#E05A2A')('  ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚══════╝╚══════╝')}
  ${chalk.dim('Merchant of Record CLI  ·  fungies.io')}
`

// Show banner on TTY (skip when output is piped/redirected)
if (process.stderr.isTTY) {
  process.stderr.write(BANNER + '\n')
}

await run(process.argv.slice(2), import.meta.url)
  .catch(async (error: unknown) => {
    const { Errors } = await import('@oclif/core')
    if (error instanceof Errors.CLIError) {
      process.exitCode = error.oclif?.exit ?? 1
    }
    await handle(error as Error)
  })
  .finally(async () => {
    await flush()
  })
