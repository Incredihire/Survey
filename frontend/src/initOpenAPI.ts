import axios from "axios"
import Cookies from "js-cookie"
import { OpenAPI } from "./client"

export default function initOpenAPI() {
  OpenAPI.BASE = import.meta.env.VITE_API_URL as string
  if (!OpenAPI.BASE) {
    throw new Error("Missing VITE_API_URL environment variable")
  }

  OpenAPI.WITH_CREDENTIALS = true
  OpenAPI.interceptors.response.use(async (response) => {
    if (response.status === 401) {
      try {
        // Make a request to your auth server to refresh the token.
        await axios.post(`${OpenAPI.BASE}/api/v1/auth/refresh`, null, {
          withCredentials: true,
        })
        // retry request with the new access token.
        return axios(response.request) // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError)
        Cookies.remove("access_token_cookie")
        window.location.href = escape("/login")
        throw refreshError
      }
    }
    return response
  })
  console.log("OpenAPI initialized with BASE URL:", OpenAPI.BASE)
}
