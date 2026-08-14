import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import { RamifySidebarAction, RamifyWorkspaceOverlay } from './RamifySurface.js'
import { RamifyProjectToolCard } from './RamifyToolCard.js'
import { RamifySessionBridge } from './RamifySessionBridge.js'
import { installRamifyStyles } from './styles.js'
import { setRamifyHostPreferences } from './store.js'

export const inject = ['slots', 'locale', 'theme']

/** Mount the native DSH sidebar action and frame-wide Ramify workspace. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installRamifyStyles(), 'ramify: client styles')

  const syncHostPreferences = (): void => {
    setRamifyHostPreferences({
      locale: ctx.locale.getLocale().active === 'en' ? 'en' : 'zh-CN',
      theme: ctx.theme.getTheme().active.colorScheme,
    })
  }
  syncHostPreferences()
  ctx.effect(() => {
    const offLocale = ctx.on('locale/change', syncHostPreferences)
    const offTheme = ctx.on('theme/change', syncHostPreferences)
    return () => { offLocale(); offTheme() }
  }, 'ramify: follow DSH locale and theme')

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

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'ramify-session-bridge',
  }, RamifySessionBridge))
}

export { RamifySidebarAction, RamifyWorkspaceOverlay } from './RamifySurface.js'
export { RamifyProjectToolCard } from './RamifyToolCard.js'
export {
  ramifyWorkspaceOpen,
  setRamifyWorkspaceOpen,
  subscribeRamifyWorkspace,
} from './store.js'
