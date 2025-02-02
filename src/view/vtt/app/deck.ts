import { DeckId, Parent, Vec2 } from "./types";
import { Card } from "./card";
import { generateId, newVec2 } from "./utils";
import { Menu, MenuItem } from "obsidian";
import { VttApp } from "./main";
import { shuffle } from "../../../utils";

export class Deck {
  id: DeckId = generateId("d");
  position: Vec2 = newVec2();
  cards: Card[] = [];
  image: string;
  el: HTMLElement;
  menu: Menu;

  constructor(
    private parent: Parent,
    private ctx: VttApp,
    params?: Partial<Deck>
  ) {
    if (params) Object.assign(this, params);

    // Create element
    this.el = this.parent.el.createDiv("srt-vtt-deck");
    this.el.createDiv("srt-vtt-deck-bg");
    this.el.createDiv("srt-vtt-deck-fg");
    this.el.createDiv("srt-vtt-deck-border");

    // Make draggable
    this.parent.dnd.makeDraggable(this, {
      onClick: this.draw.bind(this),
    });

    // Create context menu
    this.menu = new Menu();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Draw").onClick(() => {
        this.draw();
      })
    );
    this.menu.addSeparator();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Shuffle").onClick(() => {
        this.shuffle();
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Reset").onClick(() => {
        this.reset();
      })
    );
    this.menu.addSeparator();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Remove").onClick(() => {
        this.destroy();
      })
    );
    this.el.oncontextmenu = (event: MouseEvent) => {
      event.stopPropagation();
      this.menu.showAtMouseEvent(event);
    };

    // Finish up elements
    this.el.style.backgroundImage = `url(${this.image})`;
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }

  addCard(newCard: Partial<Card>) {
    const card = new Card(this.parent, newCard);
    this.cards.push(card);
  }

  removeCard(card: Card) {
    this.cards.splice(this.cards.indexOf(card), 1);
  }

  shuffle() {
    shuffle(this.cards);
  }

  reset() {
    for (const card of this.cards) {
      card.hide();
    }
    this.shuffle();
  }

  draw() {
    const card = this.cards.find((card) => !card.drawn);
    if (card) {
      const at = {
        x: this.position.x + 120,
        y: this.position.y - 2,
      };
      while (
        this.cards.find(
          (card) =>
            card.drawn && card.position.x === at.x && card.position.y === at.y
        )
      ) {
        at.x += 20;
      }
      card.draw(at);
    }
  }

  destroy() {
    for (const card of this.cards) {
      card.el.remove();
    }
    this.el.remove();
    this.ctx.decks.splice(this.ctx.decks.indexOf(this), 1);
  }
}
