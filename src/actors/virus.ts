import { Actor, Vector, Color, Rectangle, Engine, CollisionType, Collider, CollisionContact, Side, Canvas } from "excalibur";
import { Bug } from "./bug"
import { SubFolder } from "../actors/subfolder";

export class Virus extends Bug {
    private target: Actor | null = null;
    private healthBar: Actor | null = null;
    private touchingFolder: SubFolder | null = null;
    

    constructor(pos: Vector) {
        super({
            name: 'Virus',
            pos: pos,
            width: 24,
            height: 24,
            speed: 70,
            // collisionType: CollisionType.Active // Permite que ele colida com paredes e subpastas
            hp: 3
        });
    }

    override onInitialize(engine: Engine): void {
        // visual temporario do virus
        this.addTag('enemy'); // tag de inimigo para causar dano ao player
        this.graphics.use(new Rectangle({
            width: 24,
            height: 24,
            color: Color.fromHex('#ff4d4d')
        }));

        // Barra de vida
        const barWidth = 24;
        const barHeight = 4;

        this.healthBar = new Actor({
            pos: new Vector(0, -18), // posicionamento da barra de vida um pouco acima do virus
            width: barWidth,
            height: barHeight
        });

        // desenho e atualizacao dinamica da barra de vida a cada frame
        this.healthBar.onPreUpdate = () => {
            const hpRatio = Math.max(0, this.hp / 3); // calcula a proporção da vida (0 a 1)

            this.healthBar?.graphics.use(
                new Canvas({
                    width: barWidth,
                    height: barHeight,
                    draw: (ctx) => {
                        // fundo da barra (vermelho para vida perdida)
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(0, 0, barWidth, barHeight);

                        // vida atual (verde)
                        ctx.fillStyle = '#00ff00'
                        ctx.fillRect(0, 0, barWidth * hpRatio, barHeight);
                    }
                })
            );
        };
        // adiciona barra como filha para acompanhar o movimento do virus
        this.addChild(this.healthBar);
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