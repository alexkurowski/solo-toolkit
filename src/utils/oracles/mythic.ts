import { random } from "../dice";
import { Oracle, BaseOracle } from "./shared";

const chart: Record<string, number[][]> = {
  certain: [
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
    [18, 90, 99],
    [19, 95, 100],
    [20, 99, 101],
    [20, 99, 101],
    [20, 99, 101],
  ],
  "nearly certain": [
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
    [18, 90, 99],
    [19, 95, 100],
    [20, 99, 101],
    [20, 99, 101],
  ],
  "very likely": [
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
    [18, 90, 99],
    [19, 95, 100],
    [20, 99, 101],
  ],
  likely: [
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
    [18, 90, 99],
    [19, 95, 100],
  ],
  "50/50": [
    [2, 10, 83],
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
    [18, 90, 99],
  ],
  unlikely: [
    [1, 5, 82],
    [2, 10, 83],
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
    [17, 85, 98],
  ],
  "very unlikely": [
    [0, 1, 81],
    [1, 5, 82],
    [2, 10, 83],
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
    [15, 75, 96],
  ],
  "nearly impossible": [
    [0, 1, 81],
    [0, 1, 81],
    [1, 5, 82],
    [2, 10, 83],
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
    [13, 65, 94],
  ],
  impossible: [
    [0, 1, 81],
    [0, 1, 81],
    [0, 1, 81],
    [1, 5, 82],
    [2, 10, 83],
    [3, 15, 84],
    [5, 25, 86],
    [7, 35, 88],
    [10, 50, 91],
  ],
};

const doubles = [11, 22, 33, 44, 55, 66, 77, 88, 99];

export class MythicOracle extends BaseOracle implements Oracle {
  factor: number = 5;

  constructor(factor: number) {
    super();
    this.factor = factor;
  }

  getAnswer(variant: string): string {
    const r = this.roll(); // roll
    const s = parseInt(r.toString()[0]); // single
    const odds = chart[variant][this.factor - 1];
    const yn = r <= odds[1];
    const ex = r <= odds[0] || r >= odds[2];
    const ev = doubles.includes(r) && s <= this.factor;
    return this.formatAnswer(
      [
        ex ? this.getWord("extreme") : "",
        this.getWord(yn ? "yes" : "no"),
        ev ? `, ${this.getWord("event")}` : "",
      ].join(" ")
    );
  }

  changeFactor(by: number) {
    this.factor = Math.min(Math.max(1, this.factor + by), 9);
  }

  private roll(): number {
    return random(1, 100);
  }
}
