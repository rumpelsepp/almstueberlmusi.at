---
title: Veranstaltungen
description: Kommende Veranstaltungen der Almstüberl Musi
---

{{< events.inline >}}
    <table id="event-table" class="table table-striped">
        <thead>
            <tr>
                <th>Datum</th>
                <th>Veranstaltung</th>
                <th>Ort</th>
            </tr>
        </thead>
        <tbody>
        {{- range index hugo.Data.events.events -}}
            <tr>
                {{ $t := time.AsTime .date_time }}
                <td><time datetime="{{ time.Format "2006-01-02" $t }}">{{ time.Format ":date_medium" $t }}</time></td>
                <td>
                    {{ if .url }}
                        <i class="bi bi-box-arrow-up-right"></i>
                        <a href="{{ .url }}" target="_blank" rel="noopener noreferrer">{{ .details }}</a>
                    {{ else }}
                        {{ .details }}
                    {{ end }}
                </td>
                <td>{{ .location }}</td>
            </tr>
        {{- end -}}
        </tbody>
    </table>
{{</ events.inline >}}

<script>
    document.addEventListener("DOMContentLoaded", function () {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Only date comparison, ignore time.

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);

        const rows = document.querySelectorAll("table#event-table tbody tr");

        rows.forEach(row => {
            const timeElement = row.querySelector("time");
            if (timeElement) {
                const event_date = new Date(timeElement.getAttribute("datetime"));
                if (event_date < oneYearAgo) {
                    row.remove();
                    return;
                }
                if (event_date < today) {
                    row.classList.add("dimmed", "text-decoration-line-through");
        
                    // Remove date.
                    const firstCell = row.querySelector("td:first-child");
                    if (firstCell) {
                        firstCell.textContent = "";
                    }
                }
            }
        });
    });
</script>
