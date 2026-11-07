import { Engine, Scene, SceneActivationContext, ScreenElement, vec, Color } from "excalibur";
import { Player } from "../actors/player";
import { SubFolder } from "../actors/subfolder";
import { BigBug } from "../actors/bigbug";
import { SmallBug } from "../actors/smallbug";
import { ScoreManager } from "../managers/score_manager";
import { SpawnerManager } from "../managers/spawner_manager";
import { MapBuilder } from "../utils/map_builder";

export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];
    public scoreManager!: ScoreManager;
    private spawnerManager!: SpawnerManager;
    private hearts: ScreenElement[] = [];
    private player!: Player;

    override onInitialize(engine: Engine): void {
        const w = 800;
        const h = 600;
        const thickness = 32;

        // constroi mapa e portas
        const doorSides = MapBuilder.getRandomDoorSides(3);
        const doorPositions = MapBuilder.buildMapWithDoors(this, w, h, thickness, doorSides);

        // inicializar ScoreManager
        this.scoreManager = new ScoreManager(w);
        this.add(this.scoreManager.getLabel());

        // inicializar SpawnerManager (Vírus a cada 30s)
        this.spawnerManager = new SpawnerManager(this, doorPositions);
        this.spawnerManager.start();

        // adicionar Player
        this.player = new Player();
        this.player.pos = vec(w / 2, (h / 2) + 100);
        this.add(this.player);

        // corações de Vida
        for (let i = 0; i < 3; i++) {
            const heart = new ScreenElement({
                pos: vec(40 + i * 40, 30),
                width: 30,
                height: 30,
                color: Color.Red
            });
            this.hearts.push(heart);
            this.add(heart);
        }

        // subpastas
        const folder1 = new SubFolder('as_fotos_da_festa_ficaram_otimas', vec((w / 2) - 110, (h / 2) - 80));
        const folder2 = new SubFolder('trabalho_fsi_final_agora_vai_prometo_', vec((w / 2) + 110, (h / 2) - 80));
        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);

        // bugs de teste
        this.add(new BigBug(vec(w / 2, 90)));
        this.add(new SmallBug(vec(100, 100)));
        this.add(new SmallBug(vec(w - 100, 100)));
    }

    override onDeactivate(_context: SceneActivationContext): void {
        if (this.spawnerManager) {
            this.spawnerManager.stop();
        }
    }

    override onPreUpdate(_engine: Engine, _elapsedMs: number): void {
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].graphics.opacity = (i < this.player.getHp()) ? 1 : 0;
        }
    }
}