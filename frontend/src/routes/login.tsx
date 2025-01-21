import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  useBoolean,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { useState } from "react"
import Logo from "/assets/images/fastapi-logo.svg"
import {
  type ApiError,
  AuthService,
  type Body_auth_login,
  OpenAPI,
} from "../client"
import { emailPattern } from "../utils/validation.ts"

export const Route = createFileRoute("/login")({
  component: Login,
})

function Login() {
  const [show, setShow] = useBoolean()
  const [error, setError] = useState<string | null>(null)
  const login = async (data: Body_auth_login) => {
    /*const response = */
    await AuthService.login({
      formData: data,
    })
  }
  const navigate = useNavigate()
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong"
      }

      setError(errDetail)
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<Body_auth_login> = async (data) => {
    if (isSubmitting) return
    setError(null)
    await loginMutation.mutateAsync(data)
  }

  return (
    <>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
      >
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
        />
        <FormControl id="username" isInvalid={!!errors.username || !!error}>
          <Input
            id="username"
            {...register("username", {
              required: "Username is required",
              pattern: emailPattern,
            })}
            placeholder="Email"
            type="email"
            required
          />
          {errors.username && (
            <FormErrorMessage>{errors.username.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl id="password" isInvalid={!!error}>
          <InputGroup>
            <Input
              {...register("password", {
                required: "Password is required",
              })}
              type={show ? "text" : "password"}
              placeholder="Password"
              required
            />
            <InputRightElement
              color="ui.dim"
              _hover={{
                cursor: "pointer",
              }}
            >
              <Icon
                as={show ? ViewOffIcon : ViewIcon}
                onClick={setShow.toggle}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <ViewOffIcon /> : <ViewIcon />}
              </Icon>
            </InputRightElement>
          </InputGroup>
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          Log In
        </Button>
        <Link
          href={`${OpenAPI.BASE}/api/v1/auth/oauth?provider=google`}
          color="blue.500"
        >
          Google Login
        </Link>
      </Container>
    </>
  )
}
