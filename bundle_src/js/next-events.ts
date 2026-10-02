// Fills the sections rendered by layouts/_shortcodes/next-events.html with
// the next upcoming events from the published data/events.json.

const SECTION = ".next-events";

// One entry of data/events.json, as written by scripts/update-events.py.
interface Event {
    date_time: string; // local time without offset, e.g. "2026-12-13T00:00:00"
    details: string;
    location: string;
    url: string | null;
}

interface EventList {
    events: Event[];
}

const LOCALE = "de-AT";
const DAY = new Intl.DateTimeFormat(LOCALE, { day: "numeric" });
const MONTH = new Intl.DateTimeFormat(LOCALE, { month: "short" });
const WEEKDAY = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    text?: string,
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

// Events from today on, the soonest first.
function upcoming(events: Event[], count: number): Event[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
        .filter((event) => new Date(event.date_time) >= today)
        .sort((a, b) => a.date_time.localeCompare(b.date_time))
        .slice(0, count);
}

// The same markup as layouts/_partials/event.html -- keep the two in step.
// externalMark is what the theme appends to external links (icon and a note
// for screen readers), handed over by the shortcode in a <template>.
function renderEvent(event: Event, externalMark: DocumentFragment | undefined): HTMLLIElement {
    const date = new Date(event.date_time);
    const item = el("li", "event");
    item.dataset.day = event.date_time.slice(0, 10);

    const time = el("time", "event-date");
    time.dateTime = item.dataset.day;
    // The space only matters where the spans aren't stacked by CSS: read
    // aloud or copied, it is "29 Nov", not "29Nov".
    time.append(
        el("span", "event-day", DAY.format(date)),
        " ",
        el("span", "event-month", MONTH.format(date)),
    );

    const body = el("div", "event-body");
    const url = event.url?.trim();
    if (url) {
        const link = el("a", "event-name", event.details);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        if (externalMark) {
            link.append(externalMark.cloneNode(true));
        }
        body.append(link);
    } else {
        body.append(el("span", "event-name", event.details));
    }
    // The year only where it isn't obvious: for an event after New Year.
    const when = el("span", "event-when", WEEKDAY.format(date));
    const year = el("span", "event-year", ` · ${date.getFullYear()}`);
    year.hidden = date.getFullYear() === new Date().getFullYear();
    when.append(year, " · ");
    const meta = el("span", "event-meta");
    meta.append(when, event.location);
    body.append(meta);

    item.append(time, body);
    return item;
}

async function initSection(section: HTMLElement): Promise<void> {
    const url = section.dataset.eventsUrl;
    const list = section.querySelector(".event-list");
    if (!url || !list) {
        return;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status}`);
    }
    const data: EventList = await response.json();

    const events = upcoming(data.events, Number(section.dataset.count) || 3);
    if (events.length === 0) {
        return;
    }
    const externalMark = section.querySelector<HTMLTemplateElement>("template.external-link-mark")?.content;
    list.replaceChildren(...events.map((event) => renderEvent(event, externalMark)));
    section.hidden = false;
}

export async function initNextEvents(): Promise<void> {
    const sections = document.querySelectorAll<HTMLElement>(SECTION);
    await Promise.all(Array.from(sections, initSection));
}
