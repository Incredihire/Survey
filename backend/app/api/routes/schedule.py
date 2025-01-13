from datetime import datetime

from fastapi import APIRouter, HTTPException

import app.services.schedule as schedule_service
from app.api.deps import SessionDep
from app.models import ScheduleCreate, ScheduleInfo, SchedulePublic

router = APIRouter()


def _verify_schedule(schedule: ScheduleInfo) -> None:
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
    _verify_schedule(schedule_in.schedule)
    return schedule_service.create_schedule(session=session, schedule_in=schedule_in)


@router.patch("/update_scheduled_inquiries", response_model=SchedulePublic)
def update_scheduled_inquiries(
    *, session: SessionDep, scheduled_inquiries: list[int]
) -> SchedulePublic:
    return schedule_service.update_scheduled_inquiries(
        session=session,
        scheduled_inquiries=scheduled_inquiries,
    )


@router.get("/", response_model=SchedulePublic | None)
def get_schedule(*, session: SessionDep) -> SchedulePublic | None:
    return schedule_service.get_schedule(session)
