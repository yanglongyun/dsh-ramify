import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import { RamifySidebarAction, RamifyWorkspaceOverlay } from './RamifySurface.js'
import { RamifyProjectToolCard } from './RamifyToolCard.js'
import { installRamifyStyles } from './styles.js'

export const inject = ['slots']

/** Mount the native DSH sidebar action and frame-wide Ramify workspace. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installRamifyStyles(), 'ramify: client styles')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'ramify',
    order: -10,
    label: 'Ramify',
  }, RamifySidebarAction))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'ramify-workspace',
    order: 20,
    label: 'Ramify workspace',
  }, RamifyWorkspaceOverlay))

  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview',
    key: 'ramify_project_create',
  }, RamifyProjectToolCard))
}

export { RamifySidebarAction, RamifyWorkspaceOverlay } from './RamifySurface.js'
export { RamifyProjectToolCard } from './RamifyToolCard.js'
export {
  ramifyWorkspaceOpen,
  setRamifyWorkspaceOpen,
  subscribeRamifyWorkspace,
} from './store.js'
