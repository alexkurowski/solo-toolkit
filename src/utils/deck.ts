import { randomFrom } from "./dice";
import { shuffle } from "./helpers";

export interface Card {
  image: string;
  flip?: number;
}

export class DefaultDeck {
  type: string;
  cards: string[];
  deckCards: string[];
  flip: number[] = [0, 2];

  constructor(type: string, data: Record<string, string>) {
    this.type = type;

    this.cards = [];
    this.deckCards = Object.values(data);
    this.shuffle();
  }

  async draw(): Promise<Card> {
    if (!this.cards.length) this.shuffle();
    const value = this.cards.pop() || "";
    return {
      image: "data:image/jpeg;base64," + value,
      flip: randomFrom(this.flip),
    };
  }

  shuffle() {
    this.cards = [...this.deckCards];
    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.deckCards.length];
  }
}
