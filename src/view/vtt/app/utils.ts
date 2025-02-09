import { IdType, Vec2 } from "./types";

export const SNAP = false;
export const SNAP_GRID = 20;
export const CARD_WIDTH = 96;
export const CARD_HEIGHT = 136;
export const DICE_SIZE = 56;

export const generateString = () => Math.random().toString(36).substring(2, 8);
export const generateId = <Id extends IdType>(type: Id): `${Id}${string}` =>
  `${type}${generateString()}${generateString()}`;

export const identity = <T>(value: T): T => value;

export const newVec2 = (x: number = 0, y: number = 0): Vec2 => {
  return { x, y };
};

export const moveToTop = (el: HTMLElement) => {
  el.parentElement?.appendChild(el);
};

export const snap = (value: number): number =>
  Math.floor(value / SNAP_GRID) * SNAP_GRID;
