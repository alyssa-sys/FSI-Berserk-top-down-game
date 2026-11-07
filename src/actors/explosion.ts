import { Actor, Circle, Color, CollisionType, Engine, GraphicsGroup, Vector, vec } from "excalibur";

// Explosão do Bug pequeno.
export class Explosion extends Actor {
    private readonly duration: number = 300; // ms até sumir
    private age: number = 0;
    private visual!: GraphicsGroup;

    constructor(pos: Vector) {
        super({
            name: 'Explosion',
            pos: pos,
            radius: 40, 
            collisionType: CollisionType.Passive
        });
    }

    override onInitialize(): void {
        this.addTag('enemy');

        const outer = new Circle({ radius: 40, color: Color.fromRGB(255, 107, 26, 0.85) });
        const core = new Circle({ radius: 22, color: Color.fromHex('#ffe066') });
        this.visual = new GraphicsGroup({
            members: [
                { graphic: outer, offset: vec(0, 0) },
                { graphic: core, offset: vec(18, 18) }
            ]
        });
        this.graphics.use(this.visual);
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        this.age += elapsedMs;

        const grow = Math.min(this.age / 120, 1);
        const size = 0.4 + 0.6 * (1 - (1 - grow) * (1 - grow));
        this.visual.scale = vec(size, size);
        this.graphics.opacity = 1 - Math.min(this.age / this.duration, 1);

        if (this.age >= this.duration) {
            this.kill();
        }
    }
}