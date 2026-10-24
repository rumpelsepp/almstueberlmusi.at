// Replaces the browser's controls of the players rendered by
// layouts/_shortcodes/audio.html with a play button, a seek slider and the
// time, styled by .audio-player in bundle_src/css/style.css.

import pauseFill from "bootstrap-icons/icons/pause-fill.svg";
import playFill from "bootstrap-icons/icons/play-fill.svg";
import { icon } from "../../themes/bienensteff/bundle_src/js/icon";

const PLAYER = "figure.audio-player";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.className = className;
    return node;
}

// Seconds as "3:21"; "–:––" while the length isn't known yet.
function clock(seconds: number): string {
    if (!Number.isFinite(seconds)) {
        return "–:––";
    }
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function initPlayer(player: HTMLElement): void {
    const audio = player.querySelector("audio");
    if (!audio) {
        return;
    }
    const title = player.querySelector("figcaption")?.textContent?.trim() || "Hörprobe";

    const toggle = el("button", "audio-player-toggle");
    toggle.type = "button";
    // Both icons are there; the hidden attribute shows the one that fits.
    const play = icon(playFill);
    play.classList.add("bi", "bi-play-fill");
    const pause = icon(pauseFill);
    pause.classList.add("bi", "bi-pause-fill");
    toggle.append(play, pause);

    const seek = el("input", "audio-player-seek");
    seek.type = "range";
    seek.min = "0";
    seek.step = "1";
    seek.value = "0";
    seek.setAttribute("aria-label", `${title}: Position`);

    const time = el("span", "audio-player-time");

    function update(): void {
        const playing = !audio!.paused && !audio!.ended;
        play.toggleAttribute("hidden", playing);
        pause.toggleAttribute("hidden", !playing);
        toggle.setAttribute("aria-label", `${title} ${playing ? "anhalten" : "abspielen"}`);

        if (Number.isFinite(audio!.duration)) {
            seek.max = String(Math.floor(audio!.duration));
        }
        seek.value = String(Math.floor(audio!.currentTime));
        const text = `${clock(audio!.currentTime)} / ${clock(audio!.duration)}`;
        time.textContent = text;
        seek.setAttribute("aria-valuetext", text.replace("/", "von"));
    }

    toggle.addEventListener("click", () => {
        if (audio.paused) {
            void audio.play();
        } else {
            audio.pause();
        }
    });
    seek.addEventListener("input", () => {
        audio.currentTime = Number(seek.value);
    });
    for (const event of ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended"]) {
        audio.addEventListener(event, update);
    }

    // The caption stays the last child of the figure, as HTML wants it; the
    // grid in style.css puts it on top.
    audio.controls = false;
    audio.after(toggle, seek, time);
    player.classList.add("audio-player--enhanced");
    update();
}

export function initAudioPlayers(): void {
    document.querySelectorAll<HTMLElement>(PLAYER).forEach(initPlayer);
}
