import { Actor, CollisionType, Color, Vector } from "excalibur";

export class ShotgunPickup extends Actor {
    constructor(posicao: Vector){
        super({
            name: 'shotgun_pickup',
            height: 30,
            width: 30,
            color: Color.fromHex("#22F057"),
            pos: posicao,
            collisionType: CollisionType.Passive
        });
        this.addTag('shotgun');
    }
}