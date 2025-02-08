import { Menu } from "obsidian";
import { Dnd } from "./dnd";

export type Vec2 = {
  x: number;
  y: number;
};

export interface Draggable {
  id: string;
  position: Vec2;
  el: HTMLElement;
  updateTransform: () => void;
  updateSelected: (isSelected: boolean) => void;
  onClick?: (event?: MouseEvent) => void;
  onLongClick?: (event?: MouseEvent) => void;
  onDrag?: () => void;
  onMove?: () => void;
  onDrop?: () => void;
}

export interface DraggableOptions {
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

export type SubMenuItem = {
  setSubmenu: () => Menu;
}
