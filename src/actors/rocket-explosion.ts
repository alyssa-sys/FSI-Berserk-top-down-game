import { Actor, Circle, Color, CollisionType, Engine, GraphicsGroup, Vector, vec } from "excalibur";

// explosão do míssil
export class RocketExplosion extends Actor {
    private readonly duration: number = 300; // ms até sumir
    private age: number = 0;
    private visual!: GraphicsGroup;
    private hitEnemies = new Set<Actor>();
    public hitEnemy(enemy: Actor): boolean {
        if (this.hitEnemies.has(enemy)) {
            return false;
        }

        this.hitEnemies.add(enemy);
        return true;
    }
    
    constructor(pos: Vector) {
        super({
            name: 'RocketExplosion',
            pos: pos,
            radius: 80, 
            collisionType: CollisionType.Passive
        });
    }

    override onInitialize(): void {
        this.addTag('rocket_explosion');

        const outer = new Circle({ radius: 80, color: Color.fromHex('#e04422') });
        this.visual = new GraphicsGroup({
            members: [
                { graphic: outer, offset: vec(0, 0) }
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