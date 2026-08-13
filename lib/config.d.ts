import Schema from '@deepseek-ai/schemastery';
/** Deployment configuration for the Ramify runtime owned by this plugin. */
export interface Config {
    /** Loopback TCP port used by the canvas and its local API. */
    port?: number;
    /** Optional data directory; platform-specific Ramify storage is used when omitted. */
    dataDir?: string;
    /** Maximum time to wait for the canvas to become healthy. */
    startupTimeoutMs?: number;
    /** Grace period before an owned runtime is forcefully terminated. */
    shutdownTimeoutMs?: number;
}
/** Cordis configuration schema for the Ramify plugin. */
export declare const Config: Schema<Config>;
export interface ResolvedConfig {
    port: number;
    dataDir?: string;
    startupTimeoutMs: number;
    shutdownTimeoutMs: number;
}
/** Validate programmatic calls that bypass the loader's schema normalization. */
export declare function resolveConfig(config?: Config): ResolvedConfig;
