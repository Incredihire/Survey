import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { ItemCreate, ItemPublic, ItemUpdate, ItemsPublic, Message } from "../models";

export type TDataReadItems = {
  limit?: number;
  skip?: number;
};
export type TDataCreateItem = {
  requestBody: ItemCreate;
};
export type TDataReadItem = {
  id: string;
};
export type TDataUpdateItem = {
  id: string;
  requestBody: ItemUpdate;
};
export type TDataDeleteItem = {
  id: string;
};

export function readItems(data: TDataReadItems = {}): CancelablePromise<ItemsPublic> {
  const { limit = 100, skip = 0 } = data;
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/items/",
    query: {
      skip,
      limit,
    },
    errors: {
      422: "Validation Error",
    },
  });
}

export function createItem(data: TDataCreateItem): CancelablePromise<ItemPublic> {
  const { requestBody } = data;
  return __request(OpenAPI, {
    method: "POST",
    url: "/api/v1/items/",
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
}

export function readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
  const { id } = data;
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/items/{id}",
    path: {
      id,
    },
    errors: {
      422: "Validation Error",
    },
  });
}

export function updateItem(data: TDataUpdateItem): CancelablePromise<ItemPublic> {
  const { id, requestBody } = data;
  return __request(OpenAPI, {
    method: "PUT",
    url: "/api/v1/items/{id}",
    path: {
      id,
    },
    body: requestBody,
    mediaType: "application/json",
    errors: {
      422: "Validation Error",
    },
  });
}

export function deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
  const { id } = data;
  return __request(OpenAPI, {
    method: "DELETE",
    url: "/api/v1/items/{id}",
    path: {
      id,
    },
    errors: {
      422: "Validation Error",
    },
  });
}