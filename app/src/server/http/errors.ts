export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'REQUEST_FAILED',
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
