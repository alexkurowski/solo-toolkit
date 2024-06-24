import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { shuffle } from "./helpers";

export class CustomDeck {
  vault: Vault;
  type: string;
  cards: string[];
  deckCards: string[];

  private supportedExtensions = ["jpg", "jpeg", "png"];

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
        if (this.supportedExtensions.includes(child.extension)) {
          this.vault.readBinary(child).then((value) => {
            this.deckCards.push(
              `data:image/${child.extension};base64,` +
                arrayBufferToBase64(value)
            );
          });
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
