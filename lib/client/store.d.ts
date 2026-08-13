/** Current visibility of the frame-wide Ramify workspace. */
export declare function ramifyWorkspaceOpen(): boolean;
/** Subscribe one React external-store listener. */
export declare function subscribeRamifyWorkspace(listener: () => void): () => void;
/** Open or close the shared workspace surface. */
export declare function setRamifyWorkspaceOpen(next: boolean): void;
