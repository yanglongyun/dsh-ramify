const listeners = new Set<() => void>()
let open = false

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
