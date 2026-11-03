import { Actor, ActorArgs, CollisionType, Vector } from "excalibur";
import { Player } from "./player";

export type BugConfig = ActorArgs & {
    speed: number; 
};

export abstract class Bug extends Actor {
    protected speed: number;
    private player: Player | null = null;

    constructor(config: BugConfig) {
        super({
            collisionType: CollisionType.Active,
            ...config
        });
        this.speed = config.speed;
    }

    protected getPlayer(): Player | null {
        if (this.player && !this.player.isKilled()) {
            return this.player;
        }
        const found = this.scene?.actors.find(a => a instanceof Player);
        this.player = (found as Player | undefined) ?? null;
        return this.player;
    }

    protected moveToward(point: Vector): void {
        const direction = point.sub(this.pos);
        if (direction.magnitude > 1) {
            this.vel = direction.normalize().scale(this.speed);
        } else {
            this.vel = Vector.Zero;
        }
    }

    protected stop(): void {
        this.vel = Vector.Zero;
    }
}