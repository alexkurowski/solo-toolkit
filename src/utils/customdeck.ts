import { Vault, TFile, TFolder } from "obsidian";
import { shuffle } from "./helpers";

export class CustomDeck {
  vault: Vault;
  type: string;
  cards: string[];
  deckCards: string[];

  constructor(vault: Vault, folder: TFolder) {
    this.vault = vault;
    this.type = folder.name;

    this.cards = [];
    this.deckCards = [];
    this.parseFolder(folder);
    this.shuffle();
  }

  parseFolder(folder: TFolder) {
    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (child.extension === "jpg" || child.extension === "png") {
          this.deckCards.push(this.vault.getResourcePath(child));
        }
      }
      if (child instanceof TFolder) {
        this.parseFolder(child);
      }
    }
  }

  draw(): ["CustomImage" | "CustomText", string] {
    if (!this.cards.length) this.shuffle();
    const value = this.cards.pop() || "";
    return ["CustomImage", value];
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.deckCards.length];
  }
}
