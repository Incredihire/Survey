import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, "../../.env") })

const { FIRST_SUPERUSER, FIRST_SUPERUSER_PASSWORD, SECRET_KEY } = process.env

if (typeof FIRST_SUPERUSER !== "string") {
  throw new Error("Environment variable FIRST_SUPERUSER is undefined")
}

if (typeof FIRST_SUPERUSER_PASSWORD !== "string") {
  throw new Error("Environment variable FIRST_SUPERUSER_PASSWORD is undefined")
}

export const firstSuperuser = FIRST_SUPERUSER as string
export const firstSuperuserPassword = FIRST_SUPERUSER_PASSWORD as string
export const firstSuperuserToken = jwt.sign(
  {
    sub: "1",
    iat: Math.floor(Date.now() / 1000),
    expires: Math.floor(Date.now() / 1000 + 60 * 60 * 1), // 1 hour
  },
  SECRET_KEY ?? "",
  {
    algorithm: "HS256",
  },
)
