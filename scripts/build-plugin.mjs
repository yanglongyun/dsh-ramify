import { mkdir, rm } from 'node:fs/promises'
import { build } from 'esbuild'

await rm('lib', { recursive: true, force: true })
await mkdir('lib', { recursive: true })

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  external: ['@deepseek-ai/*'],
})
