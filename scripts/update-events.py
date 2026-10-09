#!/usr/bin/env -S uv run -s

# /// script
# requires-python = ">= 3.14"
# dependencies = [
#     "odfdo",
#     "pydantic",
# ]
# ///

import datetime
from typing import Any

import pydantic
from odfdo import Cell, Document


class Event(pydantic.BaseModel):
    date_time: datetime.datetime = pydantic.Field(alias="date")
    details: str
    location: str
    url: str | None = None
    next: bool = False

    @property
    def date(self) -> datetime.date:
        return self.date_time.date()


class EventList(pydantic.BaseModel):
    events: list[Event]


def cell_value(cell: Cell) -> Any:
    # odfdo renders hyperlinks as markdown; take the bare link target instead
    links = cell.get_elements("descendant::text:a")
    if links:
        return links[0].get_attribute("xlink:href")
    return cell.value


def read_sheet() -> EventList:
    sheet = Document("termine.ods").body.sheets[0]
    rows = sheet.traverse()
    header = [str(value) for value in next(rows).get_values((0, 3))]

    events: list[Event] = []
    for row in rows:
        values = [cell_value(cell) for cell in row.get_cells((0, 3))]
        # the sheet is padded with empty rows up to the format's row limit
        if not any(values):
            break
        events.append(Event.model_validate(dict(zip(header, values, strict=True))))

    events.sort(key=lambda event: event.date, reverse=True)
    return EventList(events=events)


def main() -> None:
    print(read_sheet().model_dump_json(indent=2))


if __name__ == "__main__":
    main()
