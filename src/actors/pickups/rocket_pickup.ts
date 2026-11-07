import { Actor, CollisionType, Color, Vector } from "excalibur";

export class RocketPickup extends Actor {
    constructor(posicao: Vector){
        super({
            name: 'rocket_pickup',
            height: 30,
            width: 30,
            color: Color.fromHex("#e04422"),
            pos: posicao,
            collisionType: CollisionType.Passive
        });
        this.addTag('rocket');
    }
}