import { arrayBufferToBase64, Vault } from "obsidian";
import { Card } from "./types";
import { randomFrom, shuffle, getDeck } from "../../utils";

type Path = string;

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
    const deck = getDeck(folderName);
    if (deck) {
      for (const key of deck) {
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
        original: path,
        image,
        flip: randomFrom(this.flip),
        path,
      };
    } catch (error) {
      return {
        original: "",
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

  shuffleIn(card: string) {
    if (card && this.cards.indexOf(card) === -1) {
      this.cards.push(card);
      shuffle(this.cards);
    }
  }

  size(): [number, number] {
    return [this.cards.length, this.cardsLength];
  }
}
