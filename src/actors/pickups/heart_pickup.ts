import { Actor, CollisionType, Vector } from "excalibur";
import { Resources } from "../../config/resources";

export class HeartPickup extends Actor {
    constructor(posicao: Vector){
        super({
            name: 'heart_pickup',
            height: 30,
            width: 30,
            pos: posicao,
            collisionType: CollisionType.Passive
        });
        this.addTag('heal');
    }
    override onInitialize() {
        const sprite = Resources.Heart.toSprite();
        sprite.width = 30;   // escala o sprite para a caixa de 30x30
        sprite.height = 30;
        this.graphics.use(sprite);
    }
}