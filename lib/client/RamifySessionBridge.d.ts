import { type ReactNode } from 'react';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
type BridgeProps = PropsRuntime<'conversation.input.dock'>;
type CreateRequest = {
    type: 'ramify:dsh-submit';
    version: 1;
    requestId: string;
    action: 'create';
    projectId: string;
    rootId: string;
    nodeIds: string[];
    prompt: string;
    count: number;
};
type BranchRequest = {
    type: 'ramify:dsh-submit';
    version: 1;
    requestId: string;
    action: 'branch';
    projectId: string;
    nodeId: string;
    nodeIds: string[];
    nodeTitle: string;
    prompt: string;
    count: number;
};
export declare function bridgeRequest(value: unknown): CreateRequest | BranchRequest | null;
export declare function promptFor(request: CreateRequest | BranchRequest): string;
/** Session-scoped, renderless bridge from the embedded canvas to DSH's official composer actions. */
export declare function RamifySessionBridge({ inputActions }: BridgeProps): ReactNode;
export {};
