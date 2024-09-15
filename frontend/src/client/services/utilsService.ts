import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { Message } from "../models";

export type TDataTestEmail = {
  emailTo: string;
};

export function testEmail(data: TDataTestEmail): CancelablePromise<Message> {
  const { emailTo } = data;
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/utils/test-email/",
    query: {
      email_to: emailTo,
    },
    errors: {
      422: "Validation Error",
    },
  });
}