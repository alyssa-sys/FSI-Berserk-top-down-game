import { Canvas } from "excalibur";

// Formas pelas quais o bug pode se transformar
export type GlitchShape = 'triangle' | 'square' | 'diamond' | 'pentagon' | 'hexagon' | 'circle';

export interface GlitchOptions {
    size: number;          
    colors: string[];       
    shapes: GlitchShape[];  
}

const SHAPE_DEF: Record<GlitchShape, { n: number; phase: number }> = {
    triangle: { n: 3, phase: -Math.PI / 2 }, // ponta para cima
    square:   { n: 4, phase: Math.PI / 4 },
    diamond:  { n: 4, phase: 0 },
    pentagon: { n: 5, phase: -Math.PI / 2 },
    hexagon:  { n: 6, phase: 0 },
    circle:   { n: 48, phase: 0 }
};

const SAMPLES = 120;       
const MORPH_MS = 220;       
const BAR_COLOR_ALPHA = 0.95;

// Distância do centro até a borda da forma, para cada ângulo (forma com raio 1)
function shapeRadii(shape: GlitchShape): number[] {
    const { n, phase } = SHAPE_DEF[shape];
    const step = (2 * Math.PI) / n;
    const radii: number[] = [];
    for (let k = 0; k < SAMPLES; k++) {
        const theta = (k / SAMPLES) * 2 * Math.PI;
        let a = (theta - phase) % step;
        if (a < 0) a += step;
        radii.push(Math.cos(Math.PI / n) / Math.cos(a - Math.PI / n));
    }
    return radii;
}

function rgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

interface Slice { y: number; h: number; dx: number; }
interface Bar { y: number; h: number; x: number; len: number; color: string; }
interface Noise { x: number; y: number; w: number; h: number; color: string; }

// Visual "glitch" dos bugs: uma forma neon que se transforma, com separação de cores RGB,
// fatias deslocadas, listras e blocos de ruído. É só desenho: não mexe em colisão.
export class GlitchFx {
    public readonly graphic: Canvas;

    private readonly size: number;
    private readonly canvasSize: number;
    private readonly colors: string[];
    private readonly radii: number[][];

    private from: number = 0;
    private to: number = 0;
    private morphT: number = 1;
    private hold: number = rand(800, 1700); 

    // rajadas de glitch
    private burstLeft: number = 0;
    private nextBurst: number = rand(400, 1200);
    private external: number = 0;   
    private level: number = 0.15;  
    private flash: boolean = false; 
    private dirty: boolean = true;  

    private rollTimer: number = 0;
    private slices: Slice[] = [];
    private bars: Bar[] = [];
    private noise: Noise[] = [];
    private jitter: number[] = [];

    private scratch: HTMLCanvasElement;

    constructor(options: GlitchOptions) {
        this.size = options.size;
        this.canvasSize = Math.ceil(options.size * 1.8);
        this.colors = options.colors;
        this.radii = options.shapes.map(shapeRadii);
        this.scratch = document.createElement('canvas');
        this.scratch.width = this.canvasSize;
        this.scratch.height = this.canvasSize;
        this.roll();

        this.graphic = new Canvas({
            width: this.canvasSize,
            height: this.canvasSize,
            cache: true, 
            draw: (ctx) => this.render(ctx)
        });
    }

    public setIntensity(value: number): void {
        this.external = Math.max(0, Math.min(1, value));
    }

    public setFlash(on: boolean): void {
        if (on !== this.flash) {
            this.flash = on;
            this.dirty = true;
        }
    }

    public pulse(ms: number): void {
        this.burstLeft = Math.max(this.burstLeft, ms);
        this.roll();
    }

    public update(elapsedMs: number): void {
        if (this.morphT < 1) {
            this.dirty = true; 
            this.morphT = Math.min(1, this.morphT + elapsedMs / MORPH_MS);
            if (this.morphT >= 1) {
                this.from = this.to;
                this.hold = rand(800, 1700);
            }
        } else if (this.radii.length > 1) {
            this.hold -= elapsedMs;
            if (this.hold <= 0) {
                do { this.to = randInt(0, this.radii.length - 1); } while (this.to === this.from);
                this.morphT = 0;
                this.pulse(MORPH_MS + 60); // a troca de forma vem com uma rajada de glitch
            }
        }

        this.burstLeft -= elapsedMs;
        this.nextBurst -= elapsedMs;
        if (this.burstLeft <= 0 && this.nextBurst <= 0) {
            this.burstLeft = rand(120, 280);
            this.nextBurst = rand(600, 1600);
        }

        const newLevel = Math.max(0.15, this.burstLeft > 0 ? 0.9 : 0, this.external);
        if (newLevel !== this.level) this.dirty = true;
        this.level = newLevel;

        this.rollTimer -= elapsedMs;
        if (this.rollTimer <= 0) {
            this.roll();
        }

        if (this.dirty) {
            this.graphic.flagDirty();
            this.dirty = false;
        }
    }

    private roll(): void {
        const c = this.canvasSize;
        const strong = this.level > 0.5;
        this.rollTimer = strong ? 50 : 140;
        this.dirty = true;

        const sliceCount = Math.round(this.level * 4) + (strong ? 1 : 0);
        this.slices = [];
        for (let i = 0; i < sliceCount; i++) {
            const dx = Math.round(rand(2, this.size * 0.18 + 2) * this.level * (Math.random() < 0.5 ? -1 : 1));
            this.slices.push({ y: randInt(c * 0.2, c * 0.8), h: randInt(2, 6), dx });
        }

        const barCount = strong ? randInt(1, 3) : (Math.random() < 0.4 ? 1 : 0);
        this.bars = [];
        for (let i = 0; i < barCount; i++) {
            const len = randInt(c * 0.4, c);
            this.bars.push({
                y: randInt(c * 0.2, c * 0.8),
                h: randInt(2, 4),
                x: randInt(0, c - len),
                len,
                color: this.colors[randInt(0, this.colors.length - 1)]
            });
        }

        const noiseCount = Math.round(2 + this.level * 10);
        this.noise = [];
        for (let i = 0; i < noiseCount; i++) {
            const spread = this.size * 0.65;
            this.noise.push({
                x: Math.round(c / 2 + rand(-spread, spread)),
                y: Math.round(c / 2 + rand(-spread, spread)),
                w: randInt(1, 3),
                h: randInt(1, 2),
                color: Math.random() < 0.25 ? '#ffffff' : this.colors[randInt(0, this.colors.length - 1)]
            });
        }

        this.jitter = [];
        for (let i = 0; i < SAMPLES / 6; i++) {
            this.jitter.push(rand(-1, 1) * this.level * 0.14);
        }
    }

    private points(scale: number): { x: number; y: number }[] {
        const c = this.canvasSize / 2;
        const baseRadius = this.size * 0.6 * scale;
        const t = this.morphT * this.morphT * (3 - 2 * this.morphT); // suaviza a troca
        const a = this.radii[this.from];
        const b = this.radii[this.to];
        const pts: { x: number; y: number }[] = [];
        for (let k = 0; k < SAMPLES; k++) {
            const r = (a[k] + (b[k] - a[k]) * t) * (1 + this.jitter[Math.floor(k / 6)]) * baseRadius;
            const theta = (k / SAMPLES) * 2 * Math.PI;
            pts.push({ x: c + Math.cos(theta) * r, y: c + Math.sin(theta) * r });
        }
        return pts;
    }

    private path(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], ox: number, oy: number): void {
        ctx.beginPath();
        pts.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x + ox, p.y + oy);
            else ctx.lineTo(p.x + ox, p.y + oy);
        });
        ctx.closePath();
    }

    private render(ctx: CanvasRenderingContext2D): void {
        const c = this.canvasSize;
        ctx.clearRect(0, 0, c, c);

        const body = this.points(1);
        const core = this.points(0.7);
        const split = 1 + this.level * Math.max(2, this.size * 0.08); // quanto as cores se afastam

        ctx.globalCompositeOperation = 'lighter';
        this.path(ctx, body, -split, 0);
        ctx.fillStyle = rgba(this.colors[0], 0.9);
        ctx.fill();
        this.path(ctx, body, split, 0);
        ctx.fillStyle = rgba(this.colors[1 % this.colors.length], 0.9);
        ctx.fill();
        if (this.level > 0.4) {
            this.path(ctx, body, 0, split * 0.6);
            ctx.fillStyle = rgba(this.colors[2 % this.colors.length], 0.5);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        this.path(ctx, core, 0, 0);
        ctx.fillStyle = 'rgba(7,0,15,0.92)';
        ctx.fill();
        this.path(ctx, body, 0, 0);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.stroke();

        if (this.slices.length > 0) {
            const sctx = this.scratch.getContext('2d')!;
            sctx.clearRect(0, 0, c, c);
            sctx.drawImage(ctx.canvas, 0, 0, c, c, 0, 0, c, c);
            for (const s of this.slices) {
                ctx.clearRect(0, s.y, c, s.h);
                ctx.drawImage(this.scratch, 0, s.y, c, s.h, s.dx, s.y, c, s.h);
            }
        }

        for (const bar of this.bars) {
            const g = ctx.createLinearGradient(bar.x, 0, bar.x + bar.len, 0);
            g.addColorStop(0, rgba(bar.color, 0));
            g.addColorStop(0.3, rgba(bar.color, BAR_COLOR_ALPHA));
            g.addColorStop(0.7, rgba(bar.color, BAR_COLOR_ALPHA));
            g.addColorStop(1, rgba(bar.color, 0));
            ctx.fillStyle = g;
            ctx.fillRect(bar.x, bar.y, bar.len, bar.h);
        }

        for (const n of this.noise) {
            ctx.fillStyle = n.color;
            ctx.fillRect(n.x, n.y, n.w, n.h);
        }

        if (this.flash) {
            ctx.globalCompositeOperation = 'lighter';
            this.path(ctx, body, 0, 0);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
}