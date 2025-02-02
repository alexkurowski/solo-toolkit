import { IdType, Vec2 } from "./types";

const generateString = () => Math.random().toString(36).substring(2, 8);
export const generateId = <Id extends IdType>(type: Id): `${Id}${string}` =>
  `${type}${generateString()}${generateString()}`;

export const identity = <T>(value: T): T => value;

export const newVec2 = (x: number = 0, y: number = 0): Vec2 => {
  return { x, y };
};
