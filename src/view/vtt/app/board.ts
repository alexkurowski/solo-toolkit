import { Menu, MenuItem, TFolder } from "obsidian";
import { Dnd } from "./dnd";
import { VttApp } from "./main";
import { Parent, Vec2 } from "./types";
import { newVec2 } from "./utils";

export class Board {
  dnd: Dnd;
  position: Vec2 = newVec2(-80, -80);
  contextMenuPosition: Vec2 = newVec2();
  zoom: number = 1;
  el: HTMLElement;
  menu: Menu;

  constructor(private parent: Parent, private ctx: VttApp) {
    this.dnd = this.parent.dnd;
    this.el = this.parent.el.createDiv("srt-vtt-board");
    this.el.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;

    this.menu = new Menu();
    this.parseDefaultDecks();
    this.parseCustomDecks();

    // parent.dnd.makeDraggable(this, {
    //   startDragOnParent: true,
    //   rightBtn: true,
    //   onMove: () => {
    //     this.parent.el.style.backgroundPosition = `${this.position.x}px ${this.position.y}px`;
    //   },
    //   onClick: (event: MouseEvent) => {
    //     const rect = this.parent.el.getBoundingClientRect();
    //     const offsetX = event.clientX - rect.left;
    //     const offsetY = event.clientY - rect.top;
    //     this.contextMenuPosition = {
    //       x: -this.position.x + offsetX,
    //       y: -this.position.y + offsetY,
    //     };
    //     this.menu.showAtMouseEvent(event);
    //   },
    // });

    this.el.oncontextmenu = (event: MouseEvent) => {
      const rect = this.parent.el.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      this.contextMenuPosition = {
        x: -this.position.x + offsetX,
        y: -this.position.y + offsetY,
      };
      this.menu.showAtMouseEvent(event);
    };
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

  parseDefaultDecks() {
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Add: standard").onClick(() => {
        this.ctx.addDefaultDeck("standard", this.contextMenuPosition);
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Add: tarot").onClick(() => {
        this.ctx.addDefaultDeck("tarot", this.contextMenuPosition);
      })
    );
  }

  parseCustomDecks() {
    const customDeckRoot = "Assets/Decks";
    const folder = this.ctx.vault.getFolderByPath(customDeckRoot);
    if (!folder) return;

    for (const child of folder.children) {
      if (!(child instanceof TFolder)) continue;
      this.menu.addItem((item: MenuItem) =>
        item.setTitle(`Add: ${child.name}`).onClick(() => {
          this.ctx.addCustomDeck(child, this.contextMenuPosition);
        })
      );
    }
  }
}
