import { random } from "./dice";
import { capitalize } from "./helpers";
import { dictionary } from "./dictionary";

type Language = keyof typeof dictionary.oracle;
type Word = keyof typeof dictionary.oracle.en;

const FACTOR_CHANGE = 20;
const YES_NO_CHANCE = 50;
const AND_BUT_CHANCE = 16;
const EXTREME_CHANCE = 16;

export class Oracle {
  factor = 0;
  language: Language = "en";
  kanjiLanguages: Language[] = ["ja", "zh"];

  setLanguage(newValue: Language) {
    this.language = newValue;
  }

  getWord(word: Word): string {
    if (dictionary.oracle[this.language]) {
      return dictionary.oracle[this.language][word];
    } else {
      return word;
    }
  }

  getAnswer(chance: number, affectedByFactor: boolean = true): string {
    const yn = this.yesNo(chance, affectedByFactor);
    const ab = this.andBut();
    const ex = this.extreme();

    let result = `${ex} ${yn}`;
    if (ab) result += `, ${ab}`;

    if (this.kanjiLanguages.includes(this.language)) {
      return result.replace(/ /g, "").replace(",", "、").trim();
    } else {
      return result.trim();
    }
  }

  yesNo(chance: number, affectedByFactor: boolean = true): string {
    if (affectedByFactor) {
      if (this.roll(chance + this.factor)) {
        this.factor -= FACTOR_CHANGE;
        if (this.factor <= 0) this.factor = 0;
        return this.getWord("yes");
      } else {
        this.factor += FACTOR_CHANGE;
        return this.getWord("no");
      }
    } else {
      if (this.roll(chance)) {
        return this.getWord("yes");
      } else {
        return this.getWord("no");
      }
    }
  }

  andBut(): string {
    if (this.roll(AND_BUT_CHANCE)) {
      if (this.roll(50)) {
        return this.getWord("and");
      } else {
        return this.getWord("but");
      }
    } else {
      return "";
    }
  }

  extreme(): string {
    if (this.roll(EXTREME_CHANCE)) {
      return this.getWord("extreme");
    } else {
      return "";
    }
  }

  private roll(target: number): boolean {
    return random(1, 100) <= target;
  }
}

const oracle = new Oracle();
const getAnswer = (chance: number = YES_NO_CHANCE) =>
  capitalize(oracle.getAnswer(chance, chance === YES_NO_CHANCE));

export const generateAnswer = (variant: string, language = "en") => {
  oracle.setLanguage(language as Language);
  if (variant === "Unlikely") return getAnswer(30);
  if (variant === "Fair") return getAnswer(50);
  if (variant === "Likely") return getAnswer(70);
  return "";
};
