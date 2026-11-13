import type * as kt from "kaplay";

import { k } from "./kaplay";

export function randomPos(padding = 0) {
    return k.vec2(
        k.randi(padding, k.width() - padding),
        k.randi(padding, k.height() - padding)
    );
}
export function button(
    text: string,
    pos: kt.Vec2,
    onClick: () => void,
    opts: { padding?: kt.Vec2; fontSize?: number; } = {}) {
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
