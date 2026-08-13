import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'esbuild'

await rm(new URL('../lib', import.meta.url), { recursive: true, force: true })
await mkdir(new URL('../lib', import.meta.url), { recursive: true })

await build({
  entryPoints: [new URL('../src/index.ts', import.meta.url).pathname],
  outfile: new URL('../lib/index.js', import.meta.url).pathname,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
})

const result = await build({
  entryPoints: [new URL('../src/client.tsx', import.meta.url).pathname],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
})
const source = result.outputFiles[0]?.text
if (source === undefined) throw new Error('client build produced no JavaScript')
await writeFile(new URL('../lib/client.js', import.meta.url), [
  'window.__ModuleLoader__.load({',
  '  id: "@ramify/dsh-details-demo",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  source,
  '    return module.exports;',
  '  },',
  '});',
  '',
].join('\n'))
