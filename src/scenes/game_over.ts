import { Scene, Engine, Label, Font, Color, vec, TextAlign, Keys, SceneActivationContext } from "excalibur";
import { ScoreManager } from "../managers/score_manager";
import { LeaderboardManager, LeaderboardEntry } from "../managers/leaderboard_manager";

export class GameOverScene extends Scene {
    private scoreLabel!: Label;
    private finalScore: number = 0;

    // controle de entrada do placar
    private initials: string[] = ["A", "A", "A"];
    private selectedCharIndex: number = 0;
    private initialsLabel!: Label;
    private instructionLabel!: Label;
    private leaderboardLabels: Label[] = []; 
    private isSaved: boolean = false;

    override onInitialize(_engine: Engine): void {
        const w = _engine.drawWidth;
        const h = _engine.drawHeight;

        const titleLabel = new Label({
            text: "GAME OVER",
            pos: vec(w / 2, 60),
            font: new Font({
                size: 48,
                color: Color.Red,
                textAlign: TextAlign.Center
            })
        });
        this.add(titleLabel);

        this.scoreLabel = new Label({
            text: `PONTUAÇÃO FINAL: ${this.finalScore}`,
            pos: vec(w / 2, 110),
            font: new Font({
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.add(this.scoreLabel);

        // seletor do nome do ranking
        this.initialsLabel = new Label({
            text: "",
            pos: vec(w / 2, 160),
            font: new Font({
                size: 32,
                color: Color.White,
                textAlign: TextAlign.Center,
                bold: true

            })
        });
        this.add(this.initialsLabel);

        // instrucao para escolher nome
        this.instructionLabel = new Label({
            text: "Use ↑ ↓ → ← e depois aperte ENTER para salvar",
            pos: vec(w / 2, 215),
            font: new Font({
                size: 14,
                color: Color.Yellow,
                textAlign: TextAlign.Center
            })
        });
        this.add(this.instructionLabel);

        // titulo do ranking
        const rankingTitle = new Label({
            text: "RANKING DOS TOP 5",
            pos: vec(w / 2, 245),
            font: new Font({
                size: 18,
                color: Color.White,
                textAlign: TextAlign.Center,
                bold: true
            })
        });
        this.add(rankingTitle);

        const restartLabel = new Label({
            text: "Pressione ESPAÇO para Reiniciar",
            pos: vec(w / 2, 530),
            font: new Font({
                size: 18,
                color: Color.White,
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

        // reseta o seletor de letras do ranking
        this.initials = ["A", "A", "A"];
        this.selectedCharIndex = 0;
        this.isSaved = false;

        if (this.instructionLabel) {
            this.instructionLabel.text = "Use ↑ ↓ → ← e aperte ENTER para salvar";
            this.instructionLabel.font.color = Color.Yellow;
        }

        this.updateInitialsDisplay();
        this.renderLeaderboard();
    }

    override onPreUpdate(engine: Engine, _elapsedMs: number): void {
        const k = engine.input.keyboard;

        if (!this.isSaved) {
            // Navegação e alteração de caracteres
            if (k.wasPressed(Keys.Up)) {
                this.changeChar(1);
            } else if (k.wasPressed(Keys.Down)) {
                this.changeChar(-1);
            } else if (k.wasPressed(Keys.Right)) {
                this.selectedCharIndex = (this.selectedCharIndex + 1) % 3;
                this.updateInitialsDisplay();
            } else if (k.wasPressed(Keys.Left)) {
                this.selectedCharIndex = (this.selectedCharIndex + 2) % 3;
                this.updateInitialsDisplay();
            } else if (k.wasPressed(Keys.Enter)) {
                // Salva o score e confirma
                const name = this.initials.join("");
                LeaderboardManager.saveScore(name, this.finalScore);
                this.isSaved = true;

                this.instructionLabel.text = "SALVO! Pressione ESPAÇO para jogar novamente";
                this.instructionLabel.font.color = Color.Green;
                this.renderLeaderboard();
            }
        } else {
            // apos salvar, reinicia o jogo com ESPAÇO
            if (k.wasPressed(Keys.Space)) {
                engine.goToScene('start');
            }
        }
    }

    private changeChar(delta: number): void {
        let charCode = this.initials[this.selectedCharIndex].charCodeAt(0) + delta;
        
        // Loop de A (65) até Z (90)
        if (charCode > 90) charCode = 65;
        if (charCode < 65) charCode = 90;

        this.initials[this.selectedCharIndex] = String.fromCharCode(charCode);
        this.updateInitialsDisplay();
    }

    private updateInitialsDisplay(): void {
        const display = this.initials.map((char, index) => {
            return index === this.selectedCharIndex ? `[${char}]` : ` ${char} `;
        }).join(" ");

        this.initialsLabel.text = display;
    }

    private renderLeaderboard(): void {
        // Limpa os labels do ranking antigo
        this.leaderboardLabels.forEach(lbl => this.remove(lbl));
        this.leaderboardLabels = [];

        const scores: LeaderboardEntry[] = LeaderboardManager.getScores();
        const startY = 280;
        const w = this.engine.drawWidth;

        scores.forEach((entry, idx) => {
            const lbl = new Label({
                text: `${idx + 1}. ${entry.name} - ${entry.score} PTS`,
                pos: vec(w / 2, startY + (idx * 25)),
                font: new Font({
                    size: 16,
                    color: Color.White,
                    textAlign: TextAlign.Center
                })
            });
            this.leaderboardLabels.push(lbl);
            this.add(lbl);
        });
    }
}