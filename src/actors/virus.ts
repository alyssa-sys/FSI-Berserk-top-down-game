import { Actor, Vector, Color, Rectangle, Engine, CollisionType, Collider, CollisionContact, Side, Canvas } from "excalibur";
import { Bug } from "./bug"
import { SubFolder } from "../actors/subfolder";

export class Virus extends Bug {
    private target: Actor | null = null;
    private healthBar: Actor | null = null;
    

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

    override update(engine: Engine, delta: number): void {
        super.update(engine, delta); // Importante para manter o ciclo de vida padrão do Actor

        const currentScene = engine.currentScene as any;

        // logica pra encontrar e perseguir a subpasta ativa mais próxima
        if (currentScene && currentScene.subFolders && currentScene.subFolders.length > 0) {
            // Filtra apenas as pastas que ainda estão ativas/vivas
            const activeFolders = currentScene.subFolders.filter((f: SubFolder) => !f.isKilled());

            if (activeFolders.length > 0) {
                // se não tem alvo ou o alvo atual morreu, acha a subpasta mais próxima
                if (!this.target || this.target.isKilled()) {
                    let closestFolder: Actor | null = null;
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

        // Se houver um alvo válido, move-se em direção a ele
        if (this.target) {
            const direction = this.target.pos.sub(this.pos);
            const distance = direction.distance();

            if (distance > 2) {
                // Normaliza o vetor e multiplica pela velocidade para marchar até a pasta
                this.vel = direction.normalize().scale(this.speed);
            } else {
                this.vel = Vector.Zero;
            }
        } else {
            // Se não houver nenhuma subpasta no mapa, ele fica parado
            this.vel = Vector.Zero;
        }
    }
}