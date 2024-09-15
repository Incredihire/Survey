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
    ModalOverlay, Textarea,
} from "@chakra-ui/react"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import {type SubmitHandler, useForm} from "react-hook-form"

import {type ApiError, type InquiryCreate, InquiriesService} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import {handleError} from "../../utils"

interface AddInquiryProps {
    isOpen: boolean
    onClose: () => void
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 255;

const AddInquiry = ({isOpen, onClose}: AddInquiryProps) => {
    const queryClient = useQueryClient()
    const showToast = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors    , isSubmitting},
    }  = useForm<InquiryCreate>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            text: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: InquiryCreate) =>
            InquiriesService.createInquiry({requestBody: data}),
        onSuccess: () => {
            showToast("Success!", "Inquiry created successfully.", "success")
            reset()
            onClose()
        },
        onError: (err: ApiError) => {
            handleError(err, showToast)
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({queryKey: ["Inquiry"]})
        },
    })

    const onSubmit: SubmitHandler<InquiryCreate> = (data) => {
        mutation.mutate(data)
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={{base: "sm", md: "md"}}
                isCentered
            >
                <ModalOverlay/>
                <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader id="add-inquiry-show-modal">Add Inquiry</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <FormControl isInvalid={!!errors.text}>
                            <FormLabel htmlFor="text">Inquiry Text</FormLabel>
                            <Textarea
                                id="text"
                                {...register("text", {
                                    required: "Inquiry text is required.",
                                    minLength: {
                                        value: MIN_LENGTH,
                                        message: `Inquiry must be at least ${MIN_LENGTH} characters.`
                                    },
                                    maxLength: {
                                        value: MAX_LENGTH,
                                        message: `Inquiry can not be greater than ${MAX_LENGTH} characters.`
                                    },
                                    pattern: {
                                        value: /^[A-Z]/,
                                        message: "Inquiry must start with a capital letter."
                                    },
                                })}
                                placeholder="Enter the text of your inquiry."
                            />

                            {errors.text && (
                                <FormErrorMessage>{errors.text.message}</FormErrorMessage>
                            )}
                        </FormControl>
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
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
