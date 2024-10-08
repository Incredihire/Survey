import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import type { ApiError } from "../../client"
import type { InquiryCreate } from "../../client/models"
import { InquiriesService } from "../../client/services"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils/showToastOnError"

interface AddInquiryProps {
  isOpen: boolean
  onClose: () => void
}

export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

function isValidUnicode(str: string): boolean {
  let retval: boolean
  try {
    retval = str === decodeURIComponent(encodeURIComponent(str))
  } catch {
    retval = false
  }
  return retval
}

const AddInquiry = ({ isOpen, onClose }: AddInquiryProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  // already typed by react-hook-form https://react-hook-form.com/docs/useform#errors
  // eslint-disable-next-line
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    /* eslint-disable-next-line  */
  } = useForm<InquiryCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      text: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: InquiryCreate) =>
      InquiriesService.inquiriesCreateInquiry({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Inquiry created successfully.", "success")
      /* eslint-disable-next-line  */
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
    },
  })

  const onSubmit: SubmitHandler<InquiryCreate> = (data) => {
    /* eslint-disable-next-line  */
    mutation.mutate(data)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        {/* eslint-disable-next-line  */}
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader id="add-inquiry-show-modal">Add Inquiry</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* eslint-disable-next-line  */}
            <FormControl isInvalid={!!errors.text}>
              <FormLabel htmlFor="text">Inquiry Text</FormLabel>
              <Textarea
                id="text"
                data-testid="add-inquiry-text"
                {
                  /* eslint-disable-next-line  */
                  ...register("text", {
                    required: "Inquiry text is required.",
                    minLength: {
                      value: MIN_INQUIRY_LENGTH,
                      message: `Inquiry must be at least ${MIN_INQUIRY_LENGTH} characters.`,
                    },
                    maxLength: {
                      value: MAX_INQUIRY_LENGTH,
                      message: `Inquiry can not be greater than ${MAX_INQUIRY_LENGTH} characters.`,
                    },
                    validate: (value: string) =>
                      isValidUnicode(value) ||
                      "Inquiry must be a valid unicode string.",
                  })
                }
                placeholder="Enter the text of your inquiry."
              />

              {
                // errors is already typed by react-hook-form https://react-hook-form.com/docs/useform#errors */
                /* eslint-disable */
                errors.text && (
                  <FormErrorMessage>{errors.text.message}</FormErrorMessage>
                )
                /* eslint-enable */
              }
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            {/* eslint-disable-next-line */}
            <Button
              isLoading={isSubmitting}
              variant="primary"
              type="submit"
              data-testid="submit-add-inquiry"
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddInquiry
