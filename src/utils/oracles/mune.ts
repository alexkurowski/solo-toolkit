import { random } from "../dice";
import { capitalize } from "../helpers";
import { AnswerVariant, Language, Word, Oracle, BaseOracle } from "./shared";

const answers: Record<number, Word[]> = {
  6: ["yes", "and"],
  5: ["yes"],
  4: ["yes", "but"],
  3: ["no", "but"],
  2: ["no"],
  1: ["no", "and"],
};

export class MuneOracle extends BaseOracle implements Oracle {
  eventCounter: number = 0;
  language: Language = "en";
  kanjiLanguages: Language[] = ["ja", "zh"];

  setLanguage(newValue: Language) {
    this.language = newValue;
  }

  getAnswer(variant: AnswerVariant): string {
    const rolls =
      variant === "mid" ? [this.roll()] : [this.roll(), this.roll()];
    const id: number =
      variant === "low"
        ? Math.min(...rolls)
        : variant === "high"
        ? Math.max(...rolls)
        : rolls[0];
    let event = false;
    if (rolls.includes(6)) {
      this.eventCounter++;
      if (this.eventCounter >= 3) {
        this.eventCounter = 0;
        event = true;
      }
    }

    const answer: Word[] = [...answers[id]];
    if (event) answer.push("event");

    return this.formatAnswer(this.joinAnswer(answer));
  }

  private joinAnswer(words: Word[]): string {
    const result = words.map((word) => this.getWord(word)).join(", ");
    return capitalize(result);
  }

  private roll(): number {
    return random(1, 6);
  }
}
