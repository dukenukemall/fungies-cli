import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/**/*.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: false,
  shims: true,
})
