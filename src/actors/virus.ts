import { Actor, Vector, Engine, Collider, Animation, AnimationStrategy } from "excalibur";
import { Bug } from "./bug"
import { SubFolder } from "../actors/subfolder";
import { ScoreManager } from "../managers/score_manager";
import { Resources } from "../config/resources";

export class Virus extends Bug {
    private target: Actor | null = null;
    private healthBar: Actor | null = null;
    private touchingFolder: SubFolder | null = null;
    

    constructor(pos: Vector) {
        super({ 
            name: 'Virus',
            pos: pos,
            width: 56,
            height: 56,
            speed: 70,
            // collisionType: CollisionType.Active // Permite que ele colida com paredes e subpastas
            hp: 3
        });
    }

    override onInitialize(engine: Engine): void {
        // visual temporario do virus
        this.addTag('enemy'); // tag de inimigo para causar dano ao player
        // frames de animacao do virus
        const frames = [
            { graphic: Resources.Virus1.toSprite(), duration: 100 },
            { graphic: Resources.Virus2.toSprite(), duration: 100 },
            { graphic: Resources.Virus3.toSprite(), duration: 100 },
            { graphic: Resources.Virus4.toSprite(), duration: 100 },
            { graphic: Resources.Virus5.toSprite(), duration: 100 },
            { graphic: Resources.Virus6.toSprite(), duration: 100 }
        ];

        // Ajusta o tamanho exibido de cada frame para caber na hitbox (32x32)
        frames.forEach(frame => {
            frame.graphic.destSize = { width: 56, height: 56 };
        });

        // 2. Configura a animação com estratégia PingPong (1->6 e 6->1)
        const virusAnimation = new Animation({
            frames: frames,
            strategy: AnimationStrategy.PingPong
        });

        this.graphics.use(virusAnimation);

    //     // Barra de vida
    //     const barWidth = 24;
    //     const barHeight = 4;

    //     this.healthBar = new Actor({
    //         pos: new Vector(0, -18), // posicionamento da barra de vida um pouco acima do virus
    //         width: barWidth,
    //         height: barHeight
    //     });

    //     // desenho e atualizacao dinamica da barra de vida a cada frame
    //     this.healthBar.onPreUpdate = () => {
    //         const hpRatio = Math.max(0, this.hp / 3); // calcula a proporção da vida (0 a 1)

    //         this.healthBar?.graphics.use(
    //             new Canvas({
    //                 width: barWidth,
    //                 height: barHeight,
    //                 draw: (ctx) => {
    //                     // fundo da barra (vermelho para vida perdida)
    //                     ctx.fillStyle = '#ff0000';
    //                     ctx.fillRect(0, 0, barWidth, barHeight);

    //                     // vida atual (verde)
    //                     ctx.fillStyle = '#00ff00'
    //                     ctx.fillRect(0, 0, barWidth * hpRatio, barHeight);
    //                 }
    //             })
    //         );
    //     };
    //     // adiciona barra como filha para acompanhar o movimento do virus
    //     this.addChild(this.healthBar);
    }

    protected override onDeath(): void {
        ScoreManager.getInstance().addPoints(1);
    
    }

    // Detecta quando encosta na pasta
    override onCollisionStart(_self: Collider, other: Collider): void {
        super.onCollisionStart(_self, other);

        if (other.owner instanceof SubFolder) {
            this.touchingFolder = other.owner;
        }
    }

    // Detecta quando se afasta da pasta
    override onCollisionEnd(_self: Collider, other: Collider): void {
        if (other.owner instanceof SubFolder && other.owner === this.touchingFolder) {
            this.touchingFolder = null;
        }
    }

    override update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        const currentScene = engine.currentScene as any;

        // Se está encostado em uma pasta ativa, causa infecção continuamente
        if (this.touchingFolder && !this.touchingFolder.isKilled() && !this.touchingFolder.isInfected) {
            this.stop();
            this.touchingFolder.infectOverTime(delta);
            return;
        }

        // Se a pasta em que estava encostado foi destruída/totalmente infectada
        if (this.touchingFolder && (this.touchingFolder.isKilled() || this.touchingFolder.isInfected)) {
            this.touchingFolder = null;
        }

        if (currentScene && currentScene.subFolders && currentScene.subFolders.length > 0) {
            const activeFolders = currentScene.subFolders.filter((f: SubFolder) => !f.isKilled() && !f.isInfected);

            if (activeFolders.length > 0) {
                if (!this.target || this.target.isKilled() || (this.target instanceof SubFolder && this.target.isInfected)) {
                    let closestFolder: SubFolder | null = null;
                    let minDistance = Infinity;

                    for (const folder of activeFolders) {
                        const dist = this.pos.distance(folder.pos);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestFolder = folder;
                        }
                    }
                    this.target = closestFolder;
                }
            } else {
                this.target = null;
            }
        }

        // Se houver um alvo válido, move-se em direção ou causa dano se estiver encostado
        if (this.target) {
            this.moveToward(this.target.pos);
        } else {
            this.stop();
        }
    
    }
}