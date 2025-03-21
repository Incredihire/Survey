import {
  Button,
  type ButtonProps,
  type InputProps as ChakraInputProps,
  type SelectProps as ChakraSelectProps,
  type TextareaProps as ChakraTextareaProps,
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
  Select,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type RegisterOptions,
  type SubmitHandler,
  useForm,
} from "react-hook-form"

import type { ReactNode } from "react"
import type { ApiError } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils/showToastOnError"

type WithDataTestId<P> = P & { "data-testid"?: string }

type ExtendedInputProps = WithDataTestId<ChakraInputProps>
type ExtendedTextareaProps = WithDataTestId<ChakraTextareaProps>
type ExtendedSelectProps = WithDataTestId<ChakraSelectProps>
interface BaseFieldDefinition<
  T extends FieldValues,
  K extends "input" | "textarea" | "select",
> {
  name: Path<T>
  label: string
  placeholder?: string
  type: K
  validation?: RegisterOptions
  defaultValue?: T[Path<T>]
  inputProps?: K extends "select"
    ? ExtendedSelectProps
    : K extends "textarea"
      ? ExtendedTextareaProps
      : ExtendedInputProps
  options?: [string, string][]
}

type FieldDefinition<T extends FieldValues> =
  | BaseFieldDefinition<T, "input">
  | BaseFieldDefinition<T, "textarea">
  | BaseFieldDefinition<T, "select">

interface ExtendedButtonProps extends ButtonProps {
  "data-testid"?: string
}

export interface FormModalProps<T extends FieldValues> {
  isOpen: boolean
  onClose: () => void
  title: string
  fields?: FieldDefinition<T>[]
  content?: ReactNode
  mutationFn: (data: T) => Promise<unknown>
  successMessage: string
  queryKeyToInvalidate?: string[]
  submitButtonProps?: ExtendedButtonProps
  submitButtonText?: string
}

const FormModal = <T extends FieldValues>({
  isOpen,
  onClose,
  title,
  fields = [],
  content = null,
  mutationFn,
  successMessage,
  queryKeyToInvalidate,
  submitButtonProps,
  submitButtonText = "Save",
}: FormModalProps<T>) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const defaultValues: DefaultValues<T> = fields.reduce(
    (acc, field) => {
      if (field.defaultValue !== undefined) {
        acc[field.name] = field.defaultValue
      }
      return acc
    },
    {} as DefaultValues<T>,
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
          {content}
          {fields.map((field) => {
            const isError = !!errors[field.name]
            if (field.type === "textarea") {
              return (
                <FormControl
                  isInvalid={isError}
                  mb={4}
                  key={String(field.name)}
                >
                  <FormLabel htmlFor={String(field.name)}>
                    {field.label}
                  </FormLabel>
                  <Textarea
                    id={String(field.name)}
                    placeholder={field.placeholder}
                    {...register(
                      field.name,
                      field.validation as RegisterOptions<T, Path<T>>,
                    )}
                    {...field.inputProps}
                  />
                  {isError && (
                    <FormErrorMessage>
                      {(errors[field.name]?.message as string) ||
                        "Invalid input"}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )
            }
            if (field.type === "select") {
              return (
                <FormControl
                  isInvalid={isError}
                  mb={4}
                  key={String(field.name)}
                >
                  <FormLabel htmlFor={String(field.name)}>
                    {field.label}
                  </FormLabel>
                  <Select
                    id={String(field.name)}
                    placeholder={field.placeholder}
                    {...register(
                      field.name,
                      field.validation as RegisterOptions<T, Path<T>>,
                    )}
                    {...field.inputProps}
                  >
                    {(field.options ?? []).map((v) => (
                      <option key={v[0]} value={v[0]}>
                        {v[1]}
                      </option>
                    ))}
                  </Select>
                  {isError && (
                    <FormErrorMessage>
                      {(errors[field.name]?.message as string) ||
                        "Invalid input"}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )
            }
            return (
              <FormControl isInvalid={isError} mb={4} key={String(field.name)}>
                <FormLabel htmlFor={String(field.name)}>
                  {field.label}
                </FormLabel>
                <Input
                  id={String(field.name)}
                  placeholder={field.placeholder}
                  {...register(
                    field.name,
                    field.validation as RegisterOptions<T, Path<T>>,
                  )}
                  {...field.inputProps}
                />
                {isError && (
                  <FormErrorMessage>
                    {(errors[field.name]?.message as string) || "Invalid input"}
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
            {submitButtonText}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FormModal
export type { FieldDefinition }
