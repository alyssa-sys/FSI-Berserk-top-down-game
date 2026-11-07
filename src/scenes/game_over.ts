import { Scene, Engine, Label, Font, Color, vec, TextAlign, Keys, SceneActivationContext } from "excalibur";
import { ScoreManager } from "../managers/score_manager";

export class GameOverScene extends Scene {
    private scoreLabel!: Label;
    private finalScore: number = 0;

    override onInitialize(_engine: Engine): void {
        const w = _engine.drawWidth;
        const h = _engine.drawHeight;

        const titleLabel = new Label({
            text: "GAME OVER",
            pos: vec(w / 2, h / 3),
            font: new Font({
                size: 48,
                color: Color.Red,
                textAlign: TextAlign.Center
            })
        });
        this.add(titleLabel);

        this.scoreLabel = new Label({
            text: `Pontuação Final: ${this.finalScore}`,
            pos: vec(w / 2, h / 2),
            font: new Font({
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.add(this.scoreLabel);

        const restartLabel = new Label({
            text: "Pressione ESPAÇO ou ENTER para Reiniciar",
            pos: vec(w / 2, (h / 3) * 2),
            font: new Font({
                size: 18,
                color: Color.Gray,
                textAlign: TextAlign.Center
            })
        });
        this.add(restartLabel);
    }

    override onActivate(context: SceneActivationContext<any>): void {
        // Pega o score enviado pelo evento OU direto da instância global do ScoreManager
        const scoreFromContext = context.data?.score ?? context.data;
        
        if (typeof scoreFromContext === 'number') {
            this.finalScore = scoreFromContext;
        } else {
            this.finalScore = ScoreManager.getInstance().getScore();
        }

        if (this.scoreLabel) {
            this.scoreLabel.text = `Pontuação Final: ${this.finalScore}`;
        }
    }

    override onPreUpdate(engine: Engine, _elapsedMs: number): void {
        if (engine.input.keyboard.wasPressed(Keys.Space) || engine.input.keyboard.wasPressed(Keys.Enter)) {
            engine.goToScene('start');
        }
    }
}