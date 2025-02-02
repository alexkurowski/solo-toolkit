import { Menu, MenuItem } from "obsidian";
import { Deck } from "./deck";
import { CardId, Parent, Vec2 } from "./types";
import { generateId, newVec2 } from "./utils";

export class Card {
  id: CardId = generateId("c");
  position: Vec2 = newVec2();
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

    this.el = this.parent.el.createDiv("srt-vtt-card");

    this.menu = new Menu();
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Turn").onClick(() => {
        this.turnBy(90);
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Flip").onClick(() => {
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

    this.parent.dnd.makeDraggable(this, {
      onClick: this.hide.bind(this),
      propagateClick: true,
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

  turnBy(degrees: number) {
    const currentTurn = this.el.classList.contains("srt-vtt-card-flip-90")
      ? 90
      : this.el.classList.contains("srt-vtt-card-flip-180")
      ? 180
      : this.el.classList.contains("srt-vtt-card-flip-270")
      ? 270
      : 0;

    let newTurn = currentTurn + degrees;
    if (newTurn >= 360) newTurn -= 360;
    if (newTurn < 0) newTurn += 360;

    this.el.classList.remove(
      "srt-vtt-card-flip-90",
      "srt-vtt-card-flip-180",
      "srt-vtt-card-flip-270"
    );
    this.el.classList.add(`srt-vtt-card-flip-${newTurn}`);
  }
}
