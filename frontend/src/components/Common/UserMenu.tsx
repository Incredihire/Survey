import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { FaUserAstronaut } from "react-icons/fa"
import { FiUser } from "react-icons/fi"

const UserMenu = () => {
  return (
    <>
      {/* Desktop */}
      <Box
        display={{ base: "none", md: "block" }}
        position="fixed"
        top={4}
        right={4}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaUserAstronaut color="white" fontSize="18px" />}
            bg="ui.main"
            isRound
            data-testid="user-menu"
          />
          <MenuList>
            <MenuItem icon={<FiUser fontSize="18px" />} as={Link} to="settings">
              My profile
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </>
  )
}

export default UserMenu
