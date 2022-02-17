type APIErrorOptions = {
  title?: string;
  status?: number;
  description?: string;
  cancelled?: boolean;
};

class APIError extends Error {
  readonly status: number;
  readonly description: string;
  readonly cancelled?: boolean = false;

  constructor(error: APIErrorOptions) {
    super(error.title);
    this.status = error.status ?? 500;
    this.description = error.description ?? 'An Unexpected Error Occurred';
    this.cancelled = error.cancelled;
  }
}

export default APIError;
