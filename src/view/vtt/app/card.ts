import { CardId, Parent, Vec2 } from "./types";
import { newVec2 } from "./utils";

export class Card {
  id: CardId;
  position: Vec2 = newVec2();
  image: string;
  el: HTMLElement;
  drawn: boolean = false;

  constructor(private parent: Parent, params?: Partial<Card>) {
    this.el = this.parent.el.createDiv("srt-vtt-card");
    this.parent.dnd.makeDraggable(this, {
      onClick: this.hide.bind(this),
    });
    if (params) Object.assign(this, params);

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

  hide(event: MouseEvent) {
    if (event.shiftKey) {
      this.drawn = false;
      this.el.style.display = "none";
    }
  }
}
