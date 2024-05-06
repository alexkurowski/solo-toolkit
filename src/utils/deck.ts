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

type Card = [string, string];

export class Deck {
  cards: Card[] = [];
  max: number = 52;
  addJokers: boolean = false;

  constructor(addJokers: boolean = false) {
    this.addJokers = addJokers;
    this.shuffle();
  }

  draw(): Card {
    if (!this.cards.length) this.shuffle();
    const [value, suit] = this.cards.pop() as Card;
    return [value, suit];
  }

  shuffle() {
    this.cards = [];

    for (const value of values) {
      for (const suit of suits) {
        this.cards.push([value, suit]);
      }
    }

    if (this.addJokers) {
      this.cards.push(["Joker", "red"]);
      this.cards.push(["Joker", "black"]);
    }

    this.max = this.cards.length;
    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.max];
  }

  setJokers(value: boolean) {
    this.addJokers = value;
  }
}
