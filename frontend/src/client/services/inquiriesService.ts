import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { InquiryCreate, InquiryPublic } from "../models";

export interface TDataCreateInquiry {
  requestBody: InquiryCreate;
}

export function createInquiry(data: TDataCreateInquiry): CancelablePromise<InquiryPublic> {
  const { requestBody } = data;
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/inquiries/",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
}