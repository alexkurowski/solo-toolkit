import { shuffle } from "./helpers";

export class DefaultDeck {
  type: string;
  cards: string[];
  deckCards: string[];

  constructor(type: string, data: Record<string, string>) {
    this.type = type;

    this.cards = [];
    this.deckCards = Object.values(data);
    this.shuffle();
  }

  draw(): ["DefaultImage", string] {
    if (!this.cards.length) this.shuffle();
    const value = this.cards.pop() || "";
    return ["DefaultImage", "data:image/png;base64," + value];
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.deckCards.length];
  }
}
