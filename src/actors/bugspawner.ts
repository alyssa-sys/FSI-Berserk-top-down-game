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
    private started: boolean = false; 
    private timer: number = 5000; 

    constructor(spawnPoints: Vector[]) {
        super({ name: 'BugSpawner' });
        this.spawnPoints = spawnPoints;
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        if (!this.started) {
            this.started = true;
            this.spawnFirstWave();
        }

        this.timer -= elapsedMs;
        if (this.timer > 0) return;

        this.timer = this.spawnInterval;
        this.spawn();
    }

    private spawnFirstWave(): void {
        const usedPoints: Vector[] = [];
        for (const big of [true, false, false]) {
            const point = this.pickPoint(usedPoints) ?? this.pickPoint();
            if (!point) continue;
            usedPoints.push(point);
            this.scene?.add(big ? new BigBug(point.clone()) : new SmallBug(point.clone()));
        }
    }

    private spawn(): void {
        if (!this.scene) return;

        const alive = this.scene.actors.filter(a => a instanceof Bug).length;
        if (alive >= this.maxBugs) return;

        const point = this.pickPoint();
        if (!point) return;

        this.scene.add(Math.random() < this.bigBugChance ? new BigBug(point.clone()) : new SmallBug(point.clone()));
    }

    private pickPoint(exclude: Vector[] = []): Vector | null {
        const player = this.scene?.actors.find(a => a instanceof Player);
        const validPoints = this.spawnPoints.filter(p =>
            !exclude.includes(p) && (!player || p.distance(player.pos) >= this.minSpawnDistance)
        );
        if (validPoints.length === 0) return null;
        return validPoints[Math.floor(Math.random() * validPoints.length)];
    }
}