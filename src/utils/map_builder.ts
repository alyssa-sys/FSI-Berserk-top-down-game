import { Actor, Color, CollisionType, Rectangle, Scene, Vector, vec } from "excalibur";

export type WallSide = 'top' | 'bottom' | 'left' | 'right';

export class MapBuilder {
    private static PADDING_LEFT = 175; // Espaço do menu lateral
    private static PADDING_TOP = 110;  // Espaço das barras superiores
    private static PADDING_RIGHT = 35;
    private static PADDING_BOTTOM = 35;

    public static getRandomDoorSides(count: number): Set<WallSide> {
        const allSides: WallSide[] = ['top', 'bottom', 'left', 'right'];
        const selected = new Set<WallSide>();

        while (selected.size < count) {
            const randomIndex = Math.floor(Math.random() * allSides.length);
            selected.add(allSides[randomIndex]);
        }
        return selected;
    }

    public static buildMapWithDoors(scene: Scene, w: number, h: number, thickness: number, doorSides: Set<WallSide>): Vector[] {
        const wallColor = Color.Transparent;
        const doorSize = 80;
        const doorPositions: Vector[] = [];

        // Área útil jogável
        const playX = MapBuilder.PADDING_LEFT;
        const playY = MapBuilder.PADDING_TOP;
        const playW = w - MapBuilder.PADDING_LEFT - MapBuilder.PADDING_RIGHT;
        const playH = h - MapBuilder.PADDING_TOP - MapBuilder.PADDING_BOTTOM;
        
        // Parede Superior
        if (doorSides.has('top')) {
            const segmentWidth = (playW - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(playX + segmentWidth / 2, playY + thickness / 2), segmentWidth, thickness, wallColor);
            MapBuilder.addWallSegment(scene, vec(playX + playW - (segmentWidth / 2), playY + thickness / 2), segmentWidth, thickness, wallColor);
            doorPositions.push(vec(playX + playW / 2, playY + thickness / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(playX + playW / 2, playY - thickness / 2), doorSize, thickness);
        } else {
            MapBuilder.addWallSegment(scene, vec(playX + playW / 2, playY + thickness / 2), playW, thickness, wallColor);
        }

        // Parede Inferior
        if (doorSides.has('bottom')) {
            const segmentWidth = (playW - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(playX + segmentWidth / 2, playY + playH - thickness / 2), segmentWidth, thickness, wallColor);
            MapBuilder.addWallSegment(scene, vec(playX + playW - (segmentWidth / 2), playY + playH - thickness / 2), segmentWidth, thickness, wallColor);
            doorPositions.push(vec(playX + playW / 2, playY + playH - thickness / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(playX + playW / 2, playY + playH + thickness / 2), doorSize, thickness);
        } else {
            MapBuilder.addWallSegment(scene, vec(playX + playW / 2, playY + playH - thickness / 2), playW, thickness, wallColor);
        }

        // Parede Esquerda
        const availableHeight = playH - (thickness * 2);
        if (doorSides.has('left')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(playX + thickness / 2, playY + thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            MapBuilder.addWallSegment(scene, vec(playX + thickness / 2, playY + playH - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            doorPositions.push(vec(playX + thickness / 2, playY + playH / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(playX - thickness / 2, playY + playH / 2), thickness, doorSize);
        } else {
            MapBuilder.addWallSegment(scene, vec(playX + thickness / 2, playY + playH / 2), thickness, availableHeight, wallColor);
        }

        // Parede Direita
        if (doorSides.has('right')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(playX + playW - thickness / 2, playY + thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            MapBuilder.addWallSegment(scene, vec(playX + playW - thickness / 2, playY + playH - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            doorPositions.push(vec(playX + playW - thickness / 2, playY + playH / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(playX + playW + thickness / 2, playY + playH / 2), thickness, doorSize);
        } else {
            MapBuilder.addWallSegment(scene, vec(playX + playW - thickness / 2, playY + playH / 2), thickness, availableHeight, wallColor);
        }

        return doorPositions;
    }

    private static addWallSegment(scene: Scene, pos: Vector, width: number, height: number, color: Color): void {
        const wall = new Actor({ pos, width, height, collisionType: CollisionType.Fixed });
        wall.addTag('wall_col');
        wall.graphics.use(new Rectangle({ width, height, color }));
        scene.add(wall);
    }

    private static addInvisibleBarrier(scene: Scene, pos: Vector, width: number, height: number): void {
        const barrier = new Actor({ pos, width, height, collisionType: CollisionType.Fixed });
        barrier.addTag('barrier_col');
        scene.add(barrier);
    }
}