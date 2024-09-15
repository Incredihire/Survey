import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiBriefcase, FiHome, FiHelpCircle, FiSettings, FiUsers } from "react-icons/fi"

import type { UserPublic } from "../../client"
import {IconType} from "react-icons";

interface SidebarItem {
  icon: IconType;
  title: string;
  path: string;
}
const items: SidebarItem[] = [
import {IconType} from "react-icons";

interface SidebarItem {
  icon: IconType;
  title: string;
  path: string;
}
const items: SidebarItem[] = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  // These are coming from our dependencies untyped, so we'll disable the linting for these lines
  /* eslint-disable */
  { icon: FiBriefcase, title: "Items", path: "/items" },
  { icon: FiHelpCircle, title: "Inquiries", path: "/inquiries" },
  { icon: FiHelpCircle, title: "Inquiries", path: "/inquiries" },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
  /* eslint-enable */
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue("ui.main", "ui.light")
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
    : items

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