import { arrayBufferToBase64, TFile, TFolder, Vault } from "obsidian";
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

    this.board = new Board(this, this);

    this.el.style.backgroundImage =
      "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAHFJREFUWIXt0bEJxDAUBNG1OBC/GPXf2KJEwTlyZnAwgRTsq2BgrjHGv6pkW7Z1mlZVkqTe++aUd8221lqac+5uefU7de2j7Q74kkAqgVQCqQRSCaQSSCWQSiCVQCqBVAKpBFIJpBJIJZBKIJVA6vjAG8fRFkLBinVjAAAAAElFTkSuQmCC)";
  }

  update(fileData: string) {
    this.fileData = fileData;
  }

  clear() {
    this.dnd.cleanup();
  }

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

  async addCustomDeck(folder: TFolder, position: Vec2) {
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
}
