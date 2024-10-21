import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"

import type { UserPublic } from "../../client"

interface ActionsMenuProps {
  type: string
  value: UserPublic
  disabled?: boolean
}

const ActionsMenu = ({ type, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure()
  const deleteModal = useDisclosure()

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem onClick={editUserModal.onOpen} icon={<FiEdit size={16} />}>
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash size={16} />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}

export default ActionsMenu
