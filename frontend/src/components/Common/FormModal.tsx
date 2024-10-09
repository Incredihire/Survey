import {
  Button,
  type ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface FieldDefinition<T> {
  name: keyof T
  label: string
  placeholder?: string
  type?: string
  validation?: any
  defaultValue?: any
  inputProps?: any
}

interface ExtendedButtonProps extends ButtonProps {
  "data-testid"?: string
}

export interface FormModalProps<T> {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: FieldDefinition<T>[]
  mutationFn: (data: T) => Promise<any>
  successMessage: string
  queryKeyToInvalidate?: string[]
  submitButtonProps?: ExtendedButtonProps
}

const FormModal = <T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  fields,
  mutationFn,
  successMessage,
  queryKeyToInvalidate,
  submitButtonProps,
}: FormModalProps<T>) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const defaultValues: any = fields.reduce(
    (acc: Record<string, any>, field) => {
      acc[field.name as string] = field.defaultValue || ""
      return acc
    },
    {},
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      showToast("Success!", successMessage, "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      if (queryKeyToInvalidate) {
        void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      }
    },
  })

  const onSubmit: SubmitHandler<T> = (data) => {
    mutation.mutate(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {fields.map((field) => {
            const fieldName = field.name as keyof T
            // eslint-disable-next-line security/detect-object-injection
            const isError = !!errors[fieldName]
            const InputComponent = field.type === "textarea" ? Textarea : Input
            return (
              <FormControl isInvalid={isError} mb={4} key={String(field.name)}>
                <FormLabel htmlFor={String(field.name)}>
                  {field.label}
                </FormLabel>
                <InputComponent
                  id={String(field.name)}
                  placeholder={field.placeholder}
                  {...register(field.name as any, field.validation)}
                  {...field.inputProps}
                />
                {isError && (
                  <FormErrorMessage>
                    {(errors[fieldName] as any)?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )
          })}
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            isLoading={isSubmitting}
            variant="primary"
            type="submit"
            {...submitButtonProps}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FormModal
export type { FieldDefinition }
