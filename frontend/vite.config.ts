import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Ensure this is set to true
  },
  server: {
    sourcemap: true, // Ensure this is set to true
  },
})
