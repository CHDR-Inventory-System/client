type APIErrorOptions = {
  title?: string;
  status?: number;
  description?: string;
  cancelled?: boolean;
};

class APIError extends Error {
  readonly status: number;
  readonly description: string;
  readonly cancelled: boolean;

  constructor(error: APIErrorOptions) {
    super(error.title);
    this.status = error.status ?? 500;
    this.description = error.description ?? 'An unexpected error occurred';
    this.cancelled = error.cancelled ?? false;
  }
}

export default APIError;
