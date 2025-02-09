import { DeckId, Parent, Vec2 } from "./types";
import { Card } from "./card";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  generateId,
  newVec2,
  snap,
  SNAP,
  SNAP_GRID,
} from "./utils";
import { Menu, MenuItem } from "obsidian";
import { VttApp } from "./main";
import { randomFrom, shuffle } from "../../../utils";

const FLIP_ROTATION: Record<number, number[]> = {
  1: [0, 180],
  2: [0, 90],
  3: [0, 90, 270],
  4: [0, 90, 180, 270],
};

export class Deck {
  id: DeckId = generateId("d");
  position: Vec2 = newVec2();
  rotation: number = 0;
  size: Vec2 = newVec2(CARD_WIDTH, CARD_HEIGHT);
  cards: Card[] = [];
  flip: number = 0;
  image: string;
  el: HTMLElement;
  menu: Menu;
  rotateMenuItem: MenuItem;

  constructor(
    private parent: Parent,
    private ctx: VttApp,
    params?: Partial<Deck>
  ) {
    if (params) Object.assign(this, params);

    // Create element
    this.el = this.parent.el.createDiv("srt-vtt-deck");
    this.el.createDiv("srt-vtt-deck-bg");
    this.el.createEl(this.image ? "img" : "div", {
      attr: {
        class: "srt-vtt-deck-fg",
        src: this.image,
      },
    });
    this.el.createDiv("srt-vtt-deck-border");
    this.el.style.width = `${this.size.x}px`;
    this.el.style.height = `${this.size.y}px`;
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
    this.menu.addItem((item: MenuItem) => {
      this.rotateMenuItem = item;
      item.setTitle("Rotate").onClick(() => {
        if (this.flip) {
          this.setFlip(0);
        } else {
          this.setFlip(1);
        }
      });
    });
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
    let x = this.position.x;
    let y = this.position.y;
    if (SNAP) {
      x = snap(x);
      y = snap(y);
    }
    this.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  //
  // Event handlers
  //
  onClick() {
    this.drawCard();
    this.parent.dnd.deselectAll();
  }

  onLongClick() {
    this.parent.dnd.toggleSelect(this);
  }

  onDrop() {
    if (SNAP) {
      this.snapToGrid();
    }
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

  setFlip(newFlip: number) {
    this.flip = newFlip;
    this.rotateMenuItem.setChecked(newFlip > 0);
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
        x: this.position.x + this.size.x + SNAP_GRID,
        y: this.position.y,
      };
      if (SNAP) {
        at.x = snap(at.x);
        at.y = snap(at.y);
      }
      while (
        this.cards.find(
          (card) =>
            card.drawn && card.position.x === at.x && card.position.y === at.y
        )
      ) {
        at.x += SNAP_GRID * 2;
      }
      if (this.flip) {
        const possibleRotations = FLIP_ROTATION[this.flip];
        if (possibleRotations) {
          card.rotation = randomFrom(possibleRotations);
        }
      }
      card.drawAt(at);
    }
  }

  private snapToGrid() {
    this.position.x = snap(this.position.x);
    this.position.y = snap(this.position.y);
  }
}
