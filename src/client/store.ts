const listeners = new Set<() => void>()
let open = false
let workspaceFrame: Window | null = null

/** Current visibility of the frame-wide Ramify workspace. */
export function ramifyWorkspaceOpen(): boolean {
  return open
}

/** Subscribe one React external-store listener. */
export function subscribeRamifyWorkspace(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Open or close the shared workspace surface. */
export function setRamifyWorkspaceOpen(next: boolean): void {
  if (open === next) return
  open = next
  for (const listener of listeners) listener()
}

/** Track the exact embedded Ramify window accepted by the session bridge. */
export function setRamifyWorkspaceFrame(frame: Window | null): void {
  workspaceFrame = frame
}

/** Exact iframe source used to reject messages from unrelated loopback pages. */
export function ramifyWorkspaceFrame(): Window | null {
  return workspaceFrame
}
