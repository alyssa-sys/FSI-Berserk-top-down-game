import { ScreenElement, Label, Font, Color, TextAlign, vec } from "excalibur";

export class ScoreManager {
    private score: number = 0;
    private scoreLabel: Label;

    constructor(screenWidth: number) {
        this.scoreLabel = new Label({
            text: `SCORE: ${this.score}`,
            pos: vec(screenWidth - 40, 20),
            font: new Font({
                size: 20,
                color: Color.White,
                textAlign: TextAlign.Right
            })
        });
    }


    public getLabel(): Label {
        return this.scoreLabel;
    }

    public addPoints(points: number): void {
        this.score += points;
        this.scoreLabel.text = `SCORE: ${this.score}`;
    }

    public getScore(): number {
        return this.score;
    }
}