import { Actor, DefaultLoader, Engine, ExcaliburGraphicsContext, Rectangle, Color, Scene, SceneActivationContext, vec, CollisionType } from "excalibur";
import { Player } from "../actors/player";
import { Bullet } from "../actors/bullet";
import { SubFolder } from "../actors/subfolder";
 
export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];

    override onInitialize(engine: Engine): void {
        // Fundo da fase (Estilo explorador de arquivo/pasta)
        const background = new Actor({
            pos: vec(engine.drawWidth / 2, engine.drawHeight / 2),
            width: engine.drawWidth,
            height: engine.drawHeight,
            z: -1
        });
        background.graphics.use(new Rectangle({
            width: engine.drawWidth,
            height: engine.drawHeight,
            color: Color.fromHex('#1e1e1e')
        }));
        this.add(background);

        // Criar as paredes das bordas (com "backdoors")
        this.createBoundaryWalls(engine);

        // Adicionar jogador
        const player = new Player();
        this.add(player); 

        // Adicionar Subpastas para proteger
        const folder1 = new SubFolder('as_fotos_da_festa_ficaram_otimas', vec(300, 300));
        const folder2 = new SubFolder('trabalho_fsi_final_agora_vai_prometo_', vex(500, 300));

        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);


        const bullet = new Bullet(vec (100, 300), vec(1, 0));
        this.add(bullet);
    }

    private createBoundaryWalls(engine: Engine): void {
        const thickness = 32;

        // Parede superior
        const topWall = new Actor({
            pos: vec(engine.drawWidth / 2, thickness / 2),
            width: engine.drawWidth,
            height: thickness,
            collisionType: CollisionType.Fixed
        });
        topWall.graphics.use(new Rectangle({ width: engine.drawWidth, height: thickness, color: Color.DarkGray }));
        this.add(topWall);


        // Parede inferior
        const bottomWall = new Actor({
            pos: vec(engine.drawWidth / 2, engine.drawHeight - thickness / 2),
            width: engine.drawWidth,
            height: thickness,
            collisionType: CollisionType.Fixed
        });
        bottomWall.graphics.use(new Rectangle({ width: engine.drawWidth, height: thickness, color: Color.DarkGray }));
        this.add(bottomWall);


        // Parede esquerda
        const leftWall = new Actor({
            pos: vec(thickness / 2, engine.drawHeight / 2),
            width: thickness,
            height: engine.drawHeight,
            collisionType: CollisionType.Fixed
        });
        leftWall.graphics.use(new Rectangle({ width: thickness, height: engine.drawHeight, color: Color.DarkGray }));
        this.add(leftWall);


        // Parede direita
        const rightWall = new Actor({
            pos: vec(engine.drawWidth - thickness / 2, engine.drawHeight / 2),
            width: thickness,
            height: engine.drawHeight,
            collisionType: CollisionType.Fixed
        });
        rightWall.graphics.use(new Rectangle({ width: thickness, height: engine.drawHeight, color: Color.DarkGray }));
        this.add(rightWall);
    }

    override onPreLoad(loader: DefaultLoader): void {}

    override onActivate(context: SceneActivationContext<unknown>): void {}

    override onDeactivate(context: SceneActivationContext): void {}

    override onPreUpdate(engine: Engine, elapsedMs: number): void {}

    override onPostUpdate(engine: Engine, elapsedMs: number): void {}

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}