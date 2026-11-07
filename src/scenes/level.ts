import { Engine, Scene, SceneActivationContext, ScreenElement, vec, Color } from "excalibur";
import { Player } from "../actors/player";
import { SubFolder } from "../actors/subfolder";
import { BigBug } from "../actors/bigbug";
import { SmallBug } from "../actors/smallbug";
import { ScoreManager } from "../managers/score_manager";
import { SpawnerManager } from "../managers/spawner_manager";
import { MapBuilder } from "../utils/map_builder";
// import { Virus } from "../actors/virus";
import { BugSpawner } from "../actors/bugspawner";
// import { HeartPickup } from "../actors/heart_pickup";
 

type WallSide = 'top' | 'bottom' | 'left' | 'right'; 

export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];
    public scoreManager!: ScoreManager;
    private spawnerManager!: SpawnerManager;
    private hearts: ScreenElement[] = [];
    private player!: Player;

    override onActivate(_context: SceneActivationContext<unknown>): void {
        // limpa todos os atores anteriores quando reinicia o jogo
        this.clear();
        this.subFolders = [];
        this.hearts = [];

        const engine = this.engine;
        const w = engine.drawWidth;
        const h = engine.drawHeight;
        const thickness = 32;

        // constroi mapa e portas
        const doorSides = MapBuilder.getRandomDoorSides(3);
        const doorPositions = MapBuilder.buildMapWithDoors(this, w, h, thickness, doorSides);

        // inicializar ScoreManager
        const scoreLabel = ScoreManager.getInstance().init(w);
        this.add(scoreLabel);

        // inicializar SpawnerManager (virus a cada 30s)
        this.spawnerManager = new SpawnerManager(this, doorPositions);
        this.spawnerManager.start();

        // adicionar player
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
        if (this.player && !this.player.isKilled()) {
            for (let i = 0; i < this.hearts.length; i++) {
                this.hearts[i].graphics.opacity = (i < this.player.getHp()) ? 1 : 0;
            }
        }
        
        // checa gamen over pelas pastas
        const pastaDestruida = this.subFolders.some(folder => folder.isInfected || folder.isKilled());

        if (pastaDestruida) {
            this.triggerGameOver();

        }
    }

    private triggerGameOver(): void {
        //para o spawn de novos inimigos
        if (this.spawnerManager) {
            this.spawnerManager.stop();
        }

        // vai pra tela de game over
        this.engine.goToScene('gameover');
    }
}