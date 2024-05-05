import { randomFrom } from "./dice";
import { shuffle } from "./helpers";

const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const suits = ["heart", "diamond", "club", "spade"];

const max = values.length * suits.length;

export const drawCard = () => `${randomFrom(values)} of ${randomFrom(suits)}`;

type Card = [string, string];

export class Deck {
  cards: Card[] = [];
  public drawn: Card[] = [];
  addJokers: boolean = false;

  constructor() {
    this.shuffle();
  }

  draw(): Card {
    if (!this.cards.length) this.shuffle();
    const [value, suit] = this.cards.pop() as Card;
    this.drawn.push([value, suit]);
    return [value, suit];
  }

  shuffle() {
    this.cards = [];
    this.drawn = [];

    for (const value of values) {
      for (const suit of suits) {
        this.cards.push([value, suit]);
      }
    }

    if (this.addJokers) {
      this.cards.push(["Joker", "heart"]);
      this.cards.push(["Joker", "spade"]);
    }

    shuffle(this.cards);
  }

  size() {
    return this.max() - this.drawn.length;
  }

  max() {
    if (this.addJokers) {
      return max + 2;
    } else {
      return max;
    }
  }

  setJokers(value: boolean) {
    this.addJokers = value;
  }
}
