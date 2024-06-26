import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { Card } from "./deck";
import { randomFrom } from "./dice";
import { shuffle } from "./helpers";

export class CustomDeck {
  vault: Vault;
  type: string;
  cards: TFile[];
  deckCards: TFile[];
  flip: number[] = [0];

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
    this.parseFolder(folder);
    this.shuffle();
  }

  parseFolder(folder: TFolder) {
    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (this.supportedExtensions.includes(child.extension)) {
          this.deckCards.push(child);
        } else if (child.extension === "md") {
          this.vault.cachedRead(child).then((content: string) => {
            if (!content) return;

            const lines = content
              .split("\n")
              .map((line: string) => line.trim())
              .filter((line: string) => line);

            for (let line of lines) {
              line = line.toLowerCase();
              if (line === "flip") {
                this.flip = [0, 2];
              }
              if (line === "flip2") {
                this.flip = [0, 1];
              }
              if (line === "flip3") {
                this.flip = [0, 1, 3];
              }
              if (line === "flip4") {
                this.flip = [0, 1, 2, 3];
              }
            }
          });
        }
      }
      if (child instanceof TFolder) {
        this.parseFolder(child);
      }
    }
  }

  async draw(): Promise<Card> {
    if (!this.cards.length) this.shuffle();
    const file = this.cards.pop();

    try {
      if (!file) throw "No cards";
      const bytes = await this.vault.readBinary(file);
      const contentType =
        "image/" +
        file.extension.replace("jpg", "jpeg").replace("svg", "svg+xml");
      const image = `data:${contentType};base64,` + arrayBufferToBase64(bytes);
      return {
        image,
        flip: randomFrom(this.flip),
        file,
      };
    } catch (error) {
      return {
        image: "",
        flip: randomFrom(this.flip),
      };
    }
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.deckCards.length];
  }
}
