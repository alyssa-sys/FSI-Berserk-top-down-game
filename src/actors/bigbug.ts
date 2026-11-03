import { Color, Rectangle, Vector } from "excalibur";
import { Bug } from "./bug";

export class BigBug extends Bug {
    private readonly keepDistance: number = 220;

    constructor(pos: Vector) {
        super({
            name: 'BigBug',
            pos: pos,
            width: 56,
            height: 56,
            speed: 45
        });
    }

    override onInitialize(): void {
        this.addTag('enemy'); // tag de inimigo para causar dano ao player
        this.graphics.use(new Rectangle({
            width: 56,
            height: 56,
            color: Color.fromHex('#9d4edd')
        }));
    }

    override onPreUpdate(): void {
        const player = this.getPlayer();
        if (!player) {
            this.stop();
            return;
        }

        if (this.pos.distance(player.pos) > this.keepDistance) {
            this.moveToward(player.pos);
        } else {
            this.stop();
        }
    }
}