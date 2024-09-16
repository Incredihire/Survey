import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { InquiriesPublic, InquiryCreate, InquiryPublic } from "../models";

export interface TDataCreateInquiry {
  requestBody: InquiryCreate;
}

export interface TDataReadInquiry {
  limit?: number;
  skip?: number;
}

export function createInquiry(
  data: TDataCreateInquiry
): CancelablePromise<InquiryPublic> {
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

export function readInquiries(
  data: TDataReadInquiry = {}
): CancelablePromise<InquiriesPublic> {
  const { limit = 100, skip = 0 } = data;
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/inquiries/",
    query: {
      skip,
      limit,
    },
    errors: {
      422: "Validation Error",
    },
  });
}