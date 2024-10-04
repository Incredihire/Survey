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
import {
  type SubmitHandler,
  type UseFormReturn,
  useForm,
} from "react-hook-form"

import { useEffect } from "react"
import type { ApiError } from "../../client"
import type {
  InquiryCreate,
  InquiryPublic,
  InquiryUpdate,
} from "../../client/models"
import * as InquiriesService from "../../client/services"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

function isValidUnicode(str: string): boolean {
  try {
    return str === decodeURIComponent(encodeURIComponent(str))
  } catch {
    return false
  }
}

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  inquiry?: InquiryPublic // Use InquiryPublic for consistency
  mode: "add" | "edit"
}
const InquiryModal = ({
  isOpen,
  onClose,
  inquiry,
  mode,
}: InquiryModalProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  }: UseFormReturn<InquiryCreate> = useForm<InquiryCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      text: inquiry?.text ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn:
      mode === "edit"
        ? (data: InquiryUpdate) =>
            InquiriesService.updateInquiry({
              ...inquiry,
              ...data,
              id: inquiry?.id ?? "",
              created_at: inquiry?.created_at ?? "",
            })
        : (data: InquiryCreate) =>
            InquiriesService.createInquiry({ requestBody: data }),
    onSuccess: () => {
      showToast(
        "Success!",
        mode === "edit"
          ? "Inquiry updated successfully."
          : "Inquiry created successfully.",
        "success",
      )
      reset({
        text: inquiry?.text ?? "",
      })
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
    if (mode === "edit") {
      mutation.mutate({ ...data, id: inquiry?.id } as InquiryUpdate)
    } else {
      mutation.mutate({ ...data, id: inquiry?.id ?? "" } as InquiryUpdate)
    }
  }

  useEffect(() => {
    if (mode === "edit" && inquiry) {
      setValue("text", inquiry.text)
    }
  }, [mode, inquiry, setValue])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader
          id={
            mode === "edit"
              ? "edit-inquiry-show-modal"
              : "add-inquiry-show-modal"
          }
        >
          {mode === "edit" ? "Edit Inquiry" : "Add Inquiry"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.text}>
            <FormLabel htmlFor="text">Inquiry Text</FormLabel>
            <Textarea
              id="text"
              data-testid={
                mode === "edit" ? "edit-inquiry-text" : "add-inquiry-text"
              }
              {...register("text", {
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
              })}
              placeholder={
                mode === "edit"
                  ? "Edit the text of your inquiry."
                  : "Enter the text of your inquiry."
              }
            />
            {errors.text && (
              <FormErrorMessage>{errors.text.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            isLoading={isSubmitting as boolean}
            variant="primary"
            type="submit"
            data-testid={
              mode === "edit" ? "submit-edit-inquiry" : "submit-add-inquiry"
            }
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default InquiryModal
