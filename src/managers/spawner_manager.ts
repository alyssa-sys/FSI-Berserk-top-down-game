import { Scene, Timer, Vector } from "excalibur";
import { Virus } from "../actors/virus";
import { BigBug } from "../actors/bigbug";
import { SmallBug } from "../actors/smallbug";

export class SpawnerManager {
    private scene: Scene;
    private doorPositions: Vector[];
    private virusTimer!: Timer;
    private bugTimer!: Timer;

    constructor(
        scene: Scene,
        doorPositions: Vector[],
        virusIntervalMs: number = 5000,
        bugIntervalMs: number = 7000
    ){
        this.scene = scene;
        this.doorPositions = doorPositions;

        // timer dos virus
        this.virusTimer = new Timer({
            interval: virusIntervalMs,
            repeats: true,
            fcn: () => this.spawnVirus()
        });

        // timer dos bugs
        this.bugTimer = new Timer({
            interval: bugIntervalMs,
            repeats: true,
            fcn: () => this.spawnRandomBug()
        });

        this.scene.add(this.virusTimer);
        this.scene.add(this.bugTimer);
    }

    public start(): void {
        this.spawnVirus(); // Primeiro vírus ao iniciar
        this.virusTimer.start();
        this.bugTimer.start();
    }

    public stop(): void {
        if (this.virusTimer && this.virusTimer.isRunning) {
            this.virusTimer.stop();
        }
        if (this.virusTimer && this.virusTimer.isRunning) {
            this.virusTimer.stop();
        }
    }
    public spawnVirus(): void {
        const spawnPoint = this.getRandomDoorPosition();
        if (spawnPoint) {
            this.scene.add(new Virus(spawnPoint));
        }
    }

    // Sorteia se o bug será BigBug ou SmallBug e qual porta ele vai nascer
    public spawnRandomBug(): void {
        const spawnPoint = this.getRandomDoorPosition();
        if (!spawnPoint) return;

        // 50% de chance para BigBug e 50% para SmallBug
        const isBigBug = Math.random() < 0.5;

        if (isBigBug) {
            this.scene.add(new BigBug(spawnPoint));
        } else {
            this.scene.add(new SmallBug(spawnPoint));
        }
    }

    private getRandomDoorPosition(): Vector | null {
        if (this.doorPositions.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.doorPositions.length);
        return this.doorPositions[randomIndex];
    }
}