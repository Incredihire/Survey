import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, "../../.env") })

const { FIRST_SUPERUSER, EMAIL_TEST_USER, JWT_SECRET_KEY, JWT_ALGORITHM } =
  process.env

if (typeof FIRST_SUPERUSER !== "string") {
  throw new Error("Environment variable FIRST_SUPERUSER is undefined")
}
if (typeof EMAIL_TEST_USER !== "string") {
  throw new Error("Environment variable EMAIL_TEST_USER is undefined")
}
if (typeof JWT_SECRET_KEY !== "string") {
  throw new Error("Environment variable JWT_SECRET_KEY is undefined")
}
if (typeof JWT_ALGORITHM !== "string") {
  throw new Error("Environment variable JWT_ALGORITHM is undefined")
}

const IAT = Math.floor(Date.now() / 1000)
const EXP = IAT + 60 * 30 // 30 minutes
export const firstSuperuser = FIRST_SUPERUSER as string
export const testSuperuserToken = jwt.sign(
  { email: firstSuperuser, iat: IAT, exp: EXP },
  JWT_SECRET_KEY,
  { algorithm: JWT_ALGORITHM as jwt.Algorithm },
)
export const emailTestUser = EMAIL_TEST_USER
export const testUserToken = jwt.sign(
  { email: emailTestUser, iat: IAT, exp: EXP },
  JWT_SECRET_KEY,
  { algorithm: JWT_ALGORITHM as jwt.Algorithm },
)
