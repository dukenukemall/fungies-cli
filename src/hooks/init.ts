import type { Hook } from '@oclif/core'

const hook: Hook<'init'> = async function () {
  // Hook runs on every command init -- auth checking done per-command
}

export default hook
