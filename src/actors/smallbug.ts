import { Collider, Vector} from "excalibur";
import { Bug} from "./bug";
import { Explosion } from "./explosion";
import { Player } from "./player";
import { Resources } from "../config/resources";

export class SmallBug extends Bug {
    constructor(pos: Vector) {
        super({
            name: 'SmallBug',
            pos: pos,
            width: 20,
            height: 20,
            speed: 120,
            hp: 2
        });
    }

    override onInitialize(): void {
        this.setupGlitch({
            image: Resources.SmallBug,
            frameSize: 32,
            shapeCount: 3
        });
    }

    override onPreUpdate(): void {
        const player = this.getPlayer();
        if (player) {
            this.moveToward(player.pos);
            this.glitch?.setIntensity(1 - this.pos.distance(player.pos) / 160);
        } else {
            this.stop();
        }
    }

    override onCollisionStart(self: Collider, other: Collider): void {
        super.onCollisionStart(self, other);
        if (other.owner instanceof Player) {
            this.explode();
        }
    }

    private explode(): void {
        if (this.isKilled()) return;
        this.scene?.add(new Explosion(this.pos.clone()));
        this.kill();
    }
}