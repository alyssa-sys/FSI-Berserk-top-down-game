import { Actor, DefaultLoader, Engine, ExcaliburGraphicsContext, Rectangle, Color, Scene, SceneActivationContext, ScreenElement, vec, CollisionType, Vector, Timer } from "excalibur";
import { Player } from "../actors/player";
// import { Bullet } from "../actors/bullet";
import { SubFolder } from "../actors/subfolder";
import { Virus } from "../actors/virus";
import { BugSpawner } from "../actors/bugspawner";
// import { HeartPickup } from "../actors/heart_pickup";
 

type WallSide = 'top' | 'bottom' | 'left' | 'right'; 

export class MyLevel extends Scene {
    public subFolders: SubFolder[] = [];
    private hearts: ScreenElement[] = [];
    private player!: Player;

    // guarda a posicao das portas geradas
    private doorPositions: Vector[] = [];
    private virusSpawnerTimer!: Timer;

    override onInitialize(engine: Engine): void {
        const thickness = 32;
        const w = 800;
        const h = 600;


        // Fundo da fase (Estilo explorador de arquivo/pasta)
        const background = new Actor({
            pos: vec(w / 2, h / 2),
            width: w - (thickness * 2),
            height: h - (thickness * 2),
            z: -1
        });
        background.graphics.use(new Rectangle({
            width: w - (thickness * 2),
            height: h - (thickness * 2),
            color: Color.fromHex('#1e1e1e')
        }));
        this.add(background);

        // escolhe 3 paredes aleatorias para terem portas
        const doorSides = this.getRandomDoorSides(3);

        // Criar as paredes das bordas (com "backdoors")
        this.createBoundaryWallsWithDoors(w, h, thickness, doorSides);

        // Adicionar jogador
        this.player = new Player(); // hiago: troquei const player para this.player devido a mecanica de hp
        this.player.pos = vec(w / 2, (h / 2) + 100);
        this.add(this.player); 

        // adicionar corações de vida do player
        for (let i = 0; i < 3; i++){
            const heart = new ScreenElement({
                pos: vec(40 + i*40, 30),
                width: 30,
                height: 30,
                color: Color.Red
            });
            this.hearts.push(heart);
            this.add(heart);
        }

        // Adicionar Subpastas para proteger
        const folder1 = new SubFolder('as fotos da festa ficaram otimas', vec((w / 2) - 90, (h / 2) - 80));
        const folder2 = new SubFolder('trabalho fsi final agora vai prometo ', vec((w / 2) + 90, (h / 2) - 80));

        this.subFolders.push(folder1, folder2);
        this.add(folder1);
        this.add(folder2);


        // virus nascem de portas aleatorias
        this.spawnVirusInRandomDoor();

        // spawna virus a cada 30s
        this.virusSpawnerTimer = new Timer({
            flicker: false,
            interval: 5000, // 5.000ms = 5s
            repeats: true,
            fcn: () => {
                this.spawnVirusInRandomDoor();
            }
        });

        // adiciona o virus e inicia o timer
        this.add(this.virusSpawnerTimer);
        this.virusSpawnerTimer.start();

        // gerador de bugs
        this.add(new BugSpawner(this.doorPositions));
    }

    // metodo para instanciar um vírus em uma das portas sorteadas
    public spawnVirusInRandomDoor(): void{
        if (this.doorPositions.length === 0) return;

        // Escolhe uma porta aleatoria
        const randomIndex = Math.floor(Math.random() * this.doorPositions.length);
        const spawnPoint = this.doorPositions[randomIndex];

        const virus = new Virus(spawnPoint);
        this.add(virus);
    }

    // Funcao que escolhe N lados aleatorios
    private getRandomDoorSides(count: number): Set<WallSide> {
        const allSides: WallSide[] = ['top', 'bottom', 'left', 'right'];
        const selected = new Set<WallSide>();

        while (selected.size < count) {
            const randomIndex = Math.floor(Math.random() * allSides.length);
            selected.add(allSides[randomIndex]);
        }
        return selected;
    }

    private createBoundaryWallsWithDoors(w: number, h: number, thickness: number, doorSides: Set<WallSide>): void {
        const wallColor = Color.DarkGray;
        const doorSize = 80; // Vão livre da abertura para passagem (80px)
        this.doorPositions = [];

        // --- PAREDE SUPERIOR ---
        if (doorSides.has('top')) {
            const segmentWidth = (w - doorSize) / 2;
            this.createWallSegment(vec(segmentWidth / 2, thickness / 2), segmentWidth, thickness, wallColor);
            this.createWallSegment(vec(w - (segmentWidth / 2), thickness / 2), segmentWidth, thickness, wallColor);

            // ponto central da abertura superior
            const doorPos = vec(w / 2, thickness / 2);
            this.doorPositions.push(doorPos);

            // barreira invisivel na borda superior
            this.createInvisibleBarrier(vec(w / 2, -thickness / 2), doorSize, thickness);
        } else {
            this.createWallSegment(vec(w / 2, thickness / 2), w, thickness, wallColor);
        }

        // --- PAREDE INFERIOR ---
        if (doorSides.has('bottom')) {
            const segmentWidth = (w - doorSize) / 2;
            this.createWallSegment(vec(segmentWidth / 2, h - thickness / 2), segmentWidth, thickness, wallColor);
            this.createWallSegment(vec(w - (segmentWidth / 2), h - thickness / 2), segmentWidth, thickness, wallColor);

            // ponto central da abertura inferior
            const doorPos = vec(w / 2, h - thickness / 2);
            this.doorPositions.push(doorPos);

            // barreira invisivel na borda inferior
            this.createInvisibleBarrier(vec(w / 2, h + thickness / 2), doorSize, thickness);
        } else {
            this.createWallSegment(vec(w / 2, h - thickness / 2), w, thickness, wallColor);
        }

        // --- PAREDE ESQUERDA ---
        const availableHeight = h - (thickness * 2);
        if (doorSides.has('left')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            this.createWallSegment(vec(thickness / 2, thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            this.createWallSegment(vec(thickness / 2, h - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);

            // ponto central da abertura lateral esquerda
            const doorPos = vec(thickness / 2, h / 2);
            this.doorPositions.push(doorPos);

            // barreira invisivel na borda lateral esquerda
            this.createInvisibleBarrier(vec(-thickness / 2, h / 2), thickness, doorSize);
        } else {
            this.createWallSegment(vec(thickness / 2, h / 2), thickness, availableHeight, wallColor);
        }

        // --- PAREDE DIREITA ---
        if (doorSides.has('right')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            this.createWallSegment(vec(w - thickness / 2, thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            this.createWallSegment(vec(w - thickness / 2, h - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);

            // ponto central da abertura lateral direita
            const doorPos = vec(w - thickness / 2, h / 2);
            this.doorPositions.push(doorPos);

            // barreira invisivel na borda lateral direita
            this.createInvisibleBarrier(vec(w + thickness / 2, h / 2), thickness, doorSize);
        } else {
            this.createWallSegment(vec(w - thickness / 2, h / 2), thickness, availableHeight, wallColor);
        }
    }

    // Método auxiliar para criar cada pedaço de parede sólida
    private createWallSegment(pos: any, width: number, height: number, color: Color): void {
        const wall = new Actor({
            pos: pos,
            width: width,
            height: height,
            collisionType: CollisionType.Fixed
        });
        wall.graphics.use(new Rectangle({ width, height, color }));
        this.add(wall);
    }

    // cria uma parede física totalmente transparente fora do mapa
    private createInvisibleBarrier(pos: Vector, width: number, height: number): void {
        const barrier = new Actor({
            pos: pos,
            width: width,
            height: height,
            collisionType: CollisionType.Fixed
        });
        // Não adiciona grafico a parede, ela é 100% invisível
        this.add(barrier);
    }

    override onPreLoad(loader: DefaultLoader): void {}

    override onActivate(context: SceneActivationContext<unknown>): void {}

    override onDeactivate(context: SceneActivationContext): void {}

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // barra de hp do player
        for (let i = 0; i < this.hearts.length; i++){
            if (i < this.player.getHp()){
                this.hearts[i].graphics.opacity = 1;
            }
            else{
                this.hearts[i].graphics.opacity = 0;
            }
        }
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {}

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}