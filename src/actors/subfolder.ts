import { Actor, Vector, Rectangle, Color, CollisionType, Canvas, Engine } from "excalibur";

export class SubFolder extends Actor {
    public folderName: string;
    public isInfected: boolean = false;
    public infectionLevel: number = 0;  // de 0 a 100%
    private healthBar: Actor | null = null;

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

        // barra de vida
        const barWidth = 64;
        const barHeight = 6;

        this.healthBar = new Actor({
            pos: new Vector(0, -42), // posiciona acima da pasta de 64 px
            width: barWidth,
            height: barHeight
        });

        //desenho e atualizacao da barra a cada frame
        this.healthBar.onPreUpdate = () => {
            // A vida restante é a porcentagem oposta ao nível de infecção (100% - infectionLevel)
            const healthRatio = Math.max(0, (100 - this.infectionLevel) / 100);

            this.healthBar?.graphics.use(
                new Canvas({
                    width: barWidth,
                    height: barHeight,
                    draw: (ctx) => {
                        //Fundo da barra (vermelho para a parte corrompida)
                        ctx.fillStyle = 'ff0000';
                        ctx.fillRect(0, 0, barWidth * healthRatio, barHeight);

                        // vida atual (verde)
                        ctx.fillStyle = '#00ff00'
                        ctx.fillRect(0, 0, barWidth * healthRatio, barHeight);
                    }
                })
            );
        };
        // adiciona a barra como filho da pasta
        this.addChild(this.healthBar);
    }

    // Método pra corromper pastas quando o vírus chega nelas
    public infect(amount: number = 5): void {
        if (this.isInfected) return;

        this.infectionLevel += amount;
        if (this.infectionLevel > 100) this.infectionLevel = 100;

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