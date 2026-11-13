import type * as kt from "kaplay";
import { k } from ".";

export enum ProjectileType {
    NORMAL,
    TRACKING,
    SCATTERTRACK,
    SCATTER,
    TRANSGENDERDEATHRAY
}
export const projectiles: Record<ProjectileType, { staminaCost: number; name: string; hidden?: boolean; }> = {
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
    },
    [ProjectileType.TRANSGENDERDEATHRAY]: {
        hidden: true,
        staminaCost: 100,
        name: "Transgender Deathray"
    }
};
interface ProjectileOpts {
    damage?: number;
    vamp?: number;
    maxAge?: number;
    maxAgeRange?: number;
}
function projectile(sender: kt.GameObj, opts: ProjectileOpts = {}) {
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
                if (p === sender && this.age() < 1) return;
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
    };
}
export function shootProjectile(shooter: kt.GameObj, target: kt.GameObj, type: ProjectileType = ProjectileType.TRACKING): kt.GameObj[] {
    function createProjectile(angle: number, opts: { size?: kt.Vec2; comp?: kt.Comp[]; projectileOpts?: ProjectileOpts; } = {}) {
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
            ]);
            proj.add([
                k.rect(proj.width, proj.height / 5),
                k.pos(0, 0),
                k.anchor("right"),
                k.color(255, 255, 255),
                k.opacity(1),
            ]);
            proj.onUpdate(() => {
                proj.opacity -= k.clamp(1 - proj.opacity + 0.01, 0, 1) * 4 * k.dt();
                proj.children.forEach(child => {
                    child.opacity = proj.opacity;
                });
                if (proj.opacity <= 0) {
                    proj.destroy();
                }
            });
            proj.onCollideUpdate("player", (p) => {
                if (p === shooter) return;
                shooter.stamina += 2;
                p.consumeStamina(proj.opacity);
            });
            return [proj];
        }
    }
}
