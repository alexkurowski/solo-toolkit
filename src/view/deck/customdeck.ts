import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { Card } from "./types";
import { trim, identity, randomFrom, shuffle } from "../../utils";

export class CustomDeck {
  vault: Vault;
  type: string;
  cards: (TFile | string)[];
  deckCards: (TFile | string)[];
  cardsLength: number = 0;
  flip: number[] = [0];
  initialShuffleDone: boolean = false;

  private supportedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
  ];

  constructor(vault: Vault, folder: TFolder) {
    this.vault = vault;
    this.type = folder.name;

    this.cards = [];
    this.deckCards = [];
  }

  async update(folder: TFolder) {
    this.deckCards = [];
    await this.parseFolder(folder);
    if (!this.initialShuffleDone) {
      this.shuffle();
      this.initialShuffleDone = true;
    }
  }

  async parseFolder(folder: TFolder) {
    this.flip = [0];

    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (this.supportedExtensions.includes(child.extension)) {
          this.deckCards.push(child);
        } else if (child.extension === "md") {
          const content = await this.vault.read(child);
          if (!content) continue;

          const lines = content.split("\n").map(trim).filter(identity);

          for (let line of lines) {
            line = line.trim();
            const normalizedLine = line.toLowerCase();
            if (normalizedLine === "flip") {
              this.flip = [0, 2];
            }
            if (normalizedLine === "flip2") {
              this.flip = [0, 1];
            }
            if (normalizedLine === "flip3") {
              this.flip = [0, 1, 3];
            }
            if (normalizedLine === "flip4") {
              this.flip = [0, 1, 2, 3];
            }

            if (line.startsWith("http")) {
              this.deckCards.push(line);
            }
          }
        }
      }
      // NOTE: Commented out to skip nested folders
      // if (child instanceof TFolder) {
      //   this.parseFolder(child);
      // }
    }
  }

  async draw(): Promise<Card> {
    if (!this.cards.length) this.shuffle();
    const card = this.cards.pop();

    if (typeof card === "string") {
      return {
        original: card,
        image: card,
        flip: randomFrom(this.flip),
        url: card,
      };
    } else {
      try {
        if (!card) throw "No cards";
        const image = this.vault.getResourcePath(card);
        return {
          original: card,
          image,
          flip: randomFrom(this.flip),
          file: card,
        };
      } catch (error) {
        return {
          original: "",
          image: "",
          flip: 0,
        };
      }
    }
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
    this.cardsLength = this.cards.length;
  }

  shuffleIn(card: TFile | string) {
    if (card && this.cards.indexOf(card) === -1) {
      this.cards.push(card);
      shuffle(this.cards);
    }
  }

  size(): [number, number] {
    return [this.cards.length, this.cardsLength];
  }
}
