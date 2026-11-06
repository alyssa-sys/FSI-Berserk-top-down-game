import { Color, Engine, Rectangle, Vector, vec } from "excalibur";
import { Bug } from "./bug";
import { BugShot } from "./bugshot";
import { SmallBug } from "./smallbug";

export class BigBug extends Bug {
    private readonly keepDistance: number = 220;   
    private readonly shootRange: number = 400;     
    private readonly shootCooldown: number = 1800; 
    private shootTimer: number = 1000;             

    constructor(pos: Vector) {
        super({
            name: 'BigBug',
            pos: pos,
            width: 56,
            height: 56,
            speed: 55,
            hp: 10
        });
    }

    override onInitialize(): void {
        this.addTag('enemy'); 
        this.graphics.use(new Rectangle({
            width: 56,
            height: 56,
            color: Color.fromHex('#9d4edd')
        }));
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        const player = this.getPlayer();
        if (!player) {
            this.stop();
            return;
        }

        const distance = this.pos.distance(player.pos);
        if (distance > this.keepDistance) {
            this.moveToward(player.pos);
        } else {
            this.stop();
        }

        this.shootTimer -= elapsedMs;
        if (distance <= this.shootRange && this.shootTimer <= 0) {
            this.shoot(player.pos);
            this.shootTimer = this.shootCooldown;
        }
    }

    private shoot(target: Vector): void {
        const direction = target.sub(this.pos);
        this.scene?.add(new BugShot(this.pos.clone(), direction));
    }

    protected override onDeath(): void {
        super.onDeath();
        const scene = this.scene;
        if (!scene) return;
        scene.add(new SmallBug(this.pos.add(vec(-24, 0))));
        scene.add(new SmallBug(this.pos.add(vec(24, 0))));
    }
}