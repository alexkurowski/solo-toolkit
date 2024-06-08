export const ROOM_WIDTH = 12;
export const ROOM_HEIGHT = 12;

export type Cell = {
  x: number;
  y: number;
};

export type Room = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Connection = {
  ida: number;
  idb: number;
};

export type MapBlueprint = number[][];

export abstract class Map {
  abstract at(x: number, y: number): number;
}
