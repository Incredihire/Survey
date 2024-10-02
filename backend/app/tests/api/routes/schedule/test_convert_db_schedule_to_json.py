from app.api.routes.schedule import convert_schedule_string_to_schedule_data
from app.models import Schedule, ScheduleData
from app.tests.utils.schedule_utils import first_schedule_string, first_valid_schedule


def test_convert_db_schedule_to_json_should_convert_db_to_serializable_object() -> None:
    id = "f202037b-71c0-42a5-913f-60270eb476a5"  # pylint: disable=W0622
    db_sched = Schedule(
        id=id,
        schedule=first_schedule_string,
    )
    sched_data = ScheduleData.model_validate(first_valid_schedule["schedule"])
    db_convert_output = convert_schedule_string_to_schedule_data(db_sched.schedule)
    assert db_convert_output == sched_data
