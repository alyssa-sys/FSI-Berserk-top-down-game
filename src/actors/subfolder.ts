import { Actor, Vector, Rectangle, Color, CollisionType, Canvas, Engine, Text, Font, TextAlign } from "excalibur";

export class SubFolder extends Actor {
    public folderName: string;
    public isInfected: boolean = false;
    public infectionLevel: number = 0;  // de 0 a 100%
    private healthBar: Actor | null = null;
    private rectGraphic: Rectangle;

    constructor(name: string, pos: Vector) {
        super({
            name: `SubFolder_${name}`,
            pos: pos,
            width: 64,
            height: 64,
            collisionType: CollisionType.Fixed // estática no cenario bloqueando colisoes
        });
        this.folderName = name;

        // Guarda a referencia da pasta pra atualizar a cor progressivamente
        this.rectGraphic = new Rectangle({
            width: 64,
            height: 64,
            color: Color.fromHex('#4d7b62')
        });

    }

    override onInitialize(_engine: Engine): void {
        // Visual temporario da pasta
        this.graphics.use(this.rectGraphic);

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

        // Cria o rotulo da pasta (o nome embaixo dela)
        const labelText = new Text({
            text: this.folderName,
            color: Color.White,
            font: new Font({
                size: 12,
                texAlign: TextAlign.Center
            }),
        });

        const labelActor = new Actor({
            pos: new Vector(0, 52) // posiciona o nome abaixo do quadro
        });

        labelActor.graphics.use(labelText);
        labelActor.graphics.current.origin = Vector.Half;

        this.addChild(labelActor);
    }

    // Função auxiliar para quebrar texto em linhas sem cortar palavras
    private wrapTextByWords(text: string, maxCharsPerLine: number): string {
        const words = text.split(' ');
        let currentLine = '';
        const lines: string[] = [];

        for (const word of words) {
            if ((currentLine + word).length > maxCharsPerLine) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }
        if (currentLine) lines.push(currentLine.trim());

        return lines.join('\n');
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
            // Fica vermelha quando totalmente corrompida
            this.updateFolderColor();
        
    }

    private updateFolderColor(): void {
        const health = Math.max(0, 100 - this.infectionLevel); // Vida de 100 a 0
        let r = 0, g = 0, b = 0;

        if (health >= 50) {
            // De 100% a 50%: Transição do Verde (#4d7b62 -> RGB: 77, 123, 98) para Amarelo (#f1c40f -> RGB: 241, 196, 15)
            const t = (100 - health) / 50; // t vai de 0 (em 100%) a 1 (em 50%)
            r = Math.round(77 + (241 - 77) * t);
            g = Math.round(123 + (196 - 123) * t);
            b = Math.round(98 + (15 - 98) * t);
        } else {
            // De 50% a 0%: Transição do Amarelo (#f1c40f -> RGB: 241, 196, 15) para Vermelho (#e74c3c -> RGB: 231, 76, 60)
            const t = (50 - health) / 50; // t vai de 0 (em 50%) a 1 (em 0%)
            r = Math.round(241 + (231 - 241) * t);
            g = Math.round(196 + (76 - 196) * t);
            b = Math.round(15 + (60 - 15) * t);
        }

        // atualiza a cor do grafico exibido
        this.rectGraphic.color = Color.fromRGB(r, g, b);
    }

    // Método pra corromper pastas quando o vírus chega nelas
    public infect(amount: number = 5): void {
        if (this.isInfected) return;

        this.infectionLevel += amount;
        if (this.infectionLevel >= 100) {
            this.infectionLevel = 100;
            this.isInfected = true;
        }

        this.updateFolderColor();
    }
}