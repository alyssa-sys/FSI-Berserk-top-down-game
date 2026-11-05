
import { Actor, Collider, CollisionContact, Engine, Side, vec, Vector, Keys, CollisionType, ScreenElement } from "excalibur";
import { Resources } from "../config/resources";
import { Bullet } from "../actors/bullet";

export class Player extends Actor {
  private direction: Vector = vec(1, 0);
  private fire_cd: number = 0;
  private hp: number = 3;
  private invul: number = 0;

  getHp(): number{ // hp do player
    return this.hp;
  }

  constructor() {
    super({
      name: 'Player',
      pos: vec(150, 150),
      width: 50,
      height: 50,
      collisionType: CollisionType.Active // Garante que ele colida com paredes e subpastas
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
    this.invul -= elapsedMs; // tempo de invulnerabilidade ao tomar dano

    if (this.invul > 0){
      const calc_flash = Math.floor(this.invul/100)%2; // visualizando os segundos de invulnerabilidade do player
      if (calc_flash == 0){
        this.graphics.opacity = 0.3;
      }
      else{
        this.graphics.opacity = 1;
      }

    }
    else{
      this.graphics.opacity = 1;
    }

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

    this.vel = direcao.scale(250); // velocidade do player
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
  }

  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  }

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner?.hasTag("enemy") && this.invul <= 0){ // verificar se o player tomou hit do inimigo
      this.hp -= 1;
      this.invul = 2000;
    }
    if (this.hp <= 0){
      this.kill();
    }

    if (other.owner?.hasTag("heal")){
      this.hp = Math.min(this.hp + 1, 3)
      other.owner?.kill()
    }
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
  }
}
