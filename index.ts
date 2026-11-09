import { crew, SpriteCrewAssetAndOutlined } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type * as kt from "kaplay";

const k = kaplay({
    plugins: [crew],
    font: "happy",
    debugKey: "h",
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
            keyboard: "control",
        },
        p2_dash: {
            keyboard: "u",
        },
    },
});

const objs: SpriteCrewAssetAndOutlined[] = [
    "apple",
    "lightning",
    "coin",
    "egg",
    "key",
    "meat",
    "mushroom",
];

for (const obj of objs) {
    k.loadCrew("sprite", obj);
}

k.loadCrew("font", "happy");

k.loadCrew("sprite", "bean");
k.loadCrew("sprite", "mark");

k.add([
    k.pos(0, 0),
    k.rect(k.width(), k.height()),
    k.color("#c499f2"),
    k.fixed(),
    k.stay(),
    k.z(-1),
]);

function randomPos(padding = 0) {
    return k.vec2(
        k.randi(padding, k.width() - padding),
        k.randi(padding, k.height() - padding),
    );
}

function button(text: string, pos: kt.Vec2, onClick: () => void, opts: { padding?: kt.Vec2, fontSize?: number } = {}) {
    const padding = opts.padding ?? k.vec2(25, 10);
    const fmtText = k.formatText({
        text,
        size: opts.fontSize ?? 24,
    });
    const btn = k.add([
        k.rect(fmtText.width + padding.x * 2, fmtText.height + padding.y * 2, { radius: 5 }),
        k.outline(2, k.BLACK),
        k.anchor("center"),
        k.color("#6f459c"),
        k.pos(pos),
        k.stay(),
        k.area(),
        k.scale()
    ]);
    fmtText.opt.pos = k.vec2(-fmtText.width / 2, -fmtText.height / 2);
    btn.onDraw(() => {
        k.drawFormattedText(fmtText);
    });
    btn.onHover(() => {
        k.setCursor("pointer");
        btn.scaleTo(1.1);
    });
    btn.onHoverEnd(() => {
        k.setCursor("default");
        btn.scaleTo(1);
    });
    btn.onClick(onClick);
    return btn;
}

interface StaminaComp extends kt.Comp {
    stamina: number;
    recharging: boolean;
}

function stamina(): StaminaComp {
    return {
        id: "stamina",
        require: ["pos"],
        stamina: 100,
        recharging: false,
        draw() {
            const { stamina, recharging } = this as StaminaComp;
            if (stamina !== 100) {
                k.drawCircle({
                    pos: k.vec2(-25, -25),
                    radius: 10,
                    color: k.BLACK,
                });
                k.drawCircle({
                    pos: k.vec2(-25, -25),
                    radius: (stamina / 100) * 10,
                    color: recharging ? k.RED : k.GREEN,
                });
            }
        },
        update() {
            this.stamina += k.dt() * 10;
            if (this.stamina < 10) {
                this.recharging = true;
            } else if (this.stamina >= 90 && this.recharging) {
                this.recharging = false;
            }
            this.stamina = k.clamp(this.stamina, 0, 100);
        },
    };
}
const PLAYER_SPEED = 1e2;

k.scene("winner", (winner) => {
    k.setGravity(3600);
    const spawner = k.add([
        k.timer()
    ]);
    spawner.loop(0.1, () => {
        spawner.add([
            k.sprite(k.choose(objs)),
            k.pos(k.randi(0, k.width()), -60),
            k.anchor("center"),
            k.area(),
            k.body(),
            k.offscreen({ destroy: true })
        ]);
    });
    if (winner === "P1") {
        k.add([
            k.pos(k.width() / 2, k.height() / 2),
            k.text(`Winner: Player 1`, { size: 32 }),
            k.anchor("center"),
        ]);
    } else if (winner === "P2") {
        k.add([
            k.pos(k.width() / 2, k.height() / 2),
            k.text(`Winner: Player 2`, { size: 32 }),
            k.anchor("center"),
        ]);
    }
    button("Restart", k.vec2(k.width() / 2, k.height() / 2 + 50), () => {
        k.go("game");
    });
});

k.scene("game", () => {
    k.add([
        k.pos(0, -30),
        k.rect(k.width(), 30),
        k.color("#422c59"),
        k.area(),
        k.body({
            isStatic: true
        }),
        k.z(-1),
        "wall"
    ]);
    k.add([
        k.pos(0, k.height()),
        k.rect(k.width(), 30),
        k.color("#422c59"),
        k.area(),
        k.body({
            isStatic: true
        }),
        k.z(-1),
        "wall"
    ]);
    k.add([
        k.pos(k.width(), 0),
        k.rect(30, k.height()),
        k.color("#422c59"),
        k.area(),
        k.body({
            isStatic: true
        }),
        k.z(-1),
        "wall"
    ]);
    k.add([
        k.pos(-30, 0),
        k.rect(30, k.height()),
        k.color("#422c59"),
        k.area(),
        k.body({
            isStatic: true
        }),
        k.z(-1),
        "wall"
    ]);
    k.setGravity(0)
    const p1 = k.add([
        k.sprite("bean"),
        k.pos(randomPos(50)),
        k.anchor("center"),
        k.area(),
        k.body(),
        stamina(),
        { moveVel: k.vec2(), score: 0 },
        "player",
    ]);

    const p2 = k.add([
        k.sprite("mark"),
        k.pos(randomPos(50)),
        k.anchor("center"),
        k.area(),
        k.body(),
        stamina(),
        { moveVel: k.vec2(), score: 9 },
        "player",
    ]);

    const collectible = k.add([
        k.sprite(k.choose(objs)),
        k.pos(randomPos(50)),
        k.anchor("center"),
        k.area(),
    ]);

    collectible.onCollide("player", (p) => {
        p.score += 1;
        collectible.pos = randomPos(50);
        collectible.sprite = k.choose(objs);
        const other = p === p1 ? p2 : p1;
        while (
            collectible.pos.dist(p.pos) < 150 ||
            collectible.pos.dist(other.pos) < 50 // Give the other player a fair chance to reach it
        ) {
            console.log("Collectible too close to players, repositioning...");
            collectible.pos = randomPos(50);
        }
    });

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

    k.onDraw(() => {
        const text = k.formatText({
            text: `${p1.score} - ${p2.score}`,
            pos: k.vec2(k.width() / 2, 10),
            align: "center",
        });
        text.opt.pos = k.vec2(k.width() / 2 - text.width / 2, 10);
        k.drawFormattedText(text);
    });

    k.onButtonPress("p1_fire", () => {
        if (p1.stamina <= 0 || p1.recharging) return;
        p1.stamina -= 20;
        const projectile = k.add([
            k.pos(p1.pos),
            k.area(),
            k.rect(5, 5),
            k.color(k.WHITE),
            k.move(p2.pos.angle(p1.pos), 300),
            k.offscreen({ destroy: true }),
            "projectile",
        ]);
        projectile.onCollide("player", (p) => {
            if (p !== p1) {
                p.stamina -= 40;
                projectile.destroy();
            }
        });
    });
    k.onButtonPress("p2_fire", () => {
        if (p2.stamina <= 0 || p2.recharging) return;
        p2.stamina -= 20;
        const projectile = k.add([
            k.pos(p2.pos),
            k.rect(5, 5),
            k.color(k.WHITE),
            k.area(),
            k.move(p1.pos.angle(p2.pos), 300),
            k.offscreen({ destroy: true }),
            "projectile",
        ]);
        projectile.onCollide("player", (p) => {
            if (p !== p2) {
                p.stamina -= 40;
                projectile.destroy();
            }
        });
    });

    p1.onDraw(() => {
        k.drawText({
            text: "P1",
            size: 16,
            pos: k.vec2(32, -30),
            align: "center",
        });
    });
    p2.onDraw(() => {
        k.drawText({
            text: "P2",
            size: 16,
            pos: k.vec2(32, -30),
            align: "center",
        });
    });

    function processMoveVel(vec: kt.Vec2) {
        const length = vec.len() / PLAYER_SPEED;
        if (length > 0) {
            vec = vec.scale(Math.min(1, 1 / length));
        }
        return k.vec2(vec.x * k.dt(), vec.y * k.dt());
    }

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
});

k.go("game")