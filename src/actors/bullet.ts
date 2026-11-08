import { Vector, Actor, Color, CollisionType, Collider, Side, CollisionContact, CollisionGroup } from "excalibur";
import { BulletGroup } from "../config/collision-group";

export class Bullet extends Actor {
  private direcao: Vector;
  constructor(posicao: Vector, direcao: Vector) {
    super({
      name: 'Bullet',
      width: 10,
      height: 10,
      color: Color.Yellow,
      pos: posicao,
      collisionType: CollisionType.Active,
      collisionGroup: BulletGroup
    });
    this.direcao = direcao;
    this.addTag('bullet_hitbox');
  }

  override onInitialize() {
    this.vel = this.direcao.normalize().scale(1000); // velocidade da bala
    this.actions.delay(1000).die(); // remoção da bala
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if(other.owner?.hasTag('wall_col') || other.owner?.hasTag('barrier_col') || other.owner?.hasTag('folder_col'))
    {
      this.kill();
    }
  }

}