import { random } from "./dice";
import { capitalize } from "./helpers";

const FACTOR_CHANGE = 20;
const YES_NO_CHANCE = 50;
const AND_BUT_CHANCE = 16;
const EXTREME_CHANCE = 16;

export class Oracle {
  factor = 0;

  getAnswer(chance: number, affectedByFactor: boolean = true): string {
    const yn = this.yesNo(chance, affectedByFactor);
    const ab = this.andBut();
    const ex = this.extreme();

    let result = `${ex} ${yn}`;
    if (ab) result += `, ${ab}`;

    return result.trim();
  }

  yesNo(chance: number, affectedByFactor: boolean = true): string {
    if (affectedByFactor) {
      if (this.roll(chance + this.factor)) {
        this.factor -= FACTOR_CHANGE;
        if (this.factor <= 0) this.factor = 0;
        return "yes";
      } else {
        this.factor += FACTOR_CHANGE;
        return "no";
      }
    } else {
      if (this.roll(chance)) {
        return "yes";
      } else {
        return "no";
      }
    }
  }

  andBut(): string {
    if (this.roll(AND_BUT_CHANCE)) {
      if (this.roll(50)) {
        return "and";
      } else {
        return "but";
      }
    } else {
      return "";
    }
  }

  extreme(): string {
    if (this.roll(EXTREME_CHANCE)) {
      return "extreme";
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

export const generateAnswer = (variant: string) => {
  if (variant === "Unlikely") return getAnswer(20);
  if (variant === "Fair") return getAnswer(50);
  if (variant === "Likely") return getAnswer(80);
  return "";
};
