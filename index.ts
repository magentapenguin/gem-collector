import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type * as kt from "kaplay";

const k = kaplay({
    plugins: [crew],
    font: "happy",
    debugKey: 'i',
    width: 4 * 300,
    height: 3 * 300,
    letterbox: true,
    pixelDensity: 2,
    buttons: {
        p1_up: {
            keyboard: "w"
        },
        p1_down: {
            keyboard: "s"
        },
        p1_left: {
            keyboard: "a"
        },
        p1_right: {
            keyboard: "d"
        },
        p1_fire: {
            keyboard: "space"
        },
        p1_dash: {
            keyboard: "q"
        },
        p2_up: {
            keyboard: "i"
        },
        p2_down: {
            keyboard: "k"
        },
        p2_left: {
            keyboard: "j"
        },
        p2_right: {
            keyboard: "l"
        },
        p2_fire: {
            keyboard: "control"
        },
        p2_dash: {
            keyboard: "u"
        }
    }
});
k.loadCrew("font", "happy");

k.loadCrew("sprite", "bean");
k.loadCrew("sprite", "mark");

const p1 = k.add([
    k.sprite("bean"),
    k.pos(20, 20),
    k.area(),
    k.body(),
    { moveVel: k.vec2(), stamina: 100, recharging: false }
]);

const p2 = k.add([
    k.sprite("mark"),
    k.pos(100, 100),
    k.area(),
    k.body(),
    { moveVel: k.vec2(), stamina: 100, recharging: false }
]);

const PLAYER_SPEED = 1e2;

k.onButtonDown("p1_up", () => {
    p1.moveVel.y = -PLAYER_SPEED;
});

k.onButtonDown("p1_down", () => {
    p1.moveVel.y = PLAYER_SPEED;
});

k.onButtonDown("p1_left", () => {
    p1.moveVel.x = -PLAYER_SPEED;
});

k.onButtonDown("p1_right", () => {
    p1.moveVel.x = PLAYER_SPEED;
});

k.onButtonDown("p2_up", () => {
    p2.moveVel.y = -PLAYER_SPEED;
});

k.onButtonDown("p2_down", () => {
    p2.moveVel.y = PLAYER_SPEED;
});

k.onButtonDown("p2_left", () => {
    p2.moveVel.x = -PLAYER_SPEED;
});

k.onButtonDown("p2_right", () => {
    p2.moveVel.x = PLAYER_SPEED;
});

k.onButtonDown("p1_dash", () => {
    if (p1.stamina <= 0 || p1.recharging || p1.moveVel.len() === 0) return;
    p1.moveBy(processMoveVel(p1.moveVel).scale(5));
    p1.stamina -= 200 * k.dt();
});
k.onButtonDown("p2_dash", () => {
    if (p2.stamina <= 0 || p2.recharging || p2.moveVel.len() === 0) return;
    p2.moveBy(processMoveVel(p2.moveVel).scale(5));
    p2.stamina -= 200 * k.dt();
});
p1.onDraw(() => {
    if (p1.stamina !== 100) {
        k.drawCircle({
            pos: k.vec2(-15, -15),
            radius: 10,
            color: k.BLACK
        });
        k.drawCircle({
            pos: k.vec2(-15, -15),
            radius: (p1.stamina / 100) * 10,
            color: p1.recharging ? k.RED : k.GREEN,
        });
    }
});
p2.onDraw(() => {
    if (p2.stamina !== 100) {
        k.drawCircle({
            pos: k.vec2(-15,- 15),
            radius: 10,
            color: k.BLACK
        });
        k.drawCircle({
            pos: k.vec2(-15, -15),
            radius: (p2.stamina / 100) * 10,
            color: p2.recharging ? k.RED : k.GREEN,
        });
    }
});

function processMoveVel(vec: kt.Vec2) {
    const length = vec.len() / PLAYER_SPEED;
    if (length > 0) {
        vec = vec.scale(Math.min(1, 1 / length));
    }
    console.log("Processed move vector:", vec);
    return k.vec2(vec.x * k.dt(), vec.y * k.dt());
}

k.onUpdate(() => {
    p1.moveBy(processMoveVel(p1.moveVel));
    p2.moveBy(processMoveVel(p2.moveVel));
    p1.moveVel.x = 0;
    p1.moveVel.y = 0;
    p2.moveVel.x = 0;
    p2.moveVel.y = 0;
    p1.stamina += k.dt() * 10;
    if (p1.stamina < 10) {
        p1.recharging = true;
    } else if (p1.stamina >= 90 && p1.recharging) {
        p1.recharging = false;
    }
    p2.stamina += k.dt() * 10;
    if (p2.stamina < 10) {
        p2.recharging = true;
    } else if (p2.stamina >= 90 && p2.recharging) {
        p2.recharging = false;
    }
    p1.stamina = k.clamp(p1.stamina, 0, 100);
    p2.stamina = k.clamp(p2.stamina, 0, 100);
});