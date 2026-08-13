/** DeepSeek Harness plugin entry for the Ramify creative branching canvas. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { Config, type Config as ConfigShape, resolveConfig } from './config.js'
import { RamifyRuntime } from './runtime.js'
import { registerRamifyTools } from './tools.js'

export const name = 'ramify'
export const inject = ['tools', 'systemPrompt']
export { Config }
export type { ConfigShape as RamifyConfig }
export { RamifyRuntime } from './runtime.js'

/** Start the canvas and register Ramify's model-facing tools. */
export async function apply(ctx: Context, config: ConfigShape = {}): Promise<void> {
  const runtime = new RamifyRuntime(resolveConfig(config))
  const startup = await runtime.start()
  ctx.logger.info(`ramify: canvas ${startup.reused ? 'reused' : 'started'} at ${startup.url}`)
  ctx.effect(() => async () => runtime.stop(), 'ramify.runtime')
  registerRamifyTools(ctx, runtime)
}
