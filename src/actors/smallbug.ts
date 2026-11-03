import { Color, Rectangle, Vector} from "excalibur";
import { Bug} from "./bug";

export class SmallBug extends Bug {
    constructor(pos: Vector) {
        super({
            name: 'SmallBug',
            pos: pos,
            width: 20,
            height: 20,
            speed: 130
        });
    }

    override onInitialize(): void {
        this.addTag('enemy'); // tag de inimigo para causar dano ao player
        this.graphics.use(new Rectangle({
            width: 20,
            height: 20,
            color: Color.fromHex('#ff9f1c')
        }));
    }

    override onPreUpdate(): void {
        const player = this.getPlayer();
        if (player) {
            this.moveToward(player.pos);
        } else {
            this.stop();
        }
    }
}