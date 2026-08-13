import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export declare const inject: string[];
/** Mount the native DSH sidebar action and frame-wide Ramify workspace. */
export declare function apply(ctx: ClientContext): void;
export { RamifySidebarAction, RamifyWorkspaceOverlay } from './RamifySurface.js';
export { RamifyProjectToolCard } from './RamifyToolCard.js';
export { ramifyWorkspaceOpen, setRamifyWorkspaceOpen, subscribeRamifyWorkspace, } from './store.js';
