import Schema from '@deepseek-ai/schemastery'

/** Deployment configuration for the Ramify runtime owned by this plugin. */
export interface Config {
  /** TCP port used by the canvas and its API. */
  port?: number
  /** Optional data directory; platform-specific Ramify storage is used when omitted. */
  dataDir?: string
  /** Maximum time to wait for the canvas to become healthy. */
  startupTimeoutMs?: number
  /** Grace period before an owned runtime is forcefully terminated. */
  shutdownTimeoutMs?: number
}

/** Cordis configuration schema for the Ramify plugin. */
export const Config: Schema<Config> = Schema.object({
  port: Schema.number().default(9519).description('TCP port for the Ramify canvas.'),
  dataDir: Schema.string().description('Optional Ramify data directory.'),
  startupTimeoutMs: Schema.number().default(5000).description('Canvas startup timeout in milliseconds.'),
  shutdownTimeoutMs: Schema.number().default(3000).description('Canvas shutdown grace period in milliseconds.'),
})

export interface ResolvedConfig {
  port: number
  dataDir?: string
  startupTimeoutMs: number
  shutdownTimeoutMs: number
}

/** Validate programmatic calls that bypass the loader's schema normalization. */
export function resolveConfig(config: Config = {}): ResolvedConfig {
  const port = config.port ?? 9519
  const startupTimeoutMs = config.startupTimeoutMs ?? 5000
  const shutdownTimeoutMs = config.shutdownTimeoutMs ?? 3000
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new TypeError('ramify: port must be an integer between 1 and 65535')
  }
  if (!Number.isFinite(startupTimeoutMs) || startupTimeoutMs <= 0) {
    throw new TypeError('ramify: startupTimeoutMs must be a positive number')
  }
  if (!Number.isFinite(shutdownTimeoutMs) || shutdownTimeoutMs <= 0) {
    throw new TypeError('ramify: shutdownTimeoutMs must be a positive number')
  }
  if (config.dataDir !== undefined && config.dataDir.trim() === '') {
    throw new TypeError('ramify: dataDir must not be empty')
  }
  return {
    port,
    startupTimeoutMs,
    shutdownTimeoutMs,
    ...(config.dataDir === undefined ? {} : { dataDir: config.dataDir }),
  }
}
