import { Engine, Scene, SceneActivationContext, ScreenElement, vec, Color } from "excalibur";
import { Player } from "../actors/player";
import { SubFolder } from "../actors/subfolder";
import { BigBug } from "../actors/bigbug";
import { SmallBug } from "../actors/smallbug";
import { ScoreManager } from "../managers/score_manager";
import { SpawnerManager } from "../managers/spawner_manager";
import { MapBuilder } from "../utils/map_builder";
import { Resources } from "../config/resources";
 

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

        // adiciona o background
        const windowBackground = new ScreenElement({
            pos: vec(0, 0),
            z: -10 // fica atrás de tudo (paredes, player, pastas)
        });
        windowBackground.anchor = vec(0, 0);

        const frameSprite = Resources.WindowFrame.toSprite();
        frameSprite.destSize = {
            width: w,
            height: h
        };
        windowBackground.graphics.use(frameSprite);
        this.add(windowBackground);

        const playX = 175;
        const playY = 110;
        const playW = w - 175 - 35;
        const playH = h - 110 - 35;
        const centerX = playX + playW / 2;
        const centerY = playY + playH / 2;

        // constroi mapa e portas
        const thickness = 32;
        const doorSides = MapBuilder.getRandomDoorSides(3);
        const doorPositions = MapBuilder.buildMapWithDoors(this, w, h, thickness, doorSides);

        // inicializar ScoreManager
        const scoreX = playX + playW - 20;
        const scoreY = playY - 100;

        const scoreLabel = ScoreManager.getInstance().init(scoreX, scoreY);
        scoreLabel.z = 20;
        this.add(scoreLabel);

        // inicializar SpawnerManager (virus a cada 30s)
        this.spawnerManager = new SpawnerManager(this, doorPositions);
        this.spawnerManager.start();

        // adicionar player
        this.player = new Player();
        this.player.pos = vec(centerX, centerY + 50);
        this.player.z = 5; // Garante visibilidade sobre o cenário
        this.add(this.player);

        // corações de Vida
        for (let i = 0; i < 3; i++) {
            const heart = new ScreenElement({
                pos: vec(playX + 30 + i * 35, playY + 25),
                z: 10
            });
            const sprite = Resources.Heart.toSprite();
            sprite.width = 24;
            sprite.height = 24;
            heart.graphics.use(sprite);
            this.hearts.push(heart);
            this.add(heart);
        
        }

        // subpastas
        const folder1 = new SubFolder('as_fotos_da_festa_ficaram_otimas', vec(centerX - 90, centerY - 40));
        const folder2 = new SubFolder('trabalho_fsi_final_agora_vai_prometo_', vec(centerX + 90, centerY - 40));
        folder1.z = 5;
        folder2.z = 5;
        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);

        // bugs de teste
        const bug1 = new BigBug(vec(centerX, centerY - 100));
        const bug2 = new SmallBug(vec(playX + 50, playY + 50));
        const bug3 = new SmallBug(vec(playX + playW - 50, playY + 50));
        bug1.z = 5;
        bug2.z = 5;
        bug3.z = 5;
        this.add(bug1);
        this.add(bug2);
        this.add(bug3);
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
        const todasPastasDestruidas = this.subFolders.length > 0 && 
            this.subFolders.every(folder => folder.isInfected || folder.isKilled());

        if (todasPastasDestruidas) {
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