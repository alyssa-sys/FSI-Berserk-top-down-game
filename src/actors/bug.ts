import { Actor, ActorArgs, Collider, CollisionType, Engine, Vector } from "excalibur";
import { Player } from "./player";
import { HeartPickup } from "./pickups/heart_pickup";
import { EnemyGroup } from "../config/collision-group";
import { RocketExplosion } from './rocket-explosion';
import { RocketPickup } from "./pickups/rocket_pickup";
import { BeamPickup } from "./pickups/beam_pickup";

export type BugConfig = ActorArgs & {
    speed: number; 
    hp: number;
};

export abstract class Bug extends Actor {
    protected speed: number;
    protected hp: number;
    private player: Player | null = null;
    private moving: boolean = false;
    private lastPos: Vector = Vector.Zero;
    private stuckTime: number = 0;
    private detourTime: number = 0;
    private detourSide: number = 1;

    constructor(config: BugConfig) {
        super({
            collisionType: CollisionType.Active,
            ...config,
            collisionGroup: EnemyGroup
        });
        this.addTag('enemy');
        this.speed = config.speed;
        this.hp = config.hp;
    }

    override onCollisionStart(_self: Collider, other: Collider): void {
        // detectar se o inimigo foi atingido (hitbox)
         const hitbox = other.owner;
         if (!hitbox || hitbox.isKilled()) 
            return;

        // bala comum
        if (hitbox.name === 'Bullet') {
            hitbox.kill();     
            this.takeDamage(1);
        }
        // lança mísseis
        else if (hitbox instanceof RocketExplosion) {
            if (hitbox.hitEnemy(this)) {
                this.takeDamage(2);
            } 
        }
         // raio laser
        if (hitbox.name === 'Beam') {   
            this.takeDamage(0.2);
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
        const drop_chance = Math.random(); // resultado da chance de drop do coração e armas
        if(drop_chance >= 0.85){
            const heart_drop = new HeartPickup(this.pos.clone());
            this.scene?.add(heart_drop);
        }
        else if(drop_chance >= 0.60){
            const rocket_drop = new RocketPickup(this.pos.clone());
            this.scene?.add(rocket_drop);
        }
         else if(drop_chance >= 0.40){
            const beam_pickup = new BeamPickup(this.pos.clone());
            this.scene?.add(beam_pickup);
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