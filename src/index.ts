import { run, handle, flush } from '@oclif/core'
import { printBanner } from './lib/banner.js'

// Show the banner only on a bare `fungies` invocation (no args).
// On every other command we stay quiet so output stays scriptable and
// the onboarding wizard (src/hooks/init.ts) owns the first-run welcome.
if (process.argv.slice(2).length === 0) {
  printBanner()
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
