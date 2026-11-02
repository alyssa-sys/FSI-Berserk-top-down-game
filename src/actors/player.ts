import { Actor, Collider, CollisionContact, Engine, Side, vec, Vector, Keys } from "excalibur";
import { Resources } from "../config/resources";
import { Bullet } from "./bullet";

export class Player extends Actor {
  private direction: Vector = vec(1, 0);
  private fire_cd: number = 0;
  constructor() {
    super({
      name: 'Player',
      pos: vec(150, 150),
      width: 100,
      height: 100,
    });
    
  }

  override onInitialize() {
    this.graphics.add(Resources.Sword.toSprite()); // placeholder
    this.on('pointerdown', evt => {
      console.log('You clicked the actor @', evt.worldPos.toString());
    });
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    let direcao = vec(0,0); // posição inicial do player
    this.fire_cd -= elapsedMs; // cooldown de cadência do tiro

    // movimentos (w,a,s,d)

    if (engine.input.keyboard.isHeld(Keys.D)){
       direcao.x = 1;
    }
    if (engine.input.keyboard.isHeld(Keys.W)){
       direcao.y = -1;
    }
    if (engine.input.keyboard.isHeld(Keys.A)){
       direcao.x = -1;
    }
    if (engine.input.keyboard.isHeld(Keys.S)){
       direcao.y = 1;
    }
    
    if (direcao.magnitude > 0){
      direcao = direcao.normalize();
      this.direction = direcao.clone();
    }
    
    // comando de tiro (barra de espaço)

    if(engine.input.keyboard.isHeld(Keys.Space) && this.fire_cd <=0){
      const bullet = new Bullet(this.pos.clone(), this.direction.clone());
      this.fire_cd = 120;
      this.scene?.add(bullet);
    }
    this.vel = direcao.scale(200);
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
  }

  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  }

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
  }
}
