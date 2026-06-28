import { ApiResponse } from '../types/definitions.js';

export class SuccessResponse<T> implements ApiResponse<T> {
  readonly success = true;
  readonly timestamp = new Date().toISOString();

  constructor(
    public readonly message: string,
    public readonly data: T,
  ) {}
}

export class ApiError extends Error {
  readonly name = 'ApiError';

  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
