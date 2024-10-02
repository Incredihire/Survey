import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import {
  SchedulePublic,
  TDataCreateSchedule,
  TDataReadSchedule,
} from "../models";

export function createSchedule(
  schedule: TDataCreateSchedule,
): CancelablePromise<SchedulePublic> {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/schedule",
    body: schedule,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
}

export function readSchedule(): CancelablePromise<TDataReadSchedule> {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/schedule",
    errors: {
      422: "Validation Error",
    },
  });
}
