import { Vector, Actor, Color, CollisionType, Collider, Side, CollisionContact, CollisionGroup, Ray, Engine, vec, Rectangle } from "excalibur";
import { BulletGroup } from "../../config/collision-group";

type DamageableActor = Actor & {takeDamage(amount: number): void;};

export class Beam extends Actor {
  private direcao: Vector;
  private maxLength: number = 1000;
  private damage: number = 0.75;
  private targets: DamageableActor[] = [];
  private duration: number = 500;
  private fadeInDuration: number = 100;
  private fadeOutDuration: number = 150;
  private burnInterval: number = 100;
  private burnElapsed: number = 0;
  private burnTicks: number = 0;
  private lifeElapsed: number = 0;
  constructor(posicao: Vector, direcao: Vector) {
    super({
      name: 'Beam',
      width: 10,
      height: 10,
      color: Color.fromHex("#0CF2F2"),
      pos: posicao.clone(),
      collisionType: CollisionType.PreventCollision,
      collisionGroup: BulletGroup
    });
    this.direcao = direcao.magnitude > 0 ? direcao.normalize(): vec(1, 0);
    this.addTag('bullet_hitbox');
  }

  override onInitialize(): void {
    const scene = this.scene;
    if (!scene) return;
    
    const origem = this.pos.clone();
    const ray = new Ray(origem, this.direcao)

    const hits = scene.physics.rayCast(ray, {
      searchAllColliders: true,
      maxDistance: this.maxLength,
      filter: (hit) => {
        const owner = hit.collider.owner;

        return owner?.hasTag('enemy') ||
        owner?.hasTag('wall_col') ||
        owner?.hasTag('barrier_col') ||
        owner?.hasTag('folder_col');
      }
    });

    hits.sort((a, b) => a.distance - b.distance);
    let beamLength = this.maxLength;

    // evitar dano duplicado no mesmo inimigo
    const hitEnemies = new Set<object>();

    for (const hit of hits) {
      const target = hit.collider.owner;
      if (!target) continue;
      if (
        target.hasTag('wall_col') ||
        target.hasTag('barrier_col') ||
        target.hasTag('folder_col')
      ) {
        beamLength = hit.distance;
        break;
      }
      // inimigos recebem dano e não bloqueiam o laser
      if (target.hasTag('enemy') && !hitEnemies.has(target)) {
        const candidate = target as Actor & {
          takeDamage?: (amount : number) => void;
        }
        if (typeof candidate.takeDamage !== 'function'){
          continue;
        }

        hitEnemies.add(target);
        this.targets.push(candidate as DamageableActor);
      }
    }

    this.rotation = this.direcao.toAngle();
    this.pos = origem.add(this.direcao.scale(beamLength / 2));
    
    this.graphics.use(new Rectangle({
      width: beamLength,
      height: 10,
      color: Color.fromHex("#0CF2F2")
    }));
    this.graphics.opacity = 0;
  }

  override onPreUpdate(_engine: Engine, elapsedMs: number): void {

    // tempo de vida
    const previousElapsed = this.lifeElapsed;

    this.lifeElapsed = Math.min(
        this.lifeElapsed + elapsedMs,
        this.duration
    );

    const activeDelta = this.lifeElapsed - previousElapsed;

    // intervalos de queimadura
    this.burnElapsed += activeDelta;

    while (this.burnElapsed >= this.burnInterval) {
        this.burnElapsed -= this.burnInterval;
        this.burnTicks++;

        // não aplicar dano no instante em que o laser desaparece
        if (this.burnTicks * this.burnInterval >= this.duration) {
            continue;
        }

        for (const enemy of this.targets) {
            if (!enemy.isKilled()) {
                enemy.takeDamage(this.damage);
            }
        }
    }
    const fadeIn = Math.min(this.lifeElapsed / this.fadeInDuration, 1);
    const fadeOutStart = this.duration - this.fadeOutDuration;
    const fadeOut = this.lifeElapsed > fadeOutStart ? Math.max(0,(this.duration - this.lifeElapsed) / this.fadeOutDuration): 1;

    this.graphics.opacity = Math.min(fadeIn, fadeOut);

    if (this.lifeElapsed >= this.duration) {
        this.kill();
    }
}
}