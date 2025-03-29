import { Vault, TFile, TFolder, arrayBufferToBase64 } from "obsidian";
import { DeckCard, DrawnCard } from "./types";
import { SoloToolkitView as View } from "../index";
import { trim, identity, randomFrom, shuffle } from "../../utils";

export class Deck {
  view: View;
  vault: Vault;
  type: string;
  cards: DeckCard[];
  deckCards: DeckCard[];
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
          this.deckCards.push({
            face: child,
          });
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
              this.deckCards.push({
                face: line,
              });
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

    // Arrange card backs
    for (let faceIdx = 0; faceIdx < this.deckCards.length; faceIdx++) {
      const faceCard = this.deckCards[faceIdx];
      if (!faceCard || !faceCard.face || faceCard.back) continue;

      const faceName =
        faceCard.face instanceof TFile ? faceCard.face.path : faceCard.face;

      if (faceName.includes("_back.")) continue;

      const backIdx = this.deckCards.findIndex((backCard) => {
        if (!backCard || !backCard.face || backCard.back) return false;

        const backName =
          backCard.face instanceof TFile ? backCard.face.path : backCard.face;

        if (!backName.includes("_back.")) return false;

        return faceName.startsWith(backName.replace(/_back\..*$/, ""));
      });

      if (backIdx === -1) continue;

      this.deckCards[faceIdx].back = this.deckCards[backIdx].face;
      this.deckCards.splice(backIdx, 1);
    }
  }

  async draw(): Promise<DrawnCard> {
    if (!this.cards.length) this.shuffle();
    const card = this.cards.pop();

    if (!card) throw "No cards";

    const drawnCard: DrawnCard = {
      card,
      faceImage: "",
      backImage: "",
      flip: randomFrom(this.flip),
    };

    if (typeof card.face === "string") {
      drawnCard.faceImage = card.face;
      drawnCard.url = card.face;
    } else {
      try {
        const bytes = await this.vault.readBinary(card.face);
        const contentType =
          "image/" +
          card.face.extension.replace("jpg", "jpeg").replace("svg", "svg+xml");
        const image =
          `data:${contentType};base64,` + arrayBufferToBase64(bytes);
        drawnCard.faceImage = image;
        drawnCard.file = card.face;
      } catch (error) {
        drawnCard.card = null;
        drawnCard.faceImage = "";
        drawnCard.flip = 0;
        return drawnCard;
      }
    }

    if (card.back) {
      if (typeof card.back === "string") {
        drawnCard.backImage = card.back;
      } else {
        try {
          const bytes = await this.vault.readBinary(card.back);
          const contentType =
            "image/" +
            card.back.extension
              .replace("jpg", "jpeg")
              .replace("svg", "svg+xml");
          const image =
            `data:${contentType};base64,` + arrayBufferToBase64(bytes);
          drawnCard.backImage = image;
        } catch (error) {
          return drawnCard;
        }
      }
    }

    return drawnCard;
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
    this.cardsLength = this.cards.length;
  }

  shuffleIn(card: DeckCard) {
    if (card && this.cards.indexOf(card) === -1) {
      this.cards.push(card);
      shuffle(this.cards);
    }
  }

  size(): [number, number] {
    return [this.cards.length, this.cardsLength];
  }
}
