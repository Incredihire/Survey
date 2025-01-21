/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutIndexImport } from './routes/_layout/index'
import { Route as LayoutThemesImport } from './routes/_layout/themes'
import { Route as LayoutInquiriesImport } from './routes/_layout/inquiries'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutIndexRoute = LayoutIndexImport.update({
  path: '/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutThemesRoute = LayoutThemesImport.update({
  path: '/themes',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutInquiriesRoute = LayoutInquiriesImport.update({
  path: '/inquiries',
  getParentRoute: () => LayoutRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_layout/inquiries': {
      preLoaderRoute: typeof LayoutInquiriesImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/themes': {
      preLoaderRoute: typeof LayoutThemesImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/': {
      preLoaderRoute: typeof LayoutIndexImport
      parentRoute: typeof LayoutImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  LayoutRoute.addChildren([
    LayoutInquiriesRoute,
    LayoutThemesRoute,
    LayoutIndexRoute,
  ]),
  LoginRoute,
])

/* prettier-ignore-end */
