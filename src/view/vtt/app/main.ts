import {
  arrayBufferToBase64,
  Menu,
  MenuItem,
  TFile,
  TFolder,
  Vault,
} from "obsidian";
import { getDeck } from "src/utils";
import { Board } from "./board";
import { Deck } from "./deck";
import { Dnd } from "./dnd";
import { Vec2 } from "./types";
import standardImages from "src/icons/deck";
import tarotImages from "src/icons/tarot";

export class VttApp {
  board: Board;
  decks: Deck[] = [];
  dnd: Dnd;
  el: HTMLElement;
  menu: Menu;

  private supportedExtensions = {
    jpg: "jpg",
    jpeg: "jpg",
    png: "png",
    gif: "gif",
    webp: "webp",
    bmp: "bmp",
    svg: "svg",
  };

  constructor(el: Element, public vault: Vault, private fileData: string) {
    this.dnd = new Dnd();
    this.el = el as HTMLElement;

    this.board = new Board(this);

    this.menu = new Menu();
    this.parseDefaultDecks();
    this.parseCustomDecks();
    this.el.oncontextmenu = (event: MouseEvent) => {
      this.menu.showAtMouseEvent(event);
    };
  }

  update(fileData: string) {
    this.fileData = fileData;
  }

  clear() {
    this.dnd.cleanup();
  }

  //
  // Deck parser
  //
  parseDefaultDecks() {
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Add: standard").onClick(() => {
        this.addDefaultDeck("standard", this.board.getMousePosition());
      })
    );
    this.menu.addItem((item: MenuItem) =>
      item.setTitle("Add: tarot").onClick(() => {
        this.addDefaultDeck("tarot", this.board.getMousePosition());
      })
    );
  }

  parseCustomDecks() {
    const customDeckRoot = "Assets/Decks";
    const folder = this.vault.getFolderByPath(customDeckRoot);
    if (!folder) return;

    for (const child of folder.children) {
      if (!(child instanceof TFolder)) continue;
      this.menu.addItem((item: MenuItem) =>
        item.setTitle(`Add: ${child.name}`).onClick(() => {
          this.addCustomDeck(child, this.board.getMousePosition());
        })
      );
    }
  }

  //
  // Actions
  //
  addDefaultDeck(type: "standard" | "tarot", position: Vec2) {
    const deck = new Deck(this.board, this, {
      position,
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    });

    if (type === "standard") {
      for (const key in standardImages) {
        if (key === "JokerBlack" || key === "JokerRed") continue;
        const image =
          "data:image/png;base64," +
          standardImages[key as keyof typeof standardImages];
        deck.addCard({ image });
      }
    } else {
      for (const key in tarotImages) {
        if (key === "JokerBlack" || key === "JokerRed") continue;
        const image =
          "data:image/png;base64," +
          tarotImages[key as keyof typeof tarotImages];
        deck.addCard({ image });
      }
    }

    deck.shuffle();
    this.decks.push(deck);
  }

  addCustomDeck(folder: TFolder, position: Vec2) {
    const deck = new Deck(this.board, this, {
      position,
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    });

    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (child.extension in this.supportedExtensions) {
          const image = this.vault.getResourcePath(child);
          deck.addCard({ image });
        }
      }
    }

    deck.shuffle();
    this.decks.push(deck);
  }

  removeDeck(deck: Deck) {
    deck.cards.forEach((card) => card.el.remove());
    deck.el.remove();
    this.decks.splice(this.decks.indexOf(deck), 1);
  }
}
