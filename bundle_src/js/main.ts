import { initEventLists } from "./event-list";
import { initNextEvents } from "./next-events";

initEventLists();

try {
    await initNextEvents();
} catch (error) {
    console.error("Failed to load the next events:", error);
}
