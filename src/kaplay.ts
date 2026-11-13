import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";

export const k = kaplay({
    plugins: [crew],
    font: "happy",
    width: 4 * 300,
    height: 3 * 300,
    letterbox: true,
    pixelDensity: 2,
    background: "#422c59",
    buttons: {
        p1_up: {
            keyboard: "w",
        },
        p1_down: {
            keyboard: "s",
        },
        p1_left: {
            keyboard: "a",
        },
        p1_right: {
            keyboard: "d",
        },
        p1_fire: {
            keyboard: "space",
        },
        p1_dash: {
            keyboard: "q",
        },
        p1_switch: {
            keyboard: "e",
        },
        p2_up: {
            keyboard: "i",
        },
        p2_down: {
            keyboard: "k",
        },
        p2_left: {
            keyboard: "j",
        },
        p2_right: {
            keyboard: "l",
        },
        p2_fire: {
            keyboard: ".",
        },
        p2_dash: {
            keyboard: "u",
        },
        p2_switch: {
            keyboard: "o",
        },
    },
});