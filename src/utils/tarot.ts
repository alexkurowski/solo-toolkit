import { shuffle } from "./helpers";

const cards = [
  ["The Fool", "Young, vulnerable"],
  ["The Magician", "Skills, gifts"],
  ["The High Priestess", "Awareness, instincs"],
  ["The Empress", "Compassion, beauty"],
  ["The Emperor", "Leadership, power"],
  ["The Hierophant", "Spirituality, guidance"],
  ["The Lovers", "Relationship, growth"],
  ["The Chariot", "Drive, determination"],
  ["Strength", "Courage, fortitude"],
  ["The Hermit", "Calmness, solitude"],
  ["Wheel of Fortune", "Temporary, fleeting"],
  ["Justice", "Consquence, repercussion"],
  ["The Hanged Man", "Sacrifice, detachment"],
  ["Death", "Flow, new beginning"],
  ["Temperance", "Patience, moderation"],
  ["The Devil", "Powerlesness, restraint"],
  ["The Tower", "Destruction, crumble"],
  ["The Star", "Hope, healing"],
  ["The Moon", "Doubts, fears"],
  ["The Sun", "Optimism, joy"],
  ["Judgement", "Decision, resolve"],
  ["The World", "Fulfillment, completion"],
];

type Card = [string, string, number];

export class Tarot {
  cards: number[] = [];
  max: number = cards.length;

  constructor() {
    this.shuffle();
  }

  draw(): Card {
    if (!this.cards.length) this.shuffle();
    const index = this.cards.pop()!;
    const [value, suit] = cards[index];
    return [value, suit, index];
  }

  shuffle() {
    this.cards = [];
    for (let i = 0; i < this.max; i++) {
      this.cards.push(i);
    }

    shuffle(this.cards);
  }

  size(): [number, number] {
    return [this.cards.length, this.max];
  }
}
