import { Actor, Circle, Collider, Color, CollisionType, Engine, Vector } from "excalibur";
import { Player } from "./player";

export class BugShot extends Actor {
    private direction: Vector;
    constructor(pos: Vector, direction: Vector) {
        super({
            name: 'BugShot',
            pos: pos,
            width: 12,
            height: 12,
            collisionType: CollisionType.Passive
        });
        this.direction = direction;
        
    }

    override onInitialize(): void {
        this.addTag('enemy');
        this.graphics.use(new Circle({ radius: 6, color: Color.fromHex('#d946ef')}));
        this.vel = this.direction.normalize().scale(220);
        this.actions.delay(3000).die();
    }

    override onPostUpdate(engine: Engine): void {
        if (this.pos.x < 0 || this.pos.x > engine.drawWidth ||
            this.pos.y < 0 || this.pos.y > engine.drawHeight) {
            this.kill();
        }
    }

    override onCollisionStart(_self: Collider, other: Collider): void {
        if (other.owner instanceof Player) {
            this.kill();
        }               
    }
}