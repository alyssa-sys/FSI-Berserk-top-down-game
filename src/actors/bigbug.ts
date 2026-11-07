import { Color, Engine, Rectangle, Vector, vec } from "excalibur";
import { Bug } from "./bug";
import { BugShot } from "./bugshot";
import { SmallBug } from "./smallbug";
import { Player } from "./player";

export class BigBug extends Bug {
    private readonly keepDistance: number = 220;  
    private readonly shootRange: number = 400;     
    private readonly shootCooldown: number = 1800; 
    private readonly chargeTime: number = 350;     
    private readonly aimLead: number = 0.7;        
    private readonly baseColor: Color = Color.fromHex('#9d4edd');
    private shootTimer: number = 1000;             
    private sprite!: Rectangle;

    constructor(pos: Vector) {
        super({
            name: 'BigBug',
            pos: pos,
            width: 56,
            height: 56,
            speed: 55,
            hp: 10
        });
    }

    override onInitialize(): void {
        this.addTag('enemy');
        this.sprite = new Rectangle({
            width: 56,
            height: 56,
            color: this.baseColor
        });
        this.graphics.use(this.sprite);
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        const player = this.getPlayer();
        if (!player) {
            this.stop();
            this.sprite.color = this.baseColor;
            return;
        }

        const distance = this.pos.distance(player.pos);
        const inRange = distance <= this.shootRange;

        if (distance > this.keepDistance) {
            this.moveToward(player.pos);
        } else {
            this.stop();
        }

        // fora do alcance o cronômetro espera
        this.shootTimer -= elapsedMs;
        if (!inRange) {
            this.shootTimer = Math.max(this.shootTimer, this.chargeTime);
        }

        // aviso: pisca em branco nos últimos 350 ms antes do tiro
        const charging = inRange && this.shootTimer <= this.chargeTime;
        this.sprite.color = (charging && Math.floor(this.shootTimer / 70) % 2 === 0)
            ? Color.White
            : this.baseColor;

        // ataque à distância
        if (inRange && this.shootTimer <= 0) {
            this.shoot(player);
            this.shootTimer = this.shootCooldown;
            this.sprite.color = this.baseColor;
        }
    }

    private shoot(player: Player): void {
        const travelTime = this.pos.distance(player.pos) / BugShot.SPEED;
        const futurePos = player.pos.add(player.vel.scale(travelTime * this.aimLead));

        const direction = futurePos.sub(this.pos);
        this.scene?.add(new BugShot(this.pos.clone(), direction));
    }

    protected override onDeath(): void {
        super.onDeath(); 
        const scene = this.scene;
        if (!scene) return;
        scene.add(new SmallBug(this.pos.add(vec(-24, 0))));
        scene.add(new SmallBug(this.pos.add(vec(24, 0))));
    }
}