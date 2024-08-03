import { random, randomFrom } from "../dice";
import { capitalize } from "../helpers";
import { Oracle, BaseOracle, Word } from "./shared";

const answers: Record<number, Word[]> = {
  6: ["yes", "and"],
  5: ["yes"],
  4: ["yes", "but"],
  3: ["no", "but"],
  2: ["no"],
  1: ["no", "and"],
};

const EVENT_TYPES = [
  ["positive", "negative", "neutral"],
  ["character", "faction", "environment"],
  ["event"],
];

export class Standard2Oracle extends BaseOracle implements Oracle {
  eventCounter = 0;
  eventsEnabled = false;

  getAnswer(variant: string): string {
    const modifier = parseInt(variant) || 0;
    const roll = this.roll() + modifier;
    const id = Math.min(Math.max(1, roll), 6);

    let event = false;
    if (this.roll() === 6) {
      this.eventCounter++;
      if (this.eventCounter >= 3) {
        this.eventCounter = 0;
        event = true;
      }
    }

    const words: Word[] = [...answers[id]];

    let answer = this.formatAnswer(this.joinAnswer(words));
    if (event) answer += " + " + this.event();

    return answer;
  }

  setConfig(opts: { events: boolean }) {
    this.eventsEnabled = opts.events;
  }

  private event(): string {
    if (this.eventsEnabled) {
      return EVENT_TYPES.map((words) => randomFrom(words)).join(" ");
    } else {
      return this.getWord("event");
    }
  }

  private joinAnswer(words: Word[]): string {
    const result = words.map((word) => this.getWord(word)).join(" ");
    return capitalize(result);
  }

  private roll(): number {
    return random(1, 6);
  }
}
