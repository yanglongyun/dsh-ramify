import type { zhCN } from "./zh-CN";

export type MessageKey = keyof typeof zhCN;
export type Messages = Record<MessageKey, string>;
