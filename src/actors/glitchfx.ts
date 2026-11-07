import { GraphicsComponent, ImageSource, Sprite, SpriteSheet } from "excalibur";

export interface GlitchOptions {
    image: ImageSource;  
    frameSize: number;    
    shapeCount: number;   
}

// Colunas da spritesheet 
const CALM = 0;     
const SPLIT = 1;    
const SLICES = 2;  
const HEAVY = 3;    
const FLASH = 4;    

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export class GlitchFx {
    private readonly sprites: Sprite[][] = []; // sprites[forma][frame]

    private shape: number = 0;
    private frame: number = CALM;
    private hold: number = rand(800, 1700); 

    private burstLeft: number = 0;
    private nextBurst: number = rand(400, 1200);
    private external: number = 0;   
    private level: number = 0.15;   
    private flash: boolean = false;
    private rollTimer: number = 0;

    constructor(options: GlitchOptions, private readonly graphics: GraphicsComponent) {
        const sheet = SpriteSheet.fromImageSource({
            image: options.image,
            grid: {
                rows: options.shapeCount,
                columns: 5,
                spriteWidth: options.frameSize,
                spriteHeight: options.frameSize
            }
        });
        for (let row = 0; row < options.shapeCount; row++) {
            const line: Sprite[] = [];
            for (let col = 0; col < 5; col++) {
                line.push(sheet.getSprite(col, row)!);
            }
            this.sprites.push(line);
        }
        this.shape = randInt(0, options.shapeCount - 1);
        this.show();
    }

    // Intensidade de fora (0 = calmo, 1 = glitch máximo)
    public setIntensity(value: number): void {
        this.external = Math.max(0, Math.min(1, value));
    }

    // Pisca a forma inteira em branco (aviso antes do ataque)
    public setFlash(on: boolean): void {
        if (on !== this.flash) {
            this.flash = on;
            this.show();
        }
    }

    // Força uma rajada de glitch agora (ex.: ao levar dano)
    public pulse(ms: number): void {
        this.burstLeft = Math.max(this.burstLeft, ms);
        this.rollTimer = 0;
    }

    // Avança a animação. Chamado uma vez por frame pelo bug.
    public update(elapsedMs: number): void {
        // troca de forma: corte seco, acompanhado de uma rajada de glitch
        this.hold -= elapsedMs;
        if (this.hold <= 0 && this.sprites.length > 1) {
            let next = this.shape;
            while (next === this.shape) next = randInt(0, this.sprites.length - 1);
            this.shape = next;
            this.hold = rand(800, 1700);
            this.pulse(200);
        }

        // rajadas aleatórias
        this.burstLeft -= elapsedMs;
        this.nextBurst -= elapsedMs;
        if (this.burstLeft <= 0 && this.nextBurst <= 0) {
            this.burstLeft = rand(120, 280);
            this.nextBurst = rand(600, 1600);
        }
        this.level = Math.max(0.15, this.burstLeft > 0 ? 0.9 : 0, this.external);

        // sorteia um frame novo de tempos em tempos (mais rápido quando o glitch está forte)
        this.rollTimer -= elapsedMs;
        if (this.rollTimer <= 0) {
            this.rollTimer = this.level > 0.5 ? 60 : 140;
            if (this.level > 0.5) this.frame = pick([SLICES, HEAVY, HEAVY, SPLIT]);
            else if (this.level > 0.3) this.frame = pick([SPLIT, SLICES, CALM]);
            else this.frame = Math.random() < 0.7 ? CALM : pick([SPLIT, SLICES]);
            this.show();
        }
    }

    private show(): void {
        const frame = this.flash ? FLASH : this.frame;
        this.graphics.use(this.sprites[this.shape][frame]);
    }
}