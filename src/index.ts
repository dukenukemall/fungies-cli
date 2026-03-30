import { run, handle, flush } from '@oclif/core'

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
