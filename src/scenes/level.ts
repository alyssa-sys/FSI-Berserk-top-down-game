import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext, vec } from "excalibur";
import { Player } from "../actors/player";
import { Bullet } from "../actors/bullet";
 
export class MyLevel extends Scene {
    override onInitialize(engine: Engine): void {
        const player = new Player();
        this.add(player);
    }

    override onPreLoad(loader: DefaultLoader): void {
    }

    override onActivate(context: SceneActivationContext<unknown>): void {

    }

    override onDeactivate(context: SceneActivationContext): void {

    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
       
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
      
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
      
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
       
    }
}