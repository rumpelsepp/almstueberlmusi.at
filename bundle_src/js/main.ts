import { initAudioPlayers } from "./audio-player";
import { initEventLists } from "./event-list";
import { initLightbox } from "./lightbox";
import { initNextEvents } from "./next-events";

initAudioPlayers();
initEventLists();
initLightbox();

try {
    await initNextEvents();
} catch (error) {
    console.error("Failed to load the next events:", error);
}
