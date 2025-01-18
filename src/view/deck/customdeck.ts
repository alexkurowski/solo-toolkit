import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { trim, identity, Card, randomFrom, shuffle } from "../../utils";

export class CustomDeck {
  vault: Vault;
  type: string;
  cards: TFile[];
  deckCards: TFile[];
  cardsLength: number = 0;
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

  update(folder: TFolder) {
    this.deckCards = [];
    this.parseFolder(folder);
  }

  parseFolder(folder: TFolder) {
    this.flip = [0];

    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (this.supportedExtensions.includes(child.extension)) {
          this.deckCards.push(child);
        } else if (child.extension === "md") {
          this.vault.read(child).then((content: string) => {
            if (!content) return;

            const lines = content.split("\n").map(trim).filter(identity);

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
      // NOTE: Commented out to skip nested folders
      // if (child instanceof TFolder) {
      //   this.parseFolder(child);
      // }
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
        flip: 0,
      };
    }
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
    this.cardsLength = this.cards.length;
  }

  size(): [number, number] {
    return [this.cards.length, this.cardsLength];
  }
}
