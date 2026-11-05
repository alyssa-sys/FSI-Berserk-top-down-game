import { Actor, Circle, Color, CollisionType, Vector } from "excalibur";

export class Explosion extends Actor {
    constructor(pos: Vector) {
        super({
            name: 'Explosion',
            pos: pos,
            radius: 40,
            collisionType: CollisionType.Passive,
        });
    }

    override onInitialize(): void {
        this.addTag('enemy');
        this.graphics.use(new Circle({ radius: 40, color: Color.fromHex('#ff6b1a')}));
        this.actions.fade(0, 300).die();
    }
}