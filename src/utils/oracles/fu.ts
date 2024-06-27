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

export class FuOracle extends BaseOracle implements Oracle {
  language: Language = "en";
  kanjiLanguages: Language[] = ["ja", "zh"];

  setLanguage(newValue: Language) {
    this.language = newValue;
  }

  getAnswer(variant: AnswerVariant): string {
    if (variant === "low") {
      const answer = answers[Math.min(this.roll(), this.roll())];
      return this.formatAnswer(this.joinAnswer(answer));
    } else if (variant === "high") {
      const answer = answers[Math.max(this.roll(), this.roll())];
      return this.formatAnswer(this.joinAnswer(answer));
    } else {
      const answer = answers[this.roll()];
      return this.formatAnswer(this.joinAnswer(answer));
    }
  }

  private joinAnswer(words: Word[]): string {
    const result = words.map((word) => this.getWord(word)).join(", ");
    return capitalize(result);
  }

  private roll(): number {
    return random(1, 6);
  }
}
