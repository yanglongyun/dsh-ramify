/** Current visibility of the frame-wide Ramify workspace. */
export declare function ramifyWorkspaceOpen(): boolean;
/** Subscribe one React external-store listener. */
export declare function subscribeRamifyWorkspace(listener: () => void): () => void;
/** Open or close the shared workspace surface. */
export declare function setRamifyWorkspaceOpen(next: boolean): void;
/** Track the exact embedded Ramify window accepted by the session bridge. */
export declare function setRamifyWorkspaceFrame(frame: Window | null): void;
/** Exact iframe source used to reject messages from unrelated loopback pages. */
export declare function ramifyWorkspaceFrame(): Window | null;
