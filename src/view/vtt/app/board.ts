import { Dnd } from "./dnd";
import { Parent, Vec2 } from "./types";
import { newVec2 } from "./utils";

export class Board {
  dnd: Dnd;
  position: Vec2 = newVec2();
  zoom: number = 1;
  el: HTMLElement;

  constructor(private parent: Parent) {
    this.dnd = this.parent.dnd;
    this.el = this.parent.el.createDiv("srt-vtt-board");
    parent.dnd.makeDraggable(this, {
      startDragOnParent: true,
      rightBtn: true,
      onMove: () => {
        this.parent.el.style.backgroundPosition = `${this.position.x}px ${this.position.y}px`;
      },
    });
    this.el.parentElement?.addEventListener(
      "mousewheel",
      this.handleScroll.bind(this)
    );
  }

  handleScroll(event: WheelEvent) {
    this.position.x -= event.deltaX;
    this.position.y -= event.deltaY;
    this.parent.el.style.backgroundPosition = `${this.position.x}px ${this.position.y}px`;
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }
}
