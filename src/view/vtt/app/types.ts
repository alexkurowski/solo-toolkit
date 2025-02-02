import { Dnd } from "./dnd";

export type Vec2 = {
  x: number;
  y: number;
};

export interface Draggable {
  position: Vec2;
  el: HTMLElement;
}

export interface DragOptions {
  modifyMovement?: (nextPosition: Vec2) => Vec2;
  modifyPosition?: (nextPosition: Vec2) => Vec2;
  modifyTransform?: (nextTransform: string) => string;
  onDrag?: () => void;
  onMove?: () => void;
  onDrop?: () => void;
  onClick?: (event?: MouseEvent) => void;
  startDragOnParent?: boolean;
  rightBtn?: boolean;
  propagateClick?: boolean;
}

export interface Parent {
  dnd: Dnd;
  el: HTMLElement;
}

export type CardId = `c${string}`;
export type DeckId = `d${string}`;
export type DiceId = `r${string}`;
export type IdType = CardId | DeckId | DiceId;
