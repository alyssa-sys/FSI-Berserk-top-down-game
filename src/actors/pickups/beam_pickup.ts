import { Actor, CollisionType, Color, Vector } from "excalibur";

export class BeamPickup extends Actor {
    constructor(posicao: Vector){
        super({
            name: 'beam_pickup',
            height: 30,
            width: 30,
            color: Color.fromHex("#0CF2F2"),
            pos: posicao,
            collisionType: CollisionType.Passive
        });
        this.addTag('beam');
    }
}