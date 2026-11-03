import { Actor, Vector, Color, Rectangle, Engine } from "excalibur";
import { SubFolder } from "../actors/subfolder";

export class Virus extends Actor {
    private target: Actor | null = null;
    private speed: number = 70;  // velocidade de perseguição do virus

    constructor(pos: Vector) {
        super({
            pos: pos,
            width: 24,
            height: 24,
        });
    }

    override onInitialize(engine: Engine): void {
        // visual temporario do virus
        this.graphics.use(new Rectangle({
            width: 24,
            height: 24,
            color: Color.fromHex('#ff4d4d')
        }));
    }

    override update(engine: Engine, delta: number): void {
        super.update(engine, delta); // Importante para manter o ciclo de vida padrão do Actor

        const currentScene = engine.currentScene as any;

        // garante que temos acesso às subpastas da fase
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