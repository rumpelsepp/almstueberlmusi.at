// Brings the event lists rendered by layouts/_shortcodes/events.html up to
// date: they were split into upcoming and past events on the day the site
// was built, which may be a while ago.

const CONTAINER = ".events";

function isoDay(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

// The day of an event tile, as "2026-12-13".
function dayOf(item: HTMLElement): string {
    return item.dataset.day ?? "";
}

// A past event is shown without its date, see layouts/_partials/event.html.
function stripDate(item: Element): void {
    item.querySelector(".event-date")?.remove();
    item.querySelector(".event-when")?.remove();
}

function showYear(item: Element, show: boolean): void {
    const year = item.querySelector<HTMLElement>(".event-year");
    if (year) {
        year.hidden = !show;
    }
}

function initContainer(container: Element): void {
    const upcoming = container.querySelector<HTMLElement>(".events-upcoming .event-list");
    const pastSection = container.querySelector<HTMLElement>(".events-past");
    const past = pastSection?.querySelector<HTMLElement>(".event-list");
    if (!upcoming || !pastSection || !past) {
        return;
    }

    const now = new Date();
    const today = isoDay(now);
    const cutoff = isoDay(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));

    // Upcoming events are sorted soonest first, past ones latest first: an
    // event that has taken place since the build goes on top of the past.
    for (const item of upcoming.querySelectorAll<HTMLElement>(":scope > .event")) {
        if (dayOf(item) < today) {
            stripDate(item);
            past.prepend(item);
        } else {
            showYear(item, !dayOf(item).startsWith(`${now.getFullYear()}-`));
        }
    }
    for (const item of past.querySelectorAll<HTMLElement>(":scope > .event")) {
        if (dayOf(item) < cutoff) {
            item.remove();
        }
    }

    const empty = container.querySelector<HTMLElement>(".events-empty");
    upcoming.hidden = upcoming.children.length === 0;
    if (empty) {
        empty.hidden = !upcoming.hidden;
    }
    pastSection.hidden = past.children.length === 0;
}

export function initEventLists(): void {
    document.querySelectorAll(CONTAINER).forEach(initContainer);
}
