import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  TFile,
  Vault,
} from "obsidian";
import { randomFrom } from "./dice";
import { shuffle } from "./helpers";

export interface Card {
  image: string;
  flip?: number;
  file?: TFile;
  path?: string;
}

type Path = string;

const deckMemo: Record<string, string[]> = {};

export class DefaultDeck {
  vault: Vault;
  type: string;
  excludedKeys: string[];
  cards: Path[];
  deckCards: Path[];
  cardsLength: number = 0;
  flip: number[] = [0, 2];

  constructor(type: string, vault: Vault, excludedKeys: string[] = []) {
    this.vault = vault;
    this.type = type;

    this.excludedKeys = excludedKeys;
    this.cards = [];
    this.deckCards = [];
    this.parseFolder();
    this.shuffle();
  }

  update(excludedKeys: string[] = []) {
    this.excludedKeys = excludedKeys;
    this.deckCards = [];
    this.parseFolder();
  }

  parseFolder() {
    const folderName = this.type.toLowerCase();
    const folderPath =
      this.vault.configDir + "/plugins/solo-rpg-toolkit/decks/" + folderName;
    if (deckMemo[folderName]) {
      for (const key of deckMemo[folderName]) {
        if (this.excludedKeys.includes(key)) continue;
        const fileName = `${key}.png`;
        this.deckCards.push(folderPath + "/" + fileName);
      }
    }
  }

  async draw(): Promise<Card> {
    if (!this.cards.length) this.shuffle();
    const path = this.cards.pop() || "";

    try {
      if (!path) throw "No cards";
      const bytes = await this.vault.adapter.readBinary(path);
      const contentType = "image/png";
      const image = `data:${contentType};base64,` + arrayBufferToBase64(bytes);
      return {
        image,
        flip: randomFrom(this.flip),
        path,
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

export const exportDeck = async (
  vault: Vault,
  folderName: string,
  data: Record<string, string>
) => {
  const adapter = vault.adapter;
  const basePath =
    vault.configDir + "/plugins/solo-rpg-toolkit/decks/" + folderName;

  try {
    await adapter.mkdir(basePath);
    const existingFiles = await adapter.list(basePath);
    await Promise.all(
      Object.keys(data)
        .filter((key) => {
          const filename = `${key}.png`;
          return !existingFiles.files?.includes(basePath + "/" + filename);
        })
        .map(async (key) => {
          const filename = `${key}.png`;
          return adapter.writeBinary(
            basePath + "/" + filename,
            base64ToArrayBuffer(data[key].trim())
          );
        })
    );
    deckMemo[folderName] = Object.keys(data);
  } catch (error) {
    // Failed to export deck images
  }
};
