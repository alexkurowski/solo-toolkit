import { Menu, MenuItem } from "obsidian";
import { Deck } from "./deck";
import { CardId, Parent, Vec2 } from "./types";
import { generateId, newVec2 } from "./utils";

export class Card {
  id: CardId = generateId("c");
  position: Vec2 = newVec2();
  rotation: number = 0;
  drawn: boolean = false;
  image: string;
  el: HTMLElement;
  menu: Menu;

  constructor(
    private parent: Parent,
    private deck: Deck,
    params?: Partial<Card>
  ) {
    if (params) Object.assign(this, params);

    // Create element
    this.el = this.parent.el.createDiv("srt-vtt-card");
    this.el.style.display = "none";
    this.el.style.backgroundImage = `url(${this.image})`;
    this.updateTransform();

    // Make draggable
    this.parent.dnd.makeDraggable(this, {
      propagateClick: true,
    });

    // Create context menu
    this.menu = new Menu();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Rotate").onClick(() => {
        this.turnBy(90);
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Rotate twice").onClick(() => {
        this.turnBy(180);
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Shuffle back").onClick(() => {
        this.hide();
        this.deck.shuffle();
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
      this.el.classList.add("srt-vtt-card-selected");
    } else {
      this.el.classList.remove("srt-vtt-card-selected");
    }
  }

  updateTransform() {
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px) rotate(${this.rotation}deg)`;
  }

  //
  // Event handlers
  //
  onClick() {
    this.parent.dnd.toggleSelect(this);
  }

  //
  // Card actions
  //
  drawAt(at: Vec2) {
    this.drawn = true;
    this.position = at;
    this.el.style.display = "";
    this.updateTransform();
    this.parent.dnd.moveToTop(this.el);
  }

  hide(event?: MouseEvent) {
    if (!event || event.shiftKey) {
      this.drawn = false;
      this.el.style.display = "none";
    }
  }

  turnBy(degrees: number) {
    this.rotation += degrees;
    if (this.rotation >= 360) this.rotation -= 360;
    if (this.rotation < 0) this.rotation += 360;
    this.updateTransform();
  }
}
