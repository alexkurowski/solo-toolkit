import { CardId, Parent, Vec2 } from "./types";
import { generateId, newVec2 } from "./utils";

export class Card {
  id: CardId = generateId("c");
  position: Vec2 = newVec2();
  drawn: boolean = false;
  image: string;
  el: HTMLElement;

  constructor(private parent: Parent, params?: Partial<Card>) {
    if (params) Object.assign(this, params);

    this.el = this.parent.el.createDiv("srt-vtt-card");
    this.parent.dnd.makeDraggable(this, {
      onClick: this.hide.bind(this),
    });

    this.el.style.display = "none";
    this.el.style.backgroundImage = `url(${this.image})`;
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }

  draw(at: Vec2) {
    this.drawn = true;
    this.position = at;
    this.el.style.display = "";
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    this.parent.dnd.moveToTop(this.el);
  }

  hide(event?: MouseEvent) {
    if (!event || event.shiftKey) {
      this.drawn = false;
      this.el.style.display = "none";
    }
  }
}
