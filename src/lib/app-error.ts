import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  statusCode: ContentfulStatusCode;

  constructor(message: string, statusCode: ContentfulStatusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
