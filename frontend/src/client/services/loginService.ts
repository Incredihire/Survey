import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import { Body_login_login_access_token, NewPassword, Token, Message, UserPublic } from "../models"

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token
}
export type TDataRecoverPassword = {
  email: string
}
export type TDataResetPassword = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
  email: string
}

export function loginAccessToken(data: TDataLoginAccessToken): CancelablePromise<Token> {
  const { formData } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/login/access-token",
    formData: formData,
    mediaType: "application/x-www-form-urlencoded",
    errors: {
      422: "Validation Error",
    },
  })
}

export function testToken(): CancelablePromise<UserPublic> {
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/login/test-token",
  })
}

export function recoverPassword(data: TDataRecoverPassword): CancelablePromise<Message> {
  const { email } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/password-recovery/{email}",
    path: {
      email,
    },
    errors: {
      422: "Validation Error",
    },
  })
}

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
export function resetPassword(
  data: TDataResetPassword,
): CancelablePromise<Message> {
  const { requestBody } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/reset-password/",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}

/**
 * Recover Password Html Content
 * HTML Content for Password Recovery
 * @returns string Successful Response
 * @throws ApiError
*/
export function recoverPasswordHtmlContent(
  data: TDataRecoverPasswordHtmlContent,
): CancelablePromise<string> {
  const { email } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/password-recovery-html-content/{email}",
    path: {
      email,
    },
    errors: {
      422: "Validation Error",
    },
  })
}
