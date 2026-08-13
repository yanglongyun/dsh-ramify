export type DshCreateRequest = {
  action: 'create'; projectId: string; rootId: string; nodeIds: string[]; prompt: string; count: number;
};
export type DshBranchRequest = {
  action: 'branch'; projectId: string; nodeId: string; nodeIds: string[]; nodeTitle: string; prompt: string; count: number;
};
type DshRequest = DshCreateRequest | DshBranchRequest;

function dshParentOrigin(): string | null {
  if (window.parent === window || !document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isDshEmbedded(): boolean {
  return dshParentOrigin() !== null;
}

/** Submit one canvas intent to the enclosing DSH session and await admission. */
export function submitToDsh(request: DshRequest): Promise<void> {
  const targetOrigin = dshParentOrigin();
  if (targetOrigin === null) return Promise.reject(new Error('DSH_SESSION_UNAVAILABLE'));
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as Record<string, unknown> | null;
      if (event.source !== window.parent || event.origin !== targetOrigin) return;
      if (data?.type !== 'ramify:dsh-accepted' || data.version !== 1 || data.requestId !== requestId) return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      resolve();
    };
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('DSH_SESSION_UNAVAILABLE'));
    }, 4_000);
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'ramify:dsh-submit', version: 1, requestId, ...request }, targetOrigin);
  });
}
