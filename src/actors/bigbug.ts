import { Engine, Vector, vec } from "excalibur";
import { Bug } from "./bug";
import { BugShot } from "./bugshot";
import { SmallBug } from "./smallbug";
import { ScoreManager } from "../managers/score_manager";
import { Player } from "./player";
import { Resources } from "../config/resources";

export class BigBug extends Bug {
    private readonly keepDistance: number = 220;  
    private readonly shootRange: number = 400;     
    private readonly shootCooldown: number = 1800; 
    private readonly chargeTime: number = 350;     
    private readonly aimLead: number = 0.2;        
    private shootTimer: number = 1000;             

    constructor(pos: Vector) {
        super({
            name: 'BigBug',
            pos: pos,
            width: 56,
            height: 56,
            speed: 60,
            hp: 5
        });
    }

    override onInitialize(): void {
        this.addTag('enemy');
        this.setupGlitch({
            image: Resources.BigBug,
            frameSize: 64,
            shapeCount: 5
        });
    }

    override onPreUpdate(_engine: Engine, elapsedMs: number): void {
        const player = this.getPlayer();
        if (!player) {
            this.stop();
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
        this.glitch?.setIntensity(charging ? 1 : 0);
        this.glitch?.setFlash(charging && Math.floor(this.shootTimer / 70) % 2 === 0);

        // ataque à distância
        if (inRange && this.shootTimer <= 0) {
            this.shoot(player);
            this.shootTimer = this.shootCooldown;
            this.glitch?.setFlash(false);
        }
    }

    private shoot(player: Player): void {
        const travelTime = this.pos.distance(player.pos) / BugShot.SPEED;
        const futurePos = player.pos.add(player.vel.scale(travelTime * this.aimLead));

        const direction = futurePos.sub(this.pos);
        this.scene?.add(new BugShot(this.pos.clone(), direction));
    }

    protected override onDeath(): void {
        ScoreManager.getInstance().addPoints(1);

        super.onDeath(); 
        const scene = this.scene;
        if (!scene) return;
        scene.add(new SmallBug(this.pos.add(vec(-24, 0))));
        scene.add(new SmallBug(this.pos.add(vec(24, 0))));
    }
}