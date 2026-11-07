import { Actor, CollisionType, Color, Vector } from "excalibur";

export class HeartPickup extends Actor {
    constructor(posicao: Vector){
        super({
            name: 'heart_pickup',
            height: 30,
            width: 30,
            color: Color.Pink,
            pos: posicao,
            collisionType: CollisionType.Passive
        });
        this.addTag('heal');
    }
}