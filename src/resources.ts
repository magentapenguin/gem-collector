import { SpriteCrewAssetAndOutlined } from "@kaplayjs/crew";
import { k } from "./index";

export const objs: SpriteCrewAssetAndOutlined[] = [
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