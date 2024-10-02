import { HStack } from "@chakra-ui/react"
import type React from "react"

export const FormRow = ({ children }: { children: React.ReactNode }) => (
  <HStack mt={2} borderTop={"1px"} borderColor={"gray.200"} p={2} spacing={4}>
    {children}
  </HStack>
)

export default FormRow
