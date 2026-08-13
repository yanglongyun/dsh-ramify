/** DeepSeek Harness plugin entry for the Ramify creative branching canvas. */
import type { Context } from '@deepseek-ai/cordis';
import { Config, type Config as ConfigShape } from './config.js';
export declare const name = "ramify";
export declare const inject: string[];
export { Config };
export type { ConfigShape as RamifyConfig };
export { RamifyRuntime } from './runtime.js';
/** Start the canvas and register Ramify's model-facing tools. */
export declare function apply(ctx: Context, config?: ConfigShape): Promise<void>;
