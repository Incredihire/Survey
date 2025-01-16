import axios from "axios"
import Cookies from "js-cookie"
import { OpenAPI } from "./client"

export default function initOpenAPI() {
  OpenAPI.BASE = import.meta.env.VITE_API_URL as string
  if (!OpenAPI.BASE) {
    throw new Error("Missing VITE_API_URL environment variable")
  }

  if (
    OpenAPI.BASE.startsWith("http://localhost") &&
    Cookies.get("access_token")
  ) {
    OpenAPI.interceptors.request.use((request) => {
      if (!request.headers) request.headers = {}
      request.headers.Authorization = `Bearer ${Cookies.get("access_token")}`
      return request
    })
  }

  OpenAPI.WITH_CREDENTIALS = true
  OpenAPI.interceptors.response.use(async (response) => {
    if (response.status === 401) {
      try {
        // Make a request to your auth server to refresh the token.
        const refreshResponse = await axios.post(
          `${OpenAPI.BASE}/api/v1/auth/refresh`,
          {
            refreshToken:
              OpenAPI.BASE.startsWith("http://localhost") &&
              Cookies.get("refresh_token")
                ? Cookies.get("refresh_token")
                : undefined,
            withCredentials: true,
          },
        )
        if (
          OpenAPI.BASE.startsWith("http://localhost") &&
          Cookies.get("access_token")
        ) {
          const { accessToken } = refreshResponse.data
          response.request.headers.Authorization = `Bearer ${accessToken}`
        }
        // retry request with the new access token.
        return axios(response.request) // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError)
        window.location.href = escape(
          `${OpenAPI.BASE.split(":")[1]}/api/v1/auth/login`,
        )
        throw refreshError
      }
    }
    return response
  })
  console.log("OpenAPI initialized with BASE URL:", OpenAPI.BASE)
}
