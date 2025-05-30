#!/usr/bin/env -S uv run -qs

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "jinja2",
#     "openpyxl",
# ]
# ///

import csv
from datetime import datetime
from typing import Any

import openpyxl
import jinja2

TPL = """---
title: Veranstaltungen
---

<table class="table">
    <thead>
        <th>Datum</th>
        <th>Ort</th>
        <th>Veranstaltung</th>
    </thead>
    <tbody>
    {% for event in events %}
        <tr>
            <td>{{ event.date.strftime('%d.%m.%Y') }}</td>
            <td>{{ event.location }}</td>
            {% if event.url %}
                <td><a href="{{ event.url }}">{{ event.details }}</a></td>
            {% else %}
                <td>{{ event.details }}</td>
            {% endif %}
        </tr>
    {% endfor %}
    </tbody>
</table>
"""


def read_sheet() -> list[dict[str, Any]]:
    workbook = openpyxl.load_workbook('termine.xlsx')
    sheet = workbook.active
    if sheet is None:
        raise ValueError("No active sheet found in the workbook.")
    header = list(next(sheet.iter_rows(min_row=1, max_row=1, values_only=True)))
    events = [dict(zip(header, row)) for row in sheet.iter_rows(min_row=2, values_only=True)]

    return sorted(events, key=lambda x: x["date"], reverse=True)


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
    vars = {"events": read_sheet()}
    print(render_template(variables=vars))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass