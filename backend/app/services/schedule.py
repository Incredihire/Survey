import json

from sqlmodel import select

from app.api.deps import SessionDep
from app.models import Schedule, ScheduleCreate, ScheduleInfo, SchedulePublic


def create_schedule(*, session: SessionDep, schedule_in: ScheduleCreate) -> Schedule:
    """
    Create new schedule.
    """
    schedule_as_string = schedule_in.schedule.model_dump_json()
    db_item = session.exec(select(Schedule)).first()
    if db_item:
        db_item.schedule = schedule_as_string
    else:
        db_item = Schedule(schedule=schedule_as_string, scheduled_inquiries="[]")
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def update_scheduled_inquiries(
    *, session: SessionDep, scheduled_inquiries: list[int]
) -> SchedulePublic:
    """
    Update scheduled_inquiries.
    """
    scheduled_inquiries_as_string = json.dumps(scheduled_inquiries)
    db_schedule = session.exec(select(Schedule)).one()
    db_schedule.scheduled_inquiries = scheduled_inquiries_as_string
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return SchedulePublic(
        id=db_schedule.id,
        schedule=ScheduleInfo.model_validate_json(db_schedule.schedule),
        scheduled_inquiries=json.loads(db_schedule.scheduled_inquiries),
    )


def get_schedule(session: SessionDep) -> Schedule | None:
    """
    Retrieve schedule.
    """
    return session.exec(select(Schedule)).first()
