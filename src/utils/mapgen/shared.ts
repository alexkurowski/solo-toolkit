export const MAP_WIDTH = 24;
export const MAP_HEIGHT = 24;

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

export abstract class Map {
  abstract at(x: number, y: number): number;
}
