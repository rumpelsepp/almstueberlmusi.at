#!/usr/bin/env python3

import csv
from datetime import datetime
from typing import Any

import httpx
import jinja2

UPSTREAM_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcMg0_gHNudEnG0JYJuUyojcy84i4H_MZSFkogYyTfy4-pF57AF6ofghp7Hz1EkdXsqGlqLqovPAjv/pub?output=csv"
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
            <td>{{ event.date }}</td>
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


def fetch_sheet(url: str) -> list[dict[str, Any]]:
    with httpx.Client(follow_redirects=True) as client:
        r = client.get(url)
        r.raise_for_status()
        out = csv.DictReader(r.text.splitlines(), delimiter=",", quotechar='"')
        return sorted(out, key=lambda x: datetime.strptime(x["date"], "%d.%m.%Y"), reverse=True)


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
    vars = {"events": fetch_sheet(UPSTREAM_URL)}
    print(render_template(variables=vars))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
