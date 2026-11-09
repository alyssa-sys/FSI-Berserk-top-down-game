import { Actor, Vector, Rectangle, Color, CollisionType, Canvas, Engine, Sprite } from "excalibur";
import { StructureGroup } from "../config/collision-group";
import { Resources } from "../config/resources";

export class SubFolder extends Actor {
    public folderName: string;
    public isInfected: boolean = false;
    public infectionLevel: number = 0;  // de 0 a 100%
    private healthBar: Actor | null = null;

    private folderSprites: { [key: number]: Sprite } = {};

    constructor(name: string, pos: Vector) {
        super({
            name: `SubFolder_${name}`,
            pos: pos,
            width: 64,
            height: 64,
            collisionType: CollisionType.Fixed, // estática no cenario bloqueando colisoes
            collisionGroup: StructureGroup 
        });
        this.addTag('folder_col'); // hiago: tag de colisão com a bala
        this.folderName = name;

    }

    override onInitialize(_engine: Engine): void {
        // 1. Carrega e redimensiona os sprites para o tamanho do ator (64x64)
        this.folderSprites[100] = Resources.Folder100.toSprite();
        this.folderSprites[75]  = Resources.Folder75.toSprite();
        this.folderSprites[50]  = Resources.Folder50.toSprite();
        this.folderSprites[25]  = Resources.Folder25.toSprite();
        this.folderSprites[0]   = Resources.Folder0.toSprite();

        Object.values(this.folderSprites).forEach(sprite => {
            sprite.destSize = { width: 64, height: 64 };
        });

        // 2. Define o sprite inicial de 100% de vida
        this.updateFolderSprite();

        // 3. Barra de vida acima da pasta
        const barWidth = 64;
        const barHeight = 6;

        this.healthBar = new Actor({
            pos: new Vector(0, -42), // posiciona acima da pasta de 64 px
            width: barWidth,
            height: barHeight
        });

        //desenho e atualizacao da barra a cada frame
        this.healthBar.onPreUpdate = () => {
            const healthRatio = Math.max(0, (100 - this.infectionLevel) / 100);

            this.healthBar?.graphics.use(
                new Canvas({
                    width: barWidth,
                    height: barHeight,
                    draw: (ctx) => {
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(0, 0, barWidth, barHeight);

                        ctx.fillStyle = '#00ff00';
                        ctx.fillRect(0, 0, barWidth * healthRatio, barHeight);
                    }
                })
            );
        };
        this.addChild(this.healthBar);

        
    }
    // Causa dano contínuo baseado em tempo real
    // 100% de dano em 60.000 ms (1 minuto) -> 100 / 60000 = ~0.001666% por ms
    public infectOverTime(elapsedMs: number): void {
        if (this.isInfected) return;

        const ratePerMs = 100 / 60000; // 100% dividido por 60 segundos (em ms)
        this.infectionLevel += ratePerMs * elapsedMs;

        if (this.infectionLevel >= 100) {
            this.infectionLevel = 100;
            this.isInfected = true;

        }
            // troca o sprite da pasta enquanto está sendo infectada
            this.updateFolderSprite();
        
    }

    private updateFolderSprite(): void {
        const health = Math.max(0, 100 - this.infectionLevel); // Vida restante de 100 a 0%

        if (health > 75) {
            this.graphics.use(this.folderSprites[100]);
        } else if (health > 50) {
            this.graphics.use(this.folderSprites[75]);
        } else if (health > 25) {
            this.graphics.use(this.folderSprites[50]);
        } else if (health > 0) {
            this.graphics.use(this.folderSprites[25]);
        } else {
            this.graphics.use(this.folderSprites[0]);
        }
    }

    // Método pra corromper pastas quando o vírus chega nelas
    public infect(amount: number = 5): void {
        if (this.isInfected) return;

        this.infectionLevel += amount;
        if (this.infectionLevel >= 100) {
            this.infectionLevel = 100;
            this.isInfected = true;
        }

        this.updateFolderSprite();
    }

}

