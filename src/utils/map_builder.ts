import { Actor, Color, CollisionType, Rectangle, Scene, Vector, vec } from "excalibur";

export type WallSide = 'top' | 'bottom' | 'left' | 'right';

export class MapBuilder {
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
        const wallColor = Color.DarkGray;
        const doorSize = 80;
        const doorPositions: Vector[] = [];

        // Fundo do mapa
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
        scene.add(background);

        // Parede Superior
        if (doorSides.has('top')) {
            const segmentWidth = (w - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(segmentWidth / 2, thickness / 2), segmentWidth, thickness, wallColor);
            MapBuilder.addWallSegment(scene, vec(w - (segmentWidth / 2), thickness / 2), segmentWidth, thickness, wallColor);
            doorPositions.push(vec(w / 2, thickness / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(w / 2, -thickness / 2), doorSize, thickness);
        } else {
            MapBuilder.addWallSegment(scene, vec(w / 2, thickness / 2), w, thickness, wallColor);
        }

        // Parede Inferior
        if (doorSides.has('bottom')) {
            const segmentWidth = (w - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(segmentWidth / 2, h - thickness / 2), segmentWidth, thickness, wallColor);
            MapBuilder.addWallSegment(scene, vec(w - (segmentWidth / 2), h - thickness / 2), segmentWidth, thickness, wallColor);
            doorPositions.push(vec(w / 2, h - thickness / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(w / 2, h + thickness / 2), doorSize, thickness);
        } else {
            MapBuilder.addWallSegment(scene, vec(w / 2, h - thickness / 2), w, thickness, wallColor);
        }

        // Parede Esquerda
        const availableHeight = h - (thickness * 2);
        if (doorSides.has('left')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(thickness / 2, thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            MapBuilder.addWallSegment(scene, vec(thickness / 2, h - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            doorPositions.push(vec(thickness / 2, h / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(-thickness / 2, h / 2), thickness, doorSize);
        } else {
            MapBuilder.addWallSegment(scene, vec(thickness / 2, h / 2), thickness, availableHeight, wallColor);
        }

        // Parede Direita
        if (doorSides.has('right')) {
            const segmentHeight = (availableHeight - doorSize) / 2;
            MapBuilder.addWallSegment(scene, vec(w - thickness / 2, thickness + (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            MapBuilder.addWallSegment(scene, vec(w - thickness / 2, h - thickness - (segmentHeight / 2)), thickness, segmentHeight, wallColor);
            doorPositions.push(vec(w - thickness / 2, h / 2));
            MapBuilder.addInvisibleBarrier(scene, vec(w + thickness / 2, h / 2), thickness, doorSize);
        } else {
            MapBuilder.addWallSegment(scene, vec(w - thickness / 2, h / 2), thickness, availableHeight, wallColor);
        }

        return doorPositions;
    }

    private static addWallSegment(scene: Scene, pos: Vector, width: number, height: number, color: Color): void {
        const wall = new Actor({ pos, width, height, collisionType: CollisionType.Fixed });
        wall.graphics.use(new Rectangle({ width, height, color }));
        scene.add(wall);
    }

    private static addInvisibleBarrier(scene: Scene, pos: Vector, width: number, height: number): void {
        const barrier = new Actor({ pos, width, height, collisionType: CollisionType.Fixed });
        scene.add(barrier);
    }
}