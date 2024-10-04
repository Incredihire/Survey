from enum import Enum


class JsonBoolEnum(str, Enum):
    true = "true"
    false = "false"


def json_bool_convert(value: JsonBoolEnum) -> bool:
    return True if value == "true" else False
