import Cookies from "js-cookie"
import { OpenAPI } from "./client"
export const ACCESS_TOKEN_COOKIE = "access_token_cookie"
export default function initOpenAPI() {
  OpenAPI.BASE = import.meta.env.VITE_API_URL as string
  if (!OpenAPI.BASE) {
    throw new Error("Missing VITE_API_URL environment variable")
  }
  OpenAPI.TOKEN = Cookies.get(ACCESS_TOKEN_COOKIE)
  OpenAPI.WITH_CREDENTIALS = true

  OpenAPI.interceptors.response.use((response) => {
    if ([401, 403, 404].includes(response.status)) {
      Cookies.remove(ACCESS_TOKEN_COOKIE)
      OpenAPI.TOKEN = ""
      const { hostname, port, pathname, search, hash } = window.location
      window.location.href = `//${escape(OpenAPI.BASE)}/api/v1/auth/login?return_url=${escape(`//${hostname}${port === "5173" ? ":5173" : ""}${pathname}${search}${hash}`)}`
    }
    return response
  })
  console.log("OpenAPI initialized with BASE URL:", OpenAPI.BASE)
}
