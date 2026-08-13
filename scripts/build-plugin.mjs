import { mkdir, rm, writeFile } from 'node:fs/promises'
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

const client = await build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
})
const clientSource = client.outputFiles[0]?.text
if (clientSource === undefined) throw new Error('client bundle emitted no JavaScript')

await writeFile('lib/client.js', [
  'window.__ModuleLoader__.load({',
  '  id: "@ramify/dsh-ramify",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  clientSource,
  '    return module.exports;',
  '  },',
  '});',
  '',
].join('\n'))
