import { Actor, DefaultLoader, Engine, ExcaliburGraphicsContext, Rectangle, Color, Scene, SceneActivationContext, vec, CollisionType } from "excalibur";
import { Player } from "../actors/player";
// import { Bullet } from "../actors/bullet";
import { SubFolder } from "../actors/subfolder";
import { Virus } from "..//actors/virus";
 
export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];

    override onInitialize(engine: Engine): void {
        const thickness = 32;
        const w = 800;
        const h = 600;


        // Fundo da fase (Estilo explorador de arquivo/pasta)
        const background = new Actor({
            pos: vec(w / 2, h / 2),
            width: w - (thickness * 2),
            height: h - (thickness * 2),
            z: -1
        });
        background.graphics.use(new Rectangle({
            width: w - (thickness * 2),
            height: h - (thickness * 2),
            color: Color.fromHex('#1e1e1e')
        }));
        this.add(background);

        // Criar as paredes das bordas (com "backdoors")
        this.createBoundaryWalls(w, h, thickness);

        // Adicionar jogador
        const player = new Player();
        player.pos = vec(w / 2, (h / 2) + 100);
        this.add(player); 

        // Adicionar Subpastas para proteger
        const folder1 = new SubFolder('as_fotos_da_festa_ficaram_otimas', vec((w / 2) - 90, (h / 2) - 80));
        const folder2 = new SubFolder('trabalho_fsi_final_agora_vai_prometo_', vec((w / 2) + 90, (h / 2) - 80));

        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);


        // adicionar um virus de teste nascendo na parte inferior da tela
        const testVirus = new Virus(vec(w / 2, h - 100));
        this.add(testVirus);
    }

    private createBoundaryWalls(w: number, h: number, thickness: number): void {

        // Parede superior
        const topWall = new Actor({
            pos: vec(w / 2, thickness / 2),
            width: w,
            height: thickness,
            collisionType: CollisionType.Fixed
        });
        topWall.graphics.use(new Rectangle({ width: w, height: thickness, color: Color.DarkGray }));
        this.add(topWall);


        // Parede inferior
        const bottomWall = new Actor({
            pos: vec(w / 2, h - thickness / 2),
            width: w,
            height: thickness,
            collisionType: CollisionType.Fixed
        });
        bottomWall.graphics.use(new Rectangle({ width: w, height: thickness, color: Color.DarkGray }));
        this.add(bottomWall);


        // Parede esquerda
        const leftWall = new Actor({
            pos: vec(thickness / 2, h / 2),
            width: thickness,
            height: h - (thickness * 2),
            collisionType: CollisionType.Fixed
        });
        leftWall.graphics.use(new Rectangle({ width: thickness, height: h - (thickness * 2), color: Color.DarkGray }));
        this.add(leftWall);


        // Parede direita
        const rightWall = new Actor({
            pos: vec(w - thickness / 2, h / 2),
            width: thickness,
            height: h - (thickness * 2),
            collisionType: CollisionType.Fixed
        });
        rightWall.graphics.use(new Rectangle({ width: thickness, height: h - (thickness * 2), color: Color.DarkGray }));
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