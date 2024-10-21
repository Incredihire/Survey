import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { FiFolder, FiHelpCircle, FiHome } from "react-icons/fi"

import type { IconType } from "react-icons"

interface SidebarItem {
  icon: IconType
  title: string
  path: string
}
const items: SidebarItem[] = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  // These are coming from our dependencies untyped, so we'll disable the linting for these lines
  /* eslint-disable */
  { icon: FiHelpCircle, title: "Inquiries", path: "/inquiries" },
  { icon: FiFolder, title: "Themes", path: "/themes" },
  /* eslint-enable */
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const textColor = useColorModeValue("ui.main", "ui.light")
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")

  const finalItems = items

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
