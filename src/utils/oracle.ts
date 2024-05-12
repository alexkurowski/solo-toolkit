import { random } from "./dice";

const FACTOR_CHANGE = 20;
const YES_NO_CHANCE = 50;
const AND_BUT_CHANCE = 16;
const EXTREME_CHANCE = 16;

export class Oracle {
  factor = 0;

  getAnswer(): string {
    const yn = this.yesNo();
    const ab = this.andBut();
    const ex = this.extreme();

    let result = `${ex} ${yn}`;
    if (ab) result += `, ${ab}`;

    return result.trim();
  }

  yesNo(): string {
    if (this.roll(YES_NO_CHANCE + this.factor)) {
      this.factor -= FACTOR_CHANGE;
      if (this.factor <= 0) this.factor = 0;
      return "yes";
    } else {
      this.factor += FACTOR_CHANGE;
      return "no";
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
