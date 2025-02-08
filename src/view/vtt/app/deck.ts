import { DeckId, Parent, Vec2 } from "./types";
import { Card } from "./card";
import { generateId, newVec2 } from "./utils";
import { Menu, MenuItem } from "obsidian";
import { VttApp } from "./main";
import { shuffle } from "../../../utils";

export class Deck {
  id: DeckId = generateId("d");
  position: Vec2 = newVec2();
  rotation: number = 0;
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
    this.el.style.backgroundImage = `url(${this.image})`;
    this.updateTransform();

    // Make draggable
    this.parent.dnd.makeDraggable(this);

    // Create context menu
    this.menu = new Menu();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Draw").onClick(() => {
        this.drawCard();
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Shuffle").onClick(() => {
        this.reset();
      })
    );
    this.menu.addSeparator();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Remove").onClick(() => {
        this.ctx.removeDeck(this);
      })
    );
    this.el.oncontextmenu = (event: MouseEvent) => {
      event.stopPropagation();
      this.menu.showAtMouseEvent(event);
    };
  }

  //
  // Element updates
  //
  updateSelected(isSelected: boolean) {
    if (isSelected) {
      this.el.classList.add("srt-vtt-deck-selected");
    } else {
      this.el.classList.remove("srt-vtt-deck-selected");
    }
  }

  updateTransform() {
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }

  //
  // Event handlers
  //
  onClick() {
    this.drawCard();
  }

  onLongClick() {
    this.parent.dnd.toggleSelect(this);
  }

  //
  // Deck actions
  //
  addCard(newCard: Partial<Card>) {
    const card = new Card(this.parent, this, newCard);
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

  drawCard() {
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
        at.x += 30;
      }
      card.drawAt(at);
    }
  }
}
