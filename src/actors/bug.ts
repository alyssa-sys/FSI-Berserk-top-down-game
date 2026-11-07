import { Actor, ActorArgs, Collider, CollisionType, Engine, Vector } from "excalibur";
import { Player } from "./player";
import { HeartPickup } from "./heart_pickup";
import { ScoreManager } from "../managers/score_manager";
import { GlitchFx, GlitchOptions } from "./glitchfx";

export type BugConfig = ActorArgs & {
    speed: number; 
    hp: number;
};

export abstract class Bug extends Actor {
    protected speed: number;
    protected hp: number;
    private player: Player | null = null;
    protected glitch: GlitchFx | null = null;
    private moving: boolean = false;
    private lastPos: Vector = Vector.Zero;
    private stuckTime: number = 0;
    private detourTime: number = 0;
    private detourSide: number = 1;

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
        this.glitch?.pulse(250);
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
        ScoreManager.getInstance().addPoints(2);

        const drop_chance = Math.random();
        if(drop_chance >= 0.80){
            const heart_drop = new HeartPickup(this.pos.clone());
            this.scene?.add(heart_drop);
        }
    }

    protected setupGlitch(options: GlitchOptions): void {
        this.glitch = new GlitchFx(options);
        this.graphics.use(this.glitch.graphic);
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
        const toTarget = point.sub(this.pos);
        if (toTarget.magnitude <= 1) {
            this.vel = Vector.Zero;
            this.moving = false;
            return;
        }

        let direction = toTarget.normalize();
        if (this.detourTime > 0) {
            direction = direction.rotate(this.detourSide * Math.PI / 2);
        }
        this.vel = direction.scale(this.speed);
        this.moving = true;
    }

    protected stop(): void {
        this.vel = Vector.Zero;
        this.moving = true;
    }

    override onPostUpdate(_engine: Engine, elapsedMs: number): void {
        this.glitch?.update(elapsedMs);
       if (this.detourTime > 0) {
        this.detourTime -= elapsedMs;
       }

       const moved = this.pos.distance(this.lastPos);
       const expected = this.speed * elapsedMs / 1000;
       this.lastPos = this.pos.clone();

       if (this.moving && this.detourTime <= 0 && moved < expected * 0.3) {
        this.stuckTime += elapsedMs;
        if (this.stuckTime >= 250) {
            this.stuckTime = 0;
            this.detourSide = Math.random() < 0.5 ? 1 : -1;
            this.detourTime = (100 / this.speed) * 1000;
        }
       } else if  (this.detourTime <= 0) {
        this.stuckTime = 0;
       }
    }
}