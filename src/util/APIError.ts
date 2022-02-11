type APIErrorOptions = {
  title?: string;
  status?: number;
  description?: string;
};

class APIError extends Error {
  readonly status: number;
  readonly description: string;

  constructor(error: APIErrorOptions) {
    super(error.title);
    this.status = error.status ?? 500;
    this.description = error.description ?? 'An Unexpected Error Occurred';
  }
}

export default APIError;
