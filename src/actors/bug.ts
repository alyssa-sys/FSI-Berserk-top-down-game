import { Actor, ActorArgs, Collider, CollisionType, Vector } from "excalibur";
import { Player } from "./player";
import { HeartPickup } from "./heart_pickup";

export type BugConfig = ActorArgs & {
    speed: number; 
    hp: number;
};

export abstract class Bug extends Actor {
    protected speed: number;
    protected hp: number;
    private player: Player | null = null;

    constructor(config: BugConfig) {
        super({
            collisionType: CollisionType.Active,
            ...config
        });
        this.speed = config.speed;
        this.hp = config.hp;
    }

    override onCollisionStart(_self: Collider, other: Collider): void {
        const bullet = other.owner;
        if (bullet && bullet.name === 'Bullet' && !bullet.isKilled()) {
            bullet.kill();     
            this.takeDamage(1);
        }
    }

    public takeDamage(amount: number = 1): void {
        if (this.isKilled()) return;
        this.hp -= amount;
        this.actions
            .callMethod(() => { this.graphics.opacity = 0.3; })
            .delay(80)
            .callMethod(() => { this.graphics.opacity = 1; });

        if (this.hp <= 0) {
            this.onDeath();
            this.kill();
        }
    }

    protected onDeath(): void {
        const drop_chance = Math.random(); // chance de drop do coração
        if(drop_chance >= 0.80){
            const heart_drop = new HeartPickup(this.pos.clone());
            this.scene?.add(heart_drop);
        }
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