import { random } from "../dice";
import { AnswerVariant, Oracle, BaseOracle } from "./shared";

const FACTOR_CHANGE = 20;
const AND_BUT_CHANCE = 50;
const EXTREME_CHANCE = 10;

export class StandardOracle extends BaseOracle implements Oracle {
  factor = 0;
  biasEnabled = false;

  getAnswer(variant: AnswerVariant): string {
    if (variant === "low") {
      return this.formatAnswer(this.getAnswerWithChance(30, false));
    } else if (variant === "high") {
      return this.formatAnswer(this.getAnswerWithChance(70, false));
    } else {
      return this.formatAnswer(this.getAnswerWithChance(50, this.biasEnabled));
    }
  }

  setBias(enabled: boolean) {
    this.biasEnabled = enabled;
  }

  private getAnswerWithChance(
    chance: number,
    affectedByFactor: boolean = true
  ): string {
    const yn = this.yesNo(chance, affectedByFactor);
    const ab = this.andBut();
    const ex = this.extreme();

    let result = `${ex} ${yn}`;
    if (ab) result += `, ${ab}`;

    return result;
  }

  private yesNo(chance: number, affectedByFactor: boolean = true): string {
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

  private andBut(): string {
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

  private extreme(): string {
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
