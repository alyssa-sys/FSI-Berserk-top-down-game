import { Actor, DefaultLoader, Engine, ExcaliburGraphicsContext, Rectangle, Color, Scene, SceneActivationContext, ScreenElement, vec, CollisionType, } from "excalibur";
import { Player } from "../actors/player";
// import { Bullet } from "../actors/bullet";
import { SubFolder } from "../actors/subfolder";
import { Virus } from "..//actors/virus";
import { BigBug } from "../actors/bigbug";
import { SmallBug } from "../actors/smallbug";
 
export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];
    private hearts: ScreenElement[] = [];
    private player!: Player;

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
        this.player = new Player(); // hiago: troquei const player para this.player devido a mecanica de hp
        this.player.pos = vec(w / 2, (h / 2) + 100);
        this.add(this.player); 

        // adicionar corações de vida do player
        for (let i = 0; i < 3; i++){
            const heart = new ScreenElement({
                pos: vec(40 + i*40, 30),
                width: 30,
                height: 30,
                color: Color.Red
            });
            this.hearts.push(heart);
            this.add(heart);
        }

        // Adicionar Subpastas para proteger
        const folder1 = new SubFolder('as_fotos_da_festa_ficaram_otimas', vec((w / 2) - 90, (h / 2) - 80));
        const folder2 = new SubFolder('trabalho_fsi_final_agora_vai_prometo_', vec((w / 2) + 90, (h / 2) - 80));

        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);


        // adicionar um virus de teste nascendo na parte inferior da tela
        const testVirus = new Virus(vec(w / 2, h - 100));
        this.add(testVirus);

        // bugs de teste
        this.add(new BigBug(vec(w / 2, 90)));
        this.add(new SmallBug(vec(100, 100)));
        this.add(new SmallBug(vec(w - 100, 100)));
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

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // barra de hp do player
        for (let i = 0; i < this.hearts.length; i++){
            if (i < this.player.getHp()){
                this.hearts[i].graphics.opacity = 1;
            }
            else{
                this.hearts[i].graphics.opacity = 0;
            }
        }
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {}

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}