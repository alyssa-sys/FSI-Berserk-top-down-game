import { Label, Font, Color, TextAlign, vec } from "excalibur";
import { SpriteSheet, SpriteFont } from "excalibur";
import { Resources } from "../config/resources";

export class ScoreManager {
    private static instance: ScoreManager | null = null;
    private score: number = 0;
    private scoreLabel!: Label;

    // Construtor privado para garantir instância única
    private constructor() {}

    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    public init(screenWidth: number): Label {
        const fontSheet = SpriteSheet.fromImageSource({
            image: Resources.BoldFont,
            grid: { rows: 83, columns: 16, spriteWidth: 8, spriteHeight: 16 },
            spacing: {originOffset: { x: 1, y: 1 },  
            margin: { x: 1, y: 1 }
        }
        });
        const spriteFont = new SpriteFont({
            alphabet: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            spriteSheet: fontSheet,
            spacing: 0
        });
        this.score = 0; // Reinicia a pontuação ao iniciar a fase
        this.scoreLabel = new Label({
            text: `SCORE: ${this.score}`,
            pos: vec(screenWidth - 200, 20),
            spriteFont: spriteFont
        });
        this.scoreLabel.scale = vec(2, 2); // aumenta o texto, ajuste a gosto
        return this.scoreLabel;
    }

    public addPoints(points: number): void {
        this.score += points;
        if (this.scoreLabel) {
            this.scoreLabel.text = `SCORE: ${this.score}`;
        }
    }

    public getScore(): number {
        return this.score;
    }

    public reset(): void {
        this.score = 0;
        if (this.scoreLabel) {
            this.scoreLabel.text = `SCORE: 0`;
        }
    }
}