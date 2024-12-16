import json
from datetime import datetime

from fastapi import APIRouter, HTTPException

import app.services.schedule as schedule_service
from app.api.deps import SessionDep
from app.models import ScheduleCreate, ScheduleInfo, SchedulePublic

router = APIRouter()


def verify_schedule(schedule: ScheduleInfo) -> None:
    try:
        datetime.strptime(
            f"{schedule.startDate} {schedule.timesOfDay[0]}", "%Y-%m-%d %H:%M"
        )
        if hasattr(schedule, "endDate"):
            datetime.strptime(
                f"{schedule.endDate} {schedule.timesOfDay[0]}", "%Y-%m-%d %H:%M"
            )

    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Schedule input is not valid.",
        )


@router.post("/", response_model=SchedulePublic)
def create_schedule(
    *, session: SessionDep, schedule_in: ScheduleCreate
) -> SchedulePublic | None:
    verify_schedule(schedule_in.schedule)
    db_schedule = schedule_service.create_schedule(
        session=session, schedule_in=schedule_in
    )
    schedule_data = ScheduleInfo.model_validate_json(db_schedule.schedule)
    return SchedulePublic(
        id=db_schedule.id,
        schedule=schedule_data,
        scheduled_inquiries=json.loads(db_schedule.scheduled_inquiries),
    )


@router.patch("/update_scheduled_inquiries", response_model=SchedulePublic)
def update_scheduled_inquiries(
    *, session: SessionDep, scheduled_inquiries: list[int]
) -> SchedulePublic:
    db_schedule = schedule_service.get_schedule(session)
    if not db_schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule was not found.",
        )
    schedule = ScheduleInfo.model_validate_json(db_schedule.schedule)
    db_scheduled_inquiries: list[int] = json.loads(db_schedule.scheduled_inquiries)
    schedule_public = SchedulePublic(
        id=db_schedule.id,
        schedule=schedule,
        scheduled_inquiries=db_scheduled_inquiries,
    )
    active_index = 0
    if len(schedule_public.scheduled_inquiries) > 0:
        active_index = schedule_public.scheduled_inquiries_and_dates().inquiries.index(
            schedule_public.scheduled_inquiries[0]
        )
    schedule_public = schedule_service.update_scheduled_inquiries(
        session=session,
        scheduled_inquiries=scheduled_inquiries[active_index:]
        + scheduled_inquiries[:active_index],
    )
    return schedule_public


@router.get("/", response_model=SchedulePublic | None)
def get_schedule(*, session: SessionDep) -> SchedulePublic | None:
    db_schedule = schedule_service.get_schedule(session)
    if db_schedule is None:
        return None
    schedule_data = ScheduleInfo.model_validate_json(db_schedule.schedule)
    scheduled_inquiries = json.loads(db_schedule.scheduled_inquiries)
    return SchedulePublic(
        id=db_schedule.id,
        schedule=schedule_data,
        scheduled_inquiries=scheduled_inquiries,
    )
