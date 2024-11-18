import Cookies from "js-cookie"
export function isLoggedIn() {
  return !!Cookies.get("access_token_expiry")
}
export function getAccessTokenExpiry() {
  const access_token_expiry = Cookies.get("access_token_expiry")
  if (access_token_expiry) {
    return new Date(access_token_expiry)
  }
  return null
}
export function removeAccessTokenExpiry() {
  Cookies.remove("access_token_expiry")
}
