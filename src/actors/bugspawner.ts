import { Actor, Engine, Vector } from "excalibur";
import { Bug } from "./bug";
import { BigBug } from "./bigbug";
import { SmallBug } from "./smallbug";
import { Player } from "./player";

export class BugSpawner extends Actor {
    private readonly spawnInterval: number = 5000;
    private readonly maxBugs: number = 6;
    private readonly bigBugChance: number = 0.3;
    private readonly minSpawnDistance: number = 250;

    private spawnPoints: Vector[];
    private timer: number = 2000;

    constructor(spawnPoints: Vector[]) {
        super({ name: 'BugSpawner' });
        this.spawnPoints = spawnPoints;
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        this.timer -= elapsedMs;
        if (this.timer > 0) return;

        this.timer = this.spawnInterval;
        this.spawn();
    }

    private spawn(): void {
        if (!this.scene || this.spawnPoints.length === 0) return;
        
        // contar bugs vivos
        const alive = this.scene.actors.filter(a => a instanceof Bug).length;
        if (alive >= this.maxBugs) return;

        // usar as portas longe do jogador
        const player = this.scene.actors.find(a => a instanceof Player);
        const validPoints = this.spawnPoints.filter(p => !player || p.distance(player.pos) >= this.minSpawnDistance);
        if (validPoints.length === 0) return;

        // escolher uma porta entre as válidas
        const point = validPoints[Math.floor(Math.random() * validPoints.length)].clone();
        const bug = Math.random() < this.bigBugChance ? new BigBug(point) : new SmallBug(point);
        this.scene.add(bug);
    }
}