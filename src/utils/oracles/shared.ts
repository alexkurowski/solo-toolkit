import { dictionary } from "../dictionary";
import { capitalize } from "../helpers";

export type Language = keyof typeof dictionary.oracle;
export type Word = keyof typeof dictionary.oracle.en;
export type AnswerVariant = "low" | "mid" | "high";

export interface Oracle {
  getAnswer: (variant: "low" | "mid" | "high") => string;
  setLanguage: (language: Language) => void;
}

const kanjiLanguages: Language[] = ["ja", "zh"];

export class BaseOracle {
  language: Language = "en";

  setLanguage(newValue: Language) {
    this.language = newValue;
  }

  protected formatAnswer(answer: string): string {
    answer = answer.replace(" , ", ", ");
    if (kanjiLanguages.includes(this.language)) {
      return answer.replace(/ /g, "").replace(",", "、").trim();
    } else {
      return capitalize(answer.trim());
    }
  }

  protected getWord(word: Word): string {
    if (dictionary.oracle[this.language]) {
      return dictionary.oracle[this.language][word];
    } else {
      return word;
    }
  }
}
