import { Vector, Actor, Color } from "excalibur";

export class Bullet extends Actor {
  private direcao: Vector;
  constructor(posicao: Vector, direcao: Vector) {
    super({
      name: 'Bullet',
      width: 10,
      height: 10,
      color: Color.Yellow,
      pos: posicao,
    });
    this.direcao = direcao;
  }

  override onInitialize() {
    this.vel = this.direcao.normalize().scale(1000);
    this.actions.delay(1000).die();
  }

}