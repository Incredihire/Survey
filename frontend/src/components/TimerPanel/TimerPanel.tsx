import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import FormRow from "../Common/FormRow.tsx"

import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import type { SchedulePublic } from "../../client"
import useCreateSchedule from "../../hooks/useCreateSchedule.ts"

interface TimerFormData {
  startDate: string
  endDate: string | null
  daysBetween: number
  skipWeekends: boolean
  skipHolidays: boolean
  timeOfDay: string
}

interface TimerPanelProps {
  isOpen: boolean
  onClose: () => void
  schedule?: SchedulePublic | null | undefined
}

const TimerPanel = ({ isOpen, onClose, schedule }: TimerPanelProps) => {
  // eslint-disable-next-line
  const tomorrow: string = dayjs().add(1, "day").format("YYYY-MM-DD")
  // eslint-disable-next-line
  const monthFromToday: string = dayjs().add(1, "month").format("YYYY-MM-DD")

  // eslint-disable-next-line
  const { handleSubmit, register, control, watch, setValue } = useForm({
    defaultValues: {
      startDate: schedule?.schedule.startDate ?? tomorrow,
      endDate: schedule?.schedule.endDate ?? monthFromToday,
      daysBetween: schedule?.schedule.daysBetween ?? 1,
      timeOfDay: schedule?.schedule.timesOfDay[0] ?? "08:00",
      skipHolidays: schedule?.schedule.skipHolidays ?? false,
      skipWeekends: schedule?.schedule.skipWeekends ?? false,
    },
  })

  // eslint-disable-next-line
  const endDate = watch("endDate")
  // eslint-disable-next-line
  const startDate = watch("startDate")

  const { createSchedule } = useCreateSchedule()

  const onSubmit: SubmitHandler<TimerFormData> = (data: TimerFormData) => {
    const {
      startDate,
      endDate,
      daysBetween,
      skipHolidays,
      skipWeekends,
      timeOfDay,
    } = data
    const submissionData: {
      schedule: {
        skipHolidays: boolean
        endDate: string | null
        skipWeekends: boolean
        daysBetween: number
        timesOfDay: string[]
        startDate: string
      }
    } = {
      schedule: {
        startDate,
        endDate,
        daysBetween,
        skipHolidays,
        skipWeekends,
        timesOfDay: [timeOfDay],
      },
    }
    createSchedule(submissionData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"3xl"} isCentered={true}>
      <ModalOverlay />
      <ModalContent w={"80%"}>
        <ModalHeader>Schedule Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column">
              <FormLabel size={"sm"}>
                Set the delivery frequency for scheduled inquiries.
              </FormLabel>
              <Heading size={"md"} pt={4} pb={4}>
                Inquiry Frequency
              </Heading>
              <FormRow>
                <FormControl>
                  <FormLabel>Date Start</FormLabel>

                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        onChange={(e) => {
                          const newStartDate = e.target.value
                          if (dayjs(newStartDate).isAfter(dayjs(endDate))) {
                            setValue(
                              "endDate",
                              dayjs(newStartDate)
                                .add(1, "month")
                                .format("YYYY-MM-DD"),
                            )
                          }
                          field.onChange(newStartDate)
                        }}
                      />
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Date End</FormLabel>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{
                      required: true,
                      validate: (value) =>
                        dayjs(value).isAfter(dayjs(startDate)),
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        min={startDate}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                      />
                    )}
                  />
                </FormControl>
              </FormRow>
              <FormRow>
                <FormControl>
                  <FormLabel>Days Between Inquiries</FormLabel>
                  <Controller
                    name="daysBetween"
                    control={control}
                    rules={{ min: 1, max: 365 }}
                    render={({ field }) => (
                      <NumberInput
                        min={1}
                        {...field}
                        onChange={(_, value) => field.onChange(value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Time of Day for Inquiries</FormLabel>
                  <Input
                    type="time"
                    {...register("timeOfDay", { value: "08:00" })}
                  />
                </FormControl>
              </FormRow>
              <FormRow>
                <div>
                  <Checkbox {...register("skipWeekends")}>
                    Skip Weekends{" "}
                  </Checkbox>
                </div>
                <div>
                  <Checkbox {...register("skipHolidays")}>
                    Skip Holidays
                  </Checkbox>
                </div>
              </FormRow>
              <FormRow>
                <Button type="submit" mt={4}>
                  Create Schedule
                </Button>
              </FormRow>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default TimerPanel
