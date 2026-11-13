import { k, PLAYER_SPEED, processMoveVel } from ".";
import { objs } from "./resources";
import { button } from "./utils";
    
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
            processMoveVel(player.moveVel).scale(2)
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
