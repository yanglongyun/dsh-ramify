import type { JsonValue } from '@deepseek-ai/dsh-tools';
import type { ResolvedConfig } from './config.js';
interface RuntimeStatus {
    url: string;
    reused: boolean;
    version: string;
}
/** Owns or reuses the Ramify canvas process and its HTTP API. */
export declare class RamifyRuntime {
    private readonly config;
    readonly url: string;
    private child?;
    private ownedInstanceId?;
    private startTask?;
    private reused;
    constructor(config: ResolvedConfig);
    /** Start the packaged runtime or reuse a healthy Ramify instance on the configured port. */
    start(): Promise<RuntimeStatus>;
    /** Stop only the process started by this plugin instance. */
    stop(): Promise<void>;
    /** Issue a JSON request after ensuring that the runtime is healthy. */
    request(path: string, init?: RequestInit, signal?: AbortSignal): Promise<JsonValue>;
    projectUrl(projectId: string): string;
    private startOnce;
    private ensureHealthy;
    private health;
}
export {};
