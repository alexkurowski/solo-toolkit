import { Menu, MenuItem, TFile, TFolder, Vault } from "obsidian";
import { Board } from "./board";
import { Deck } from "./deck";
import { Dnd } from "./dnd";
import { SubMenuItem, Vec2 } from "./types";
import standardImages from "src/icons/deck";
import tarotImages from "src/icons/tarot";
import { Dice } from "./dice";

export class VttApp {
  board: Board;
  decks: Deck[] = [];
  dice: Dice[] = [];
  dnd: Dnd;
  el: HTMLElement;
  menu: Menu;
  deckSubmenu: Menu;
  diceSubmenu: Menu;

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
    this.menu.addItem((item: MenuItem & SubMenuItem) => {
      item.setTitle("Add deck");
      this.deckSubmenu = item.setSubmenu();
    });
    this.addDefaultDecks();
    this.parseCustomDecks();
    this.menu.addItem((item: MenuItem & SubMenuItem) => {
      item.setTitle("Add dice");
      this.diceSubmenu = item.setSubmenu();
    });
    this.addDefaultDice();
    this.el.oncontextmenu = (event: MouseEvent) => {
      this.board.setMenuPosition();
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
  addDefaultDecks() {
    this.deckSubmenu.addItem((item: MenuItem) =>
      item.setTitle("Standard").onClick(() => {
        this.addDefaultDeck("standard", this.board.getMenuPosition());
      })
    );
    this.deckSubmenu.addItem((item: MenuItem) =>
      item.setTitle("Sarot").onClick(() => {
        this.addDefaultDeck("tarot", this.board.getMenuPosition());
      })
    );
  }

  parseCustomDecks() {
    const customDeckRoot = "Assets/Decks";
    const folder = this.vault.getFolderByPath(customDeckRoot);
    if (!folder?.children?.length) return;

    this.deckSubmenu.addSeparator();

    for (const child of folder.children) {
      if (!(child instanceof TFolder)) continue;
      this.deckSubmenu.addItem((item: MenuItem) =>
        item.setTitle(child.name).onClick(() => {
          this.addCustomDeck(child, this.board.getMenuPosition());
        })
      );
    }
  }

  addDefaultDice() {
    const dice = [4, 6, 8, 10, 12, 20];
    for (const die of dice) {
      this.diceSubmenu.addItem((item: MenuItem) => {
        item.setTitle(`d${die}`).onClick(() => {
          this.addDice(die, this.board.getMenuPosition());
        });
      });
    }
  }

  //
  // Actions
  //
  addDefaultDeck(type: "standard" | "tarot", position: Vec2) {
    const deck = new Deck(this.board, this, {
      position,
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

  addDice(size: number, position: Vec2) {
    const dice = new Dice(this.board, this, size, {
      position,
    });

    this.dice.push(dice);
  }

  removeDice(dice: Dice) {
    dice.el.remove();
    this.dice.splice(this.dice.indexOf(dice), 1);
  }
}
