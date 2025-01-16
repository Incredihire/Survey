import { ChakraProvider } from "@chakra-ui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import axios from "axios"
import Cookies from "js-cookie"
import { StrictMode } from "react"
import { OpenAPI } from "./client"
import theme from "./theme"

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

OpenAPI.interceptors.response.use(async (response) => {
  if (response.status === 401) {
    //originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
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
      const { accessToken } = refreshResponse.data
      // retry request with the new access token.
      if (
        OpenAPI.BASE.startsWith("http://localhost") &&
        Cookies.get("access_token")
      )
        response.request.headers.Authorization = `Bearer ${accessToken}`
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

console.log("API_URL:", OpenAPI.BASE)

const queryClient = new QueryClient()

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>,
)
