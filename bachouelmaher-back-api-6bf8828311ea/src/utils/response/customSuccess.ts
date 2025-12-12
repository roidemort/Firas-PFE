import { response, Response } from 'express';

response.customSuccess = function (
  httpStatusCode: number,
  message: string,
  data: any = null,
  status: boolean
): Response {
  return this.status(httpStatusCode).json({ status, message, data });
};
