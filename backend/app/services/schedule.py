import json
from datetime import datetime, timedelta

import holidays
from sqlmodel import select

from app.api.deps import SessionDep
from app.models import Schedule, ScheduleCreate, ScheduleInfo, SchedulePublic
from app.models.schedule import ScheduleInquiriesAndDates


def _skip_days(schedule: ScheduleInfo, current_date: datetime) -> datetime:
    if schedule.skipWeekends:
        while current_date.weekday() in [5, 6]:  # 5: Saturday, 6: Sunday
            current_date += timedelta(days=1)
    if schedule.skipHolidays:
        while current_date in holidays.country_holidays("US"):
            current_date += timedelta(days=1)
    return current_date


def _get_scheduled_inquiries_and_dates(
    schedule: ScheduleInfo, scheduled_inquiries: list[int]
) -> ScheduleInquiriesAndDates:
    scheduled_inquiries_count = len(scheduled_inquiries)
    if scheduled_inquiries_count == 0:
        return ScheduleInquiriesAndDates(inquiries=[], dates=[])
    today = datetime.strptime(
        f"{datetime.now().strftime('%Y-%m-%d')} {schedule.timesOfDay[0]}",
        "%Y-%m-%d %H:%M",
    )
    start = datetime.strptime(
        f"{schedule.startDate} {schedule.timesOfDay[0]}", "%Y-%m-%d %H:%M"
    )
    end = (
        None
        if schedule.endDate is None
        else datetime.strptime(
            f"{schedule.endDate} {schedule.timesOfDay[0]}", "%Y-%m-%d %H:%M"
        )
    )
    current_date = start
    past_scheduled_count = 0
    while current_date < today:
        current_date = _skip_days(schedule, current_date)
        current_date += timedelta(days=schedule.daysBetween)
        past_scheduled_count += 1
    scheduled_dates: list[str] = []
    for _index in scheduled_inquiries:
        current_date = _skip_days(schedule, current_date)
        if end is None or current_date <= end:
            scheduled_dates.append(current_date.isoformat())
        current_date += timedelta(days=schedule.daysBetween)
    active_index = 0
    if past_scheduled_count > 0:
        active_index = past_scheduled_count % scheduled_inquiries_count
    return ScheduleInquiriesAndDates(
        inquiries=scheduled_inquiries[active_index:]
        + scheduled_inquiries[:active_index],
        dates=scheduled_dates,
    )


def _get_schedule_public(db_schedule: Schedule) -> SchedulePublic:
    schedule = ScheduleInfo.model_validate_json(db_schedule.schedule)
    scheduled_inquiries = json.loads(db_schedule.scheduled_inquiries)
    return SchedulePublic(
        id=db_schedule.id,
        schedule=schedule,
        scheduled_inquiries=scheduled_inquiries,
        scheduled_inquiries_and_dates=_get_scheduled_inquiries_and_dates(
            schedule, scheduled_inquiries
        ),
    )


def create_schedule(
    *, session: SessionDep, schedule_in: ScheduleCreate
) -> SchedulePublic:
    """
    Create new schedule.
    """
    schedule_as_string = schedule_in.schedule.model_dump_json()
    db_schedule = session.exec(select(Schedule)).first()
    if db_schedule:
        db_schedule.schedule = schedule_as_string
    else:
        db_schedule = Schedule(schedule=schedule_as_string, scheduled_inquiries="[]")
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return _get_schedule_public(db_schedule)


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
    return _get_schedule_public(db_schedule)


def get_schedule(session: SessionDep) -> SchedulePublic | None:
    """
    Retrieve schedule.
    """
    db_schedule = session.exec(select(Schedule)).first()
    if db_schedule:
        return _get_schedule_public(db_schedule)
    return None
