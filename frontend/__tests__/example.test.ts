import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const inquiryURL = "http://localhost/api/v1/inquiries"

const handlers = [
  http.get(inquiryURL, () => {
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
      text: "Sample Inquiry",
      created_at: Date.now(),
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})
afterAll(() => {
  server.close()
})

describe("API requests", () => {
  test("GET /items returns data", async () => {
    const response = await fetch(inquiryURL)
    expect(response.ok).toBe(true)
  })
})

describe("true is truthy and false is falsy", () => {
  it("true is truthy", () => {
    expect(true).toBe(true)
  })

  it("false is falsy", () => {
    expect(false).toBe(false)
  })
})

describe("null is falsy", () => {
  it("null is falsy", () => {
    expect(null).toBeFalsy()
  })
})
