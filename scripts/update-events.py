#!/usr/bin/env -S uv run -s

# /// script
# requires-python = ">= 3.14"
# dependencies = [
#     "jinja2",
#     "openpyxl",
#     "pydantic",
# ]
# ///

import json
from datetime import datetime, date
from typing import Any, cast

import openpyxl
import pydantic

TPL = """---
title: Veranstaltungen
description: Kommende Veranstaltungen der Almstüberl Musi
---

<table id="event-table" class="table table-striped">
    <thead>
        <tr>
            <th>Datum</th>
            <th>Veranstaltung</th>
            <th>Ort</th>
        </tr>
    </thead>
    <tbody>
    {% for event in events %}
        <tr>
            <td><time datetime="{{ event.date.strftime('%Y-%m-%d') }}">{{ event.date.strftime('%d.%m.%Y') }}</time></td>
            <td>
            {% if event.url %}
                <i class="bi bi-box-arrow-up-right"></i>
                <a href="{{ event.url }}" target="_blank" rel="noopener noreferrer">{{ event.details }}</a>
            {% else %}
                {{ event.details }}
            {% endif %}
            </td>
            <td>{{ event.location }}</td>
        </tr>
    {% endfor %}
    </tbody>
</table>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Only date comparison, ignore time.

        const rows = document.querySelectorAll("table#event-table tbody tr");

        rows.forEach(row => {
            const timeElement = row.querySelector("time");
            if (timeElement) {
                const date = new Date(timeElement.getAttribute("datetime"));
                if (date < today) {
                    row.classList.add("dimmed", "text-decoration-line-through");
                }
            }
        });
    });
</script>
"""


class Event(pydantic.BaseModel):
    date_time: datetime = pydantic.Field(alias='date')
    details: str
    location: str
    url: str | None = None
    next: bool = False

    @property
    def date(self) -> date:
        return self.date_time.date()
    

class EventList(pydantic.BaseModel):
    events: list[Event]


def read_sheet() -> EventList:
    workbook = openpyxl.load_workbook("termine.xlsx")
    sheet = workbook.active
    if sheet is None:
        raise ValueError("No active sheet in the workbook")

    header = cast(
        list[str], list(next(sheet.iter_rows(min_row=1, max_row=1, values_only=True)))
    )

    events: list[Event] = []
    for row in sheet.iter_rows(min_row=2, max_col=4, values_only=True):
        event = Event(**dict(zip(header, row)))  # type: ignore
        events.append(event)

    return EventList(events=sorted(events, key=lambda x: x.date, reverse=True))
    

def render_template(variables: dict[str, Any]) -> str:
    return (
        jinja2.Environment(
            trim_blocks=True,
            autoescape=False,
        )
        .from_string(TPL)
        .render(variables)
    )


def main() -> None:
    print(read_sheet().model_dump_json())


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
