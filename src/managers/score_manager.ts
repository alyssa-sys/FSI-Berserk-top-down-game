import { Label, Font, Color, TextAlign, vec } from "excalibur";

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
        this.score = 0; // Reinicia a pontuação ao iniciar a fase
        this.scoreLabel = new Label({
            text: `SCORE: ${this.score}`,
            pos: vec(screenWidth - 40, 20),
            font: new Font({
                size: 20,
                color: Color.White,
                textAlign: TextAlign.Right
            })
        });
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