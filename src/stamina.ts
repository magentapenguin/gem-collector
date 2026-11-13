import type * as kt from "kaplay";
import { k } from ".";

interface StaminaComp extends kt.Comp {
    stamina: number;
    recharging: boolean;
    consumeStamina: (amount: number) => void;
}
export function stamina(): StaminaComp {
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
