import { Actor, Collider, SpriteSheet, Animation, AnimationStrategy, CollisionContact, Engine, Side, vec, Vector, Keys, CollisionType, ScreenElement, CollisionGroup } from "excalibur";
import { Resources } from "../config/resources";
import { Bullet } from "../actors/bullet";
import { ScoreManager } from "../managers/score_manager";
import { PlayerGroup } from "../config/collision-group";

export class Player extends Actor {
  private direction: Vector = vec(1, 0);
  private fire_cd: number = 0;
  private hp: number = 3;
  private invul: number = 0;
  private weapon: 'bullet' | 'rocket' | 'beam' = 'bullet';
  private walkAnim!: Animation;
  private idleAnim!: Animation;

  getHp(): number{ // hp do player
    return this.hp;
  }

  constructor() {
    super({
      name: 'Player',
      pos: vec(150, 150),
      width: 50,
      height: 50,
      collisionType: CollisionType.Active, // Garante que ele colida com paredes e subpastas
      collisionGroup: PlayerGroup
    });
    
  }

  override onInitialize() {
    const sheet = SpriteSheet.fromImageSource({
      image: Resources.PlayerSheet, grid: { rows: 1, columns: 5, spriteWidth: 64, spriteHeight: 80 } 
    });
    this.walkAnim = Animation.fromSpriteSheet(sheet, [0, 1, 2, 3, 4], 120, AnimationStrategy.Loop);
    this.idleAnim = Animation.fromSpriteSheet(sheet, [0], 1000, AnimationStrategy.Loop);

    this.graphics.add('walk', this.walkAnim);
    this.graphics.add('idle', this.idleAnim);
    this.graphics.use('idle');
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
    this.graphics.use(direcao.magnitude > 0 ? 'walk' : 'idle');
    if (direcao.x < 0) this.graphics.flipHorizontal = true;
    else if (direcao.x > 0) this.graphics.flipHorizontal = false;
    
    // comando de tiro (mouse)

    if(engine.input.pointers.isDown(0) && this.fire_cd <=0){

      // balas padrão
      if(this.weapon == 'bullet'){ 
        const bullet = new Bullet(this.pos.clone(), engine.input.pointers.primary.lastWorldPos.sub(this.pos));
        this.fire_cd = 450; // cadência de tiros
        this.scene?.add(bullet);
      }
    }

    this.vel = direcao.scale(200); // velocidade do player
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
      this.invul = 200;
    }
    if (this.hp <= 0) {
      const engine = this.scene?.engine;

      this.kill();
      
      if (engine) {
        engine.goToScene('gameover');
      }
    }
    

    if (other.owner?.hasTag("heal")){
      this.hp = Math.min(this.hp + 1, 3)
      other.owner?.kill()
    }

    if (other.owner?.hasTag("rocket")) {
      this.weapon = 'rocket';
      other.owner.kill();
    }

    if (other.owner?.hasTag("beam")) {
      this.weapon = 'beam';
      other.owner.kill();
    }
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
  }
}
