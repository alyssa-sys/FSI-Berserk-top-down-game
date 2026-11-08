import { CollisionGroup } from 'excalibur';

export const PlayerGroup = new CollisionGroup(
  'player',
  0b0001,
  0b0110
);

export const EnemyGroup = new CollisionGroup(
  'enemy',
  0b0010,
  0b1101
);

export const StructureGroup = new CollisionGroup(
  'structure',
  0b0100,
  0b1011
);

export const BulletGroup = new CollisionGroup(
  'bullet',
  0b1000,
  0b0110
);