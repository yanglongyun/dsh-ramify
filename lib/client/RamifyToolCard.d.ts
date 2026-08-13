import { type ReactNode } from 'react';
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
export declare function shouldAutoOpenRamifyProject(wasRunning: boolean, settled: boolean, failed: boolean): boolean;
/** Native DSH result row for a newly created Ramify project. */
export declare function RamifyProjectToolCard({ block }: ToolCallViewProps): ReactNode;
