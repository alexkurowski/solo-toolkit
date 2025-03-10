import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { Card } from "./types";
import { SoloToolkitView as View } from "../index";
import { trim, identity, randomFrom, shuffle } from "../../utils";

export class Deck {
  view: View;
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

  constructor(view: View, folder: TFolder) {
    this.view = view;
    this.vault = view.app.vault;
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

    // Standard deck flip option
    if (
      (folder.name === "Standard" || folder.name === "Tarot") &&
      this.view.settings.deckFlip
    ) {
      this.flip = [0, 2];
    }

    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (this.supportedExtensions.includes(child.extension)) {
          this.deckCards.push(child);
        } else if (child.extension === "md") {
          const content = await this.vault.cachedRead(child);
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

    // Remove jokers option
    if (folder.name === "Standard" && !this.view.settings.deckJokers) {
      this.deckCards = this.deckCards.filter((card) => {
        if (card instanceof TFile) {
          if (card.name === "JokerBlack.png" || card.name === "JokerRed.png") {
            return false;
          }
        }
        return true;
      });
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
        const bytes = await this.vault.readBinary(card);
        const contentType =
          "image/" +
          card.extension.replace("jpg", "jpeg").replace("svg", "svg+xml");
        const image =
          `data:${contentType};base64,` + arrayBufferToBase64(bytes);
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
