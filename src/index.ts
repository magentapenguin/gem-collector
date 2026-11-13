import { crew } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type * as kt from "kaplay";
import { button, randomPos } from "./utils";
import { stamina } from "./stamina";
import { objs } from "./resources";
import { ProjectileType, projectiles, shootProjectile } from "./projectile";
import './winScreen';

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

export default k;

for (const obj of objs) {
    k.loadCrew("sprite", obj);
}

k.loadCrew("font", "happy");

k.loadCrew("sprite", "bean");
k.loadCrew("sprite", "mark");

const bg = k.add([
    k.pos(0, 0),
    k.rect(k.width(), k.height()),
    k.color("#c499f2"),
    k.fixed(),
    k.stay(),
    k.z(-1),
]);

export const PLAYER_SPEED = 2e2;

k.add([
    k.pos(0, -30),
    k.rect(k.width(), 30),
    k.color("#422c59"),
    k.area(),
    k.stay(),
    k.body({
        isStatic: true,
    }),
    k.z(-1),
    "outer_wall",
]);
k.add([
    k.pos(0, k.height()),
    k.rect(k.width(), 30),
    k.color("#422c59"),
    k.area(),
    k.stay(),
    k.body({
        isStatic: true,
    }),
    k.z(-1),
    "outer_wall",
]);
k.add([
    k.pos(k.width(), 0),
    k.rect(30, k.height()),
    k.color("#422c59"),
    k.area(),
    k.stay(),
    k.body({
        isStatic: true,
    }),
    k.z(-1),
    "outer_wall",
]);
k.add([
    k.pos(-30, 0),
    k.rect(30, k.height()),
    k.color("#422c59"),
    k.area(),
    k.stay(),
    k.body({
        isStatic: true,
    }),
    k.z(-1),
    "outer_wall",
]);

export function processMoveVel(vec: kt.Vec2) {
    const length = vec.len() / PLAYER_SPEED;
    if (length > 0) {
        vec = vec.scale(Math.min(1, 1 / length));
    }
    return k.vec2(vec.x * k.dt(), vec.y * k.dt());
}

function setupPlayers() {
    const p1 = k.add([
        k.sprite("bean"),
        k.pos(randomPos(50)),
        k.anchor("center"),
        k.area(),
        k.body(),
        stamina(),
        { moveVel: k.vec2(), score: 0, selectedWeapon: ProjectileType.NORMAL, lastWeaponChange: 0 },
        "player",
    ]);
    
    const p2 = k.add([
        k.sprite("mark"),
        k.pos(randomPos(50)),
        k.anchor("center"),
        k.area(),
        k.body(),
        stamina(),
        { moveVel: k.vec2(), score: 0, selectedWeapon: ProjectileType.NORMAL, lastWeaponChange: 0 },
        "player",
    ]);
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
        if (p1.stamina <= 20 || p1.recharging || p1.moveVel.len() === 0) return;
        p1.moveBy(processMoveVel(p1.moveVel).scale(5));
        p1.consumeStamina(200 * k.dt());
    });
    k.onButtonDown("p2_dash", () => {
        if (p2.stamina <= 20 || p2.recharging || p2.moveVel.len() === 0) return;
        p2.moveBy(processMoveVel(p2.moveVel).scale(5));
        p2.consumeStamina(200 * k.dt());
    });
    
    k.add([k.fixed(),k.z(2)]).onDraw(() => {
        const text = k.formatText({
            text: `${p1.score} - ${p2.score}`,
            pos: k.vec2(k.width() / 2, 10),
            align: "center",
        });
        text.opt.pos = k.vec2(k.width() / 2 - text.width / 2, 10);
        k.drawFormattedText(text);
    });
    
    p1.onUpdate(() => {
        if (p1.score < p2.score && p1.stamina < 100) {
            // give a stamina boost if behind
            p1.stamina += k.dt() * 20;
        }
    });
    
    p2.onUpdate(() => {
        if (p2.score < p1.score && p2.stamina < 100) {
            // give a stamina boost if behind
            p2.stamina += k.dt() * 20;
        }
    });


    k.onButtonPress("p1_switch", () => {
        p1.selectedWeapon = (p1.selectedWeapon + 1) % Object.keys(projectiles).length;
        if (projectiles[p1.selectedWeapon].hidden) {
            p1.selectedWeapon = (p1.selectedWeapon + 1) % Object.keys(projectiles).length;
        }
        p1.lastWeaponChange = k.time();
    });
    k.onButtonPress("p2_switch", () => {
        p2.selectedWeapon = (p2.selectedWeapon + 1) % Object.keys(projectiles).length;
        if (projectiles[p2.selectedWeapon].hidden) {
            p2.selectedWeapon = (p2.selectedWeapon + 1) % Object.keys(projectiles).length;
        }
        p2.lastWeaponChange = k.time();
    });
    
    k.onButtonPress("p1_fire", () => {
        if (p1.stamina <= projectiles[p1.selectedWeapon].staminaCost || p1.recharging) return;
        p1.consumeStamina(projectiles[p1.selectedWeapon].staminaCost);
        shootProjectile(p1, p2, p1.selectedWeapon);
    });
    k.onButtonPress("p2_fire", () => {
        if (p2.stamina <= projectiles[p2.selectedWeapon].staminaCost || p2.recharging) return;
        p2.consumeStamina(projectiles[p2.selectedWeapon].staminaCost);
        shootProjectile(p2, p1, p2.selectedWeapon);
    });
    
    p1.onDraw(() => {
        k.drawText({
            text: "P1",
            size: 16,
            pos: k.vec2(32, -30),
            align: "center",
        });
        if (k.time() - p1.lastWeaponChange < 1000) {
            k.drawText({
                text: projectiles[p1.selectedWeapon].name,
                size: 12,
                pos: k.vec2(0, 32),
                align: "left",
            });
        }
    });
    p2.onDraw(() => {
        k.drawText({
            text: "P2",
            size: 16,
            pos: k.vec2(32, -30),
            align: "center",
        });
        if (k.time() - p2.lastWeaponChange < 1000) {
            k.drawText({
                text: projectiles[p2.selectedWeapon].name,
                size: 12,
                pos: k.vec2(0, 32),
                align: "left",
            });
        }
    });
    
    
    k.onUpdate(() => {
        p1.moveBy(
            processMoveVel(p1.moveVel).scale(k.clamp(p1.stamina / 50, 0.2, 1)),
        );
        p2.moveBy(
            processMoveVel(p2.moveVel).scale(k.clamp(p2.stamina / 50, 0.2, 1)),
        );
        p1.moveVel.x = 0;
        p1.moveVel.y = 0;
        p2.moveVel.x = 0;
        p2.moveVel.y = 0;
        if (p1.score >= 10) {
            k.go("winner", "P1");
        }
        if (p2.score >= 10) {
            k.go("winner", "P2");
        }
    });

    k.onKeyPress("escape", () => {
        k.go("main_menu");
    });

    return { p1, p2 }
}

k.scene("game_grab", () => {
    k.setGravity(0);

    const { p1, p2 } = setupPlayers();

    function findCollectiblePos() {
        let out = randomPos(50);
        do {
            out = randomPos(50);
        } while (out.dist(p1.pos) < 50 || out.dist(p2.pos) < 50);
        return out;
    }

    const collectible = k.add([
        k.sprite(k.choose(objs)),
        k.pos(findCollectiblePos()),
        k.body(),
        k.anchor("center"),
        k.area(),
    ]);

    collectible.onCollide("player", (p) => {
        p.score += 1;
        p.stamina += 15;
        collectible.pos = findCollectiblePos();
        collectible.sprite = k.choose(objs);
    });

});

k.scene("game_shoot", () => {
    k.setGravity(0);

    const { p1, p2 } = setupPlayers();

    p1.onUpdate(() => {
        if (p1.stamina <= 5) {
            p2.score += 1;
            p1.stamina = 100;
            p1.pos = randomPos(50);
        }
    });
    p2.onUpdate(() => {
        if (p2.stamina <= 5) {
            p1.score += 1;
            p2.stamina = 100;
            p2.pos = randomPos(50);
        }
    });

});

k.scene("main_menu", () => {
    k.add([
        k.text("Gem Collector"),
        k.anchor("center"),
        k.pos(k.width() / 2, 100)
    ]);
    button(
        "Play",
        k.vec2(k.width() / 2, 200),
        () => k.go("game_grab"),
        {
            fontSize: 24
        }
    );
    button(
        "Play Battle Mode",
        k.vec2(k.width() / 2, 260),
        () => k.go("game_shoot"),
        {
            fontSize: 24
        }
    );
});
k.onUpdate(() => {
    k.go("main_menu");
});
