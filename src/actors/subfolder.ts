import { Actor, Vector, Rectangle, Color, CollisionType } from "excalibur";

export class SubFolder extends Actor {
    public folderName: string;
    public isInfected: boolean = false;
    public infectionLevel: number = 0;  // de 0 a 100%

    constructor(name: string, pos: Vector) {
        super({
            name: `SubFolder_${name}`,
            pos: pos,
            width: 64,
            height: 64,
            collisionType: CollisionType.Fixed // estática no cenario bloqueando colisoes
        });
        this.folderName = name;
    }

    override onInitialize(): void {
        // Visual temporario da pasta
        this.graphics.use(new Rectangle({
            width: 64,
            height: 64,
            color: Color.fromHex('#4d7b62')
        }));
    }

    // Método pra corromper pastas quando o vírus chega nelas
    public infect(amount: number = 5): void {
        if (this.isInfected) return;

        this.infectionLevel += amount;
        console.log(`Pasta ${this.folderName} corrompida em ${this.infectionLevel}%`);

        if (this.infectionLevel >= 100) {
            this.isInfected = true;

            // fica vermelha quando totalmente infectada
            this.graphics.use(new Rectangle({
                width: 64,
                height: 64,
                color: Color.Red
            }));
        }
    }
}