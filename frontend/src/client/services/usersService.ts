import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import { UserCreate, UserPublic, UserUpdateMe, UpdatePassword, UserRegister, UserUpdate, Message, UsersPublic } from "../models"

export type TDataReadUsers = {
  limit?: number
  skip?: number
}
export type TDataCreateUser = {
  requestBody: UserCreate
}

export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe
}
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword
}
export type TDataRegisterUser = {
  requestBody: UserRegister
}
export type TDataReadUserById = {
  userId: string
}
export type TDataUpdateUser = {
  requestBody: UserUpdate
  userId: string
}
export type TDataDeleteUser = {
  userId: string
}

export function readUsers(data: TDataReadUsers = {}): CancelablePromise<UsersPublic> {
  const { limit = 100, skip = 0 } = data
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/users/",
    query: {
      skip,
      limit,
    },
    errors: {
      422: "Validation Error",
    },
  })
}

export function createUser(data: TDataCreateUser): CancelablePromise<UserPublic> {
  const { requestBody } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/users/",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}

 /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
export function readUserMe(): CancelablePromise<UserPublic> {
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/users/me",
  })
}

/**
 * Register User
 * Create new user without the need to be logged in.
 * @returns UserPublic Successful Response
 * @throws ApiError
 */
export function registerUser(
  data: TDataRegisterUser,
): CancelablePromise<UserPublic> {
  const { requestBody } = data
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/users/signup",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}

/**
 * Read User By Id
 * Get a specific user by id.
 * @returns UserPublic Successful Response
 * @throws ApiError
 */
export function readUserById(
  data: TDataReadUserById,
): CancelablePromise<UserPublic> {
  const { userId } = data
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/users/{user_id}",
    path: {
      user_id: userId,
    },
    errors: {
      422: "Validation Error",
    },
  })
}

/**
 * Update User
 * Update a user.
 * @returns UserPublic Successful Response
 * @throws ApiError
 */
export function updateUser(
  data: TDataUpdateUser,
): CancelablePromise<UserPublic> {
  const { requestBody, userId } = data
  return __request(OpenAPI, {
    method: "PATCH",
    url: "/api/v1/users/{user_id}",
    path: {
      user_id: userId,
    },
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}

/**
 * Delete User
 * Delete a user.
 * @returns Message Successful Response
 * @throws ApiError
 */
export function deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
  const { userId } = data
  return __request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/users/{user_id}",
    path: {
      user_id: userId,
    },
    errors: {
      422: "Validation Error",
    },
  })
}

/* these functions should be ripped out when the corresponding functionality is deleted */
/**
 * Delete User Me
 * Delete own user.
 * @returns Message Successful Response
 * @throws ApiError
 */
export function deleteUserMe(): CancelablePromise<Message> {
  return __request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/users/me",
  })
}

/**
 * Update User Me
 * Update own user.
 * @returns UserPublic Successful Response
 * @throws ApiError
 */
export function updateUserMe(
  data: TDataUpdateUserMe,
): CancelablePromise<UserPublic> {
  const { requestBody } = data
  return __request(OpenAPI, {
    method: "PATCH",
    url: "/api/v1/users/me",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}

/**
 * Update Password Me
 * Update own password.
 * @returns Message Successful Response
 * @throws ApiError
 */
export function updatePasswordMe(
  data: TDataUpdatePasswordMe,
): CancelablePromise<Message> {
  const { requestBody } = data
  return __request(OpenAPI, {
    method: "PATCH",
    url: "/api/v1/users/me/password",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  })
}


