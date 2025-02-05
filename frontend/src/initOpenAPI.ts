import Cookies from "js-cookie"
import { OpenAPI } from "./client"
export const ACCESS_TOKEN_COOKIE = "access_token_cookie"
export default function initOpenAPI() {
  OpenAPI.BASE = import.meta.env.VITE_API_URL as string
  if (!OpenAPI.BASE) {
    throw new Error("Missing VITE_API_URL environment variable")
  }

  const AUTH_REFERER_COOKIE = "auth_referer_cookie"
  OpenAPI.TOKEN = Cookies.get(ACCESS_TOKEN_COOKIE)
  OpenAPI.WITH_CREDENTIALS = true

  OpenAPI.interceptors.response.use((response) => {
    if ([401, 403, 404].indexOf(response.status) >= 0) {
      const { pathname, search, hash } = window.location
      Cookies.set(AUTH_REFERER_COOKIE, `${pathname}${search}${hash}`)
      Cookies.remove(ACCESS_TOKEN_COOKIE)
      OpenAPI.TOKEN = ""
      window.location.assign(escape(`${OpenAPI.BASE}/api/v1/auth/login`))
    }
    return response
  })
  if (window.location.search === "?auth_callback=true") {
    const auth_referer = Cookies.get(AUTH_REFERER_COOKIE)
    if (auth_referer) {
      Cookies.remove(AUTH_REFERER_COOKIE)
      window.location.replace(escape(auth_referer))
    }
  }
  console.log("OpenAPI initialized with BASE URL:", OpenAPI.BASE)
}
