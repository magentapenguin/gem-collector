import { crew, SpriteCrewAssetAndOutlined } from "@kaplayjs/crew";
import kaplay from "kaplay";
import type * as kt from "kaplay";

const k = kaplay({
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

const bg = k.add([
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

function button(
    text: string,
    pos: kt.Vec2,
    onClick: () => void,
    opts: { padding?: kt.Vec2; fontSize?: number } = {},
) {
    const padding = opts.padding ?? k.vec2(25, 10);
    const fmtText = k.formatText({
        text,
        size: opts.fontSize ?? 24,
    });
    const btn = k.add([
        k.rect(fmtText.width + padding.x * 2, fmtText.height + padding.y * 2, {
            radius: 5,
        }),
        k.outline(2, k.BLACK),
        k.anchor("center"),
        k.color("#6f459c"),
        k.pos(pos),
        k.area(),
        k.scale(),
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
    consumeStamina: (amount: number) => void;
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
                    radius: Math.round((stamina / 100) * 10),
                    color: recharging ? k.RED : k.GREEN,
                });
            }
        },
        consumeStamina(amount: number) {
            this.stamina -= amount;
            if (this.stamina < 0) {
                this.stamina = 0;
            }
        },
        update() {
            this.stamina += k.dt() * 10;
            if (this.stamina < 20) {
                this.recharging = true;
            } else if (this.stamina >= 50 && this.recharging) {
                this.recharging = false;
            }
            this.stamina = k.clamp(this.stamina, 0, 100);
        },
    };
}
const PLAYER_SPEED = 2e2;

k.scene("winner", (winner) => {
    k.setGravity(1000);
    const spawner = k.add([k.timer()]);
    spawner.loop(0.02, () => {
        let x = k.randi(0, k.width() / 2) + k.randi(0, k.width() / 2); // Prefer center
        const obj = spawner.add([
            k.sprite(k.choose(objs)),
            k.pos(x, -60),
            k.anchor("center"),
            k.area({ collisionIgnore: ["wall", "outer_wall"] }),
            k.body({ stickToPlatform: false }),
            k.offscreen({ destroy: true }),
            "falling"
        ]);
        obj.onCollide("player", (player) => {
            obj.destroy();
            player.score += 1;
        });
    });

    const player = k.add([
        k.sprite(winner === "P1" ? "bean" : "mark"),
        k.pos(k.width() / 2, k.height() - 50),
        k.anchor("center"),
        k.area(),
        k.body(),
        { moveVel: k.vec2(), score: 0 },
        "player",
    ]);
    if (winner === "P1") {
        k.add([
            k.pos(k.width() / 2, k.height() / 2),
            k.text(`Winner: Player 1`, { size: 32 }),
            k.anchor("center"),
        ]);
        player.onButtonDown("p1_left", () => {
            player.moveVel.x = -PLAYER_SPEED;
        });
        player.onButtonDown("p1_right", () => {
            player.moveVel.x = PLAYER_SPEED;
        });
        player.onButtonPress("p1_up", () => {
            if (player.isGrounded()) {
                player.jump();
            }
        });
    } else if (winner === "P2") {
        k.add([
            k.pos(k.width() / 2, k.height() / 2),
            k.text(`Winner: Player 2`, { size: 32 }),
            k.anchor("center"),
        ]);
        player.onButtonDown("p2_left", () => {
            player.moveVel.x = -PLAYER_SPEED;
        });
        player.onButtonDown("p2_right", () => {
            player.moveVel.x = PLAYER_SPEED;
        });
        player.onButtonPress("p2_up", () => {
            if (player.isGrounded()) {
                player.jump();
            }
        });
    }
    player.onUpdate(() => {
        player.moveBy(
            processMoveVel(player.moveVel).scale(2),
        );
        player.moveVel.x = 0;
        player.moveVel.y = 0;
    });
    player.onDraw(() => {
        k.drawText({
            text: `Score: ${player.score}`,
            pos: k.vec2(0, -50),
            size: 16,
        });
    });
    button("Restart", k.vec2(k.width() / 2, k.height() / 2 + 50), () => {
        k.go("main_menu");
    });
});
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

function processMoveVel(vec: kt.Vec2) {
    const length = vec.len() / PLAYER_SPEED;
    if (length > 0) {
        vec = vec.scale(Math.min(1, 1 / length));
    }
    return k.vec2(vec.x * k.dt(), vec.y * k.dt());
}

enum ProjectileType {
    NORMAL,
    TRACKING,
    SCATTERTRACK,
    SCATTER,
    TRANSGENDERDEATHRAY,
}

const projectiles = {
    [ProjectileType.NORMAL]: {
        staminaCost: 10,
        name: "Standard"
    },
    [ProjectileType.TRACKING]: {
        staminaCost: 70,
        name: "Tracking"
    },
    [ProjectileType.SCATTERTRACK]: {
        staminaCost: 50,
        name: "Scatter Tracking"
    },
    [ProjectileType.SCATTER]: {
        staminaCost: 12,
        name: "Scatter"
    }
}

function projectile(sender: kt.GameObj, opts: {
    damage?: number
    vamp?: number
    maxAge?: number
    maxAgeRange?: number
} = {}) {
    return {
        require: ["area"],
        start: 0,
        maxAge: null,
        age() {
            return k.time() - this.start;
        },
        update() {
            if (this.maxAge !== null) {
                if (this.age() > this.maxAge) {
                    this.destroy();
                } else if (this.age() + 2 > this.maxAge) {
                    this.opacity = (this.maxAge - this.age()) / 2;
                }
            }
        },
        sender: sender,
        add() {
            this.start = k.time();
            this.maxAge = opts.maxAge ?? null;
            if (opts.maxAgeRange !== undefined && opts.maxAge !== undefined) {
                this.maxAge += k.rand(-opts.maxAgeRange, opts.maxAgeRange);
            }
            this.onCollide("player", (p) => {
                if (p === sender && this.age() < 0.5) return;
                if (sender.stamina !== undefined && p !== sender)
                    sender.stamina += opts.vamp ?? 15;
                p.consumeStamina(opts.damage ?? 20);
                this.destroy();
            });
            this.onCollide("wall", () => {
                this.destroy();
            });
            this.onCollide("projectile", (other) => {
                if (other.sender === sender) return;
                this.destroy();
                other.destroy();
            });
        },
    }
}

function shootProjectile(shooter: kt.GameObj, target: kt.GameObj, type: ProjectileType = ProjectileType.TRACKING): kt.GameObj[] {
    function createProjectile(angle: number, opts: { size?: kt.Vec2, comp?: kt.Comp[], projectileOpts?: { damage?: number, vamp?: number, maxAge?: number } } = {}) {
        return k.add([
            k.pos(shooter.pos),
            k.area({ isSensor: true }),
            k.rect(opts.size?.x ?? 5, opts.size?.y ?? 5),
            k.color(k.WHITE),
            k.rotate(angle),
            k.offscreen({ destroy: true }),
            projectile(shooter, opts.projectileOpts),
            "projectile",
            ...(opts.comp ?? []),
        ]);
    }
    switch (type) {
        case ProjectileType.SCATTER: {
            const count = 5;
            const angles = [];
            for (let i = 0; i < count; i++) {
                angles.push(target.pos.angle(shooter.pos) - (count * 5 / 2) + (i * 5));
            }
            const projectiles = [];
            for (const angle of angles) {
                let proj = createProjectile(angle, { projectileOpts: { damage: 5, vamp: 0, maxAge: 3, maxAgeRange: 2 } });
                proj.onUpdate(() => {
                    proj.move(k.Vec2.fromAngle(angle).scale(300));
                });
                projectiles.push(proj);
            }
            
            return projectiles;
        }

        case ProjectileType.TRACKING: {
            const angle = target.pos.angle(shooter.pos);
            const proj = createProjectile(angle, { size: k.vec2(15, 5), projectileOpts: { damage: 90, vamp: 95, maxAge: 8 } });
            proj.onUpdate(() => {
                const angle = k.lerpAngle(proj.angle, target.pos.angle(proj.pos), k.dt() * 5);
                proj.angle = angle;
                proj.move(k.Vec2.fromAngle(angle).scale(200));
            });
            return [proj];
        }

        case ProjectileType.SCATTERTRACK: {
            const count = 8;
            const angles = [];
            for (let i = 0; i < count; i++) {
                angles.push(target.pos.angle(shooter.pos) - (count * 15 / 2) + (i * 15));
            }
            const projectiles = [];
            for (const angle of angles) {
                const proj = createProjectile(angle, { size: k.vec2(8, 5), projectileOpts: { damage: 1, vamp: 0, maxAge: 3, maxAgeRange: 2 } });
                proj.onUpdate(() => {
                    const angle = k.lerpAngle(proj.angle, target.pos.angle(proj.pos), k.dt() * 2);
                    proj.angle = angle;
                    proj.move(k.Vec2.fromAngle(angle).scale(400));
                });
                projectiles.push(proj);
            }
            return projectiles;
        }
        
        case ProjectileType.NORMAL: {
            const proj = createProjectile(target.pos.angle(shooter.pos));
            proj.onUpdate(() => {
                proj.move(k.Vec2.fromAngle(proj.angle).scale(300));
            });
            return [proj];
        }

        case ProjectileType.TRANSGENDERDEATHRAY: {
            const proj = k.add([
                k.pos(shooter.pos),
                k.rect(k.width() + k.height(), 15),
                k.color(0, 255, 255),
                k.area({ isSensor: true }),
                k.rotate(shooter.pos.angle(target.pos)),
                k.anchor("right"),
                k.opacity(1),
                "projectile"
            ]);
            proj.add([
                k.rect(proj.width, proj.height / 5 * 3),
                k.pos(0, 0),
                k.anchor("right"),
                k.color(255, 0, 255),
                k.opacity(1),
            ])
            proj.add([
                k.rect(proj.width, proj.height / 5),
                k.pos(0, 0),
                k.anchor("right"),
                k.color(255, 255, 255),
                k.opacity(1),
            ])
            proj.onUpdate(() => {
                proj.opacity -= k.clamp(1 - proj.opacity + 0.01, 0, 1) * 4 * k.dt();
                proj.children.forEach(child => {
                    child.opacity = proj.opacity;
                });
                if (proj.opacity <= 0) {
                    proj.destroy();
                }
            })
            proj.onCollideUpdate("player", (p) => {
                if (p === shooter) return;
                shooter.stamina += 2
                p.consumeStamina(proj.opacity);
            });
            return [proj];
        }
    }
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
        p1.lastWeaponChange = k.time();
    });
    k.onButtonPress("p2_switch", () => {
        p2.selectedWeapon = (p2.selectedWeapon + 1) % Object.keys(projectiles).length;
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
