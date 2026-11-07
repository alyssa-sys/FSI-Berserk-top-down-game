import { Scene, Timer, Vector } from "excalibur";
import { Virus } from "../actors/virus";

export class SpawnerManager {
    private scene: Scene;
    private doorPositions: Vector[];
    private timer!: Timer;

    constructor(scene: Scene, doorPositions: Vector[], intervalMs: number = 5000) {
        this.scene = scene;
        this.doorPositions = doorPositions;

        this.timer = new Timer({
            interval: intervalMs,
            repeats: true,
            fcn: () => this.spawnVirus()
        });

        this.scene.add(this.timer);
    }

    public start(): void {
        this.spawnVirus(); // Primeiro vírus ao iniciar
        this.timer.start();
    }

    public stop(): void {
        if (this.timer && this.timer.isRunning) {
            this.timer.stop();
        }
    }

    public spawnVirus(): void {
        if (this.doorPositions.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.doorPositions.length);
        const spawnPoint = this.doorPositions[randomIndex];
        this.scene.add(new Virus(spawnPoint));
    }
}