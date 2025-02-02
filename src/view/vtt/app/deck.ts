import { DeckId, Parent, Vec2 } from "./types";
import { Card } from "./card";
import { newVec2 } from "./utils";

export class Deck {
  id: DeckId;
  position: Vec2 = newVec2();
  image: string;
  cards: Card[] = [];
  el: HTMLElement;

  constructor(private parent: Parent, params?: Partial<Deck>) {
    this.el = this.parent.el.createDiv("srt-vtt-deck");
    this.el.createDiv("srt-vtt-deck-bg");
    this.el.createDiv("srt-vtt-deck-fg");
    this.el.createDiv("srt-vtt-deck-border");
    this.parent.dnd.makeDraggable(this, {
      onClick: this.draw.bind(this),
    });
    if (params) Object.assign(this, params);

    this.el.style.backgroundImage = `url(${this.image})`;
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }

  draw() {
    const card = this.cards.find((card) => !card.drawn);
    if (card) {
      card.draw({
        x: this.position.x + 120,
        y: this.position.y,
      });
    }
  }
}
