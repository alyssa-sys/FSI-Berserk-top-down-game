import { Actor, Circle, Collider, Color, CollisionType, Engine, GraphicsGroup, Ray, Vector, vec } from "excalibur";
import { Player } from "./player";

export class BugShot extends Actor {
    public static readonly SPEED: number = 260; 
    private direction: Vector;
    private lastPos: Vector;

    constructor(pos: Vector, direction: Vector) {
        super({
            name: 'BugShot',
            pos: pos,
            width: 12,
            height: 12,
            collisionType: CollisionType.Passive
        });
        this.direction = direction;
        this.lastPos = pos.clone();
    }

    override onInitialize(): void {
        this.addTag('enemy');

        const glow = new Circle({ radius: 10, color: Color.fromRGB(217, 70, 239, 0.35) });
        const core = new Circle({ radius: 6, color: Color.fromHex('#d946ef') });
        this.graphics.use(new GraphicsGroup({
            members: [
                { graphic: glow, offset: vec(0, 0) },
                { graphic: core, offset: vec(4, 4) }
            ]
        }));

        this.vel = this.direction.normalize().scale(BugShot.SPEED);
        this.actions.delay(3000).die();
    }

    override onPostUpdate(engine: Engine): void {
        const travelled = this.pos.sub(this.lastPos);
        if (travelled.magnitude > 0) {
            const hits = this.scene?.physics.rayCast(
                new Ray(this.lastPos, travelled.normalize()),
                {
                    maxDistance: travelled.magnitude + 6,
                    searchAllColliders: true,
                    filter: hit => hit.body.collisionType === CollisionType.Fixed
                }
            );
            if (hits && hits.length > 0) {
                this.kill();
                return;
            }
        }
        this.lastPos = this.pos.clone();

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