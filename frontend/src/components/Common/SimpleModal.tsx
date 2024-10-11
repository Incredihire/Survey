import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"

export interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSubmit: () => void
  submitButtonText?: string
  content: React.ReactNode
}

const SimpleModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitButtonText,
  content,
}: SimpleModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{content}</ModalBody>
        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" onClick={() => onSubmit()}>
            {submitButtonText ?? "Submit"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SimpleModal
