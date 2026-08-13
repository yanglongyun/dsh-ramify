import { randomUUID } from 'node:crypto'
import { type ChildProcess, spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { JsonValue } from '@deepseek-ai/dsh-tools'
import type { ResolvedConfig } from './config.js'

interface HealthResponse {
  service: string
  version?: string
  pid?: number
  instanceId?: string | null
}

interface RuntimeStatus {
  url: string
  reused: boolean
  version: string
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds))
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isJsonValue)
  if (typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).every(isJsonValue)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Owns or reuses the loopback Ramify canvas process and its HTTP API. */
export class RamifyRuntime {
  readonly url: string
  private child?: ChildProcess
  private ownedInstanceId?: string
  private startTask?: Promise<RuntimeStatus>
  private reused = false

  constructor(private readonly config: ResolvedConfig) {
    this.url = `http://127.0.0.1:${config.port}`
  }

  /** Start the packaged runtime or reuse a healthy Ramify instance on the configured port. */
  start(): Promise<RuntimeStatus> {
    return this.startTask ??= this.startOnce().catch((error) => {
      this.startTask = undefined
      throw error
    })
  }

  /** Stop only the process started by this plugin instance. */
  async stop(): Promise<void> {
    const child = this.child
    this.child = undefined
    this.startTask = undefined
    if (!child || child.exitCode !== null || child.killed) return
    child.kill('SIGTERM')
    const exited = new Promise<void>(resolveExit => child.once('exit', () => resolveExit()))
    const timedOut = delay(this.config.shutdownTimeoutMs).then(() => 'timeout' as const)
    if (await Promise.race([exited.then(() => 'exited' as const), timedOut]) === 'timeout') {
      child.kill('SIGKILL')
      await exited
    }
  }

  /** Issue a JSON request after ensuring that the runtime is healthy. */
  async request(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<JsonValue> {
    await this.ensureHealthy()
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      signal,
      headers: {
        ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    })
    const contentType = response.headers.get('content-type') ?? ''
    const body: unknown = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    if (!response.ok) {
      const detail = body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${response.status}`
      throw new Error(`Ramify API ${response.status}: ${detail}`)
    }
    if (!isJsonValue(body)) throw new Error('Ramify API returned a non-JSON value')
    return body
  }

  projectUrl(projectId: string): string {
    return `${this.url}/projects/${encodeURIComponent(projectId)}`
  }

  private async startOnce(): Promise<RuntimeStatus> {
    const existing = await this.health()
    if (existing) {
      this.reused = true
      return { url: this.url, reused: true, version: existing.version ?? 'unknown' }
    }

    const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
    const appDirectory = resolve(pluginRoot, 'app')
    const serverEntry = resolve(appDirectory, 'dist/server.mjs')
    const instanceId = randomUUID()
    let stderr = ''
    const child = spawn(process.execPath, [serverEntry], {
      cwd: appDirectory,
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        PORT: String(this.config.port),
        RAMIFY_APP_DIR: appDirectory,
        RAMIFY_INSTANCE_ID: instanceId,
        RAMIFY_VERSION: '0.1.0',
        ...(this.config.dataDir === undefined ? {} : { RAMIFY_DATA_DIR: this.config.dataDir }),
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    this.child = child
    this.ownedInstanceId = instanceId
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString('utf8')}`.slice(-16_384)
    })
    child.once('exit', () => {
      if (this.child === child) {
        this.child = undefined
        this.startTask = undefined
      }
    })

    const deadline = Date.now() + this.config.startupTimeoutMs
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(`Ramify runtime exited with code ${child.exitCode}: ${stderr.trim() || 'no diagnostics'}`)
      }
      const ready = await this.health()
      if (ready?.instanceId === instanceId) {
        this.reused = false
        return { url: this.url, reused: false, version: ready.version ?? '0.1.0' }
      }
      await delay(100)
    }

    await this.stop()
    throw new Error(`Ramify runtime did not become healthy within ${this.config.startupTimeoutMs}ms${stderr ? `: ${stderr.trim()}` : ''}`)
  }

  private async ensureHealthy(): Promise<void> {
    const health = await this.health()
    if (health) return
    if (this.child && this.child.exitCode === null) {
      throw new Error('Ramify runtime is not responding')
    }
    this.startTask = undefined
    await this.start()
  }

  private async health(): Promise<HealthResponse | undefined> {
    try {
      const response = await fetch(`${this.url}/api/health`, { signal: AbortSignal.timeout(500) })
      if (!response.ok) return undefined
      const value = await response.json() as Partial<HealthResponse>
      return value.service === 'ramify' ? value as HealthResponse : undefined
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') return undefined
      if (error instanceof TypeError) return undefined
      if (error instanceof DOMException && error.name === 'AbortError') return undefined
      throw new Error(`Ramify health check failed: ${errorMessage(error)}`, { cause: error })
    }
  }
}
