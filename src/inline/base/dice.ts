import { setTooltip } from "obsidian";
import { capitalize, identity, nrandom, rollIntervals } from "src/utils";
import { createMenu, KNOWN_COLORS } from "./shared";
import { BaseWidget, DomOptions } from "./types";

export const DICE_REGEX =
  /^`!?(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100|F)([+-]\d+)?([|,]#?[\w\d]+)*(( = |: )[+-]?\d+)?`$/;
export const DICE_REGEX_G =
  /`!?(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100|F)([+-]\d+)?([|,]#?[\w\d]+)*(( = |: )[+-]?\d+)?`/g;

const MIN_SIZE = 10;
const SIZE_DEFAULT = 36;
const SIZE_SMALL = 30;
const SIZE_LARGE = 52;

let rollLock = false;

export class DiceWidgetBase implements BaseWidget {
  type: "num" | "fudge" = "num";

  disabled: boolean;
  quantity: number;
  min: number = 1;
  max: number;
  add: number;
  value: number;
  color: string;
  size: number;
  explicit: boolean;

  el: HTMLElement;
  svgEl: SVGElement;
  valueEl: HTMLElement;

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.size < MIN_SIZE) this.size = MIN_SIZE;
  }

  private parseValue(text: string) {
    this.disabled = false;
    this.color = "";
    this.size = SIZE_DEFAULT;
    this.quantity = 1;
    this.min = 1;
    this.max = 20;
    this.value = 20;
    this.explicit = false;

    const normalized = text.replace(/^`+|`+$/g, "");

    // Split text into parts
    const [controlWithParams, value] = normalized.split(
      normalized.includes("=") ? " = " : ": "
    );
    const separator = controlWithParams.includes("|") ? "|" : ",";
    const params: string[] = controlWithParams.split(separator);
    const control: string = params.shift()!;

    const cMatch = control.match(/(!)?(sm|lg|s|l)?(\d+)?d(\d+|F)([+-]\d+)?/);
    const cDisabled = !!cMatch?.[1];
    const cSize = cMatch?.[2] || "";
    const cQuantity = parseInt(cMatch?.[3] || "");
    const cMax = parseInt(cMatch?.[4] || "");
    const cAdd = parseInt(cMatch?.[5] || "");

    this.disabled = cDisabled;
    this.quantity = cQuantity || 1;

    // Legacy size
    this.size = SIZE_DEFAULT;
    if (cSize) {
      if (cSize.startsWith("s")) {
        this.size = SIZE_SMALL;
      } else if (cSize.startsWith("l")) {
        this.size = SIZE_LARGE;
      }
    }

    this.quantity = cQuantity || 1;
    this.max = cMax || 20;
    this.add = cAdd || 0;
    this.value = parseInt(value || "") || this.quantity * this.max + this.add;

    if (cMatch?.[4] === "F") {
      this.type = "fudge";
      this.min = -1;
      this.max = 1;
      this.value = parseInt(value || "") || 0;
    }

    if (params) {
      for (const param of params) {
        if (param.match(/^\d+$/)) {
          this.size = parseInt(param) || this.size;
        } else if (param === "show") {
          this.explicit = true;
        } else {
          this.color = param;
        }
      }
    }
  }

  private roll() {
    this.value = nrandom(this.quantity, this.min, this.max, this.value);
    if (this.add) this.value += this.add;
    this.updateValue();
  }

  private toggleDisable() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.el.classList.add("srt-dice-disabled");
    } else {
      this.el.classList.remove("srt-dice-disabled");
    }
  }

  private toggleExplicit() {
    this.explicit = !this.explicit;
  }

  private updateValue() {
    let value = this.value.toString();

    if (this.type === "fudge") {
      this.valueEl.classList.remove("srt-dice-fudge-single");
      if (this.value === -1) {
        value = "-";
        this.valueEl.classList.add("srt-dice-fudge-single");
      } else if (this.value === 1) {
        value = "+";
        this.valueEl.classList.add("srt-dice-fudge-single");
      } else if (this.value < 0) {
        value = this.value.toString();
      } else if (this.value > 0) {
        value = `+${this.value}`;
      } else {
        value = " ";
      }
    }

    this.valueEl.innerText = value;
  }

  getText(wrap = ""): string {
    return [
      wrap,
      this.disabled ? "!" : "",
      this.quantity > 1 ? this.quantity : "",
      "d",
      this.type === "fudge" ? "F" : this.max,
      this.add ? (this.add > 0 ? `+${this.add}` : this.add) : "",
      this.color ? `,${this.color}` : "",
      this.size !== SIZE_DEFAULT ? `,${this.size}` : "",
      this.explicit ? ",show" : "",
      ": ",
      this.value.toString(),
      wrap,
    ]
      .filter(identity)
      .join("");
  }

  private generateSvg() {
    this.svgEl.empty();

    const center = this.size / 2;
    const width = center - 3;

    const angles: number[] = [];
    if (this.type === "num") {
      switch (this.max) {
        case 4:
          angles.push(-90, 30, 150);
          break;
        case 6:
          angles.push(-45, 45, 135, 225);
          break;
        case 8:
        case 10:
        case 100:
          angles.push(0, 90, 180, 270);
          break;
        case 12:
          angles.push(-90, -18, 54, 126, 198);
          break;
        case 20:
        default:
          angles.push(-90, -30, 30, 90, 150, 210);
          break;
      }
    } else if (this.type === "fudge") {
      angles.push(-45, 45, 135, 225);
    }

    const points = angles.map((deg: number, index: number) => {
      let length = width;
      if (this.max === 10) {
        if (index === 1 || index === 3) {
          length = width - 3;
        }
      }
      if (this.max === 100) {
        if (index === 1 || index === 3) {
          length = width - 2;
        }
      }
      const x = center + Math.cos((deg * Math.PI) / 180) * length;
      const y = center + Math.sin((deg * Math.PI) / 180) * length;
      return `${x.toFixed(4)} ${y.toFixed(4)}`;
    });

    const pathEl = this.svgEl.createSvg("path", {
      attr: {
        d: `M${points.join("L")}Z`,
        "stroke-linejoin": "round",
        "stroke-width": 5,
        stroke: "currentColor",
        fill: "currentColor",
      },
    });

    if (this.color) {
      let cssValue = this.color.replace(/[|,]/, "");
      if (KNOWN_COLORS.includes(cssValue)) {
        cssValue = `var(--color-${cssValue})`;
      }
      pathEl.style.stroke = cssValue;
      pathEl.style.fill = cssValue;
    }
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-dice", `srt-dice-${this.type}`);
    if (this.disabled) {
      this.el.classList.add("srt-dice-disabled");
    }

    const sizeText = [
      this.quantity > 1 ? this.quantity : "",
      "d",
      this.type === "fudge" ? "F" : this.max,
      this.add ? (this.add > 0 ? `+${this.add}` : this.add) : "",
    ]
      .filter(identity)
      .join("");
    setTooltip(this.el, sizeText, { delay: 0 });

    if (this.explicit) {
      const expEl = this.el.createEl("span");
      expEl.classList.add("srt-dice-size");
      expEl.innerText = `${sizeText} = `;

      expEl.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onFocus?.();
      };
    }

    const diceEl = this.el.createEl("span");
    diceEl.classList.add("srt-dice-btn-container");

    this.svgEl = diceEl.createSvg("svg", {
      cls: "srt-dice-svg",
      attr: {
        width: this.size || 26,
        height: this.size || 26,
      },
    });

    this.generateSvg();

    this.valueEl = diceEl.createEl("button");
    this.valueEl.classList.add("clickable-icon", "srt-dice-btn");
    this.updateValue();

    const menu = createMenu([
      {
        title: "Roll",
        disabled: this.disabled,
        onClick: () => {
          rollLock = true;
          setTimeout(reroll, rollIntervals[i]);
          setTimeout(() => {
            rollLock = false;
          }, 320);
        },
      },
      "-",
      {
        title: "Color",
        subMenu: [
          {
            title: "Default",
            checked: this.color === "",
            onClick: () => {
              this.color = "";
              onChange?.();
            },
          },
          ...KNOWN_COLORS.map((color) => ({
            title: capitalize(color),
            checked: this.color === color,
            onClick: () => {
              this.color = color;
              onChange?.();
            },
          })),
        ],
      },
      {
        title: "Size",
        subMenu: [
          {
            title: "Default",
            checked: this.size === SIZE_DEFAULT,
            onClick: () => {
              this.size = SIZE_DEFAULT;
              onChange?.();
            },
          },
          {
            title: "Small",
            checked: this.size === SIZE_SMALL,
            onClick: () => {
              this.size = SIZE_SMALL;
              onChange?.();
            },
          },
          {
            title: "Large",
            checked: this.size === SIZE_LARGE,
            onClick: () => {
              this.size = SIZE_LARGE;
              onChange?.();
            },
          },
          "-",
          {
            title: "Increase",
            onClick: () => {
              this.size += 8;
              onChange?.();
            },
          },
          {
            title: "Decrease",
            onClick: () => {
              this.size -= 8;
              onChange?.();
            },
          },
        ],
      },
      {
        title: "Show dice",
        checked: this.explicit,
        onClick: () => {
          this.toggleExplicit();
          onChange?.();
        },
      },
      {
        title: "Lock",
        checked: this.disabled,
        onClick: () => {
          this.toggleDisable();
          onChange?.();
        },
      },
      onFocus ? "-" : undefined,
      onFocus
        ? {
            title: "Edit",
            onClick: () => {
              onFocus();
            },
          }
        : undefined,
    ]);

    let i = 0;
    const reroll = () => {
      this.roll();

      i++;
      if (rollIntervals[i]) {
        setTimeout(reroll, rollIntervals[i] * 0.5);
      } else {
        i = 0;
        onChange?.();
        rollLock = false;
      }
    };
    this.valueEl.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.disabled) return;
      if (rollLock) return;
      rollLock = true;
      setTimeout(reroll, rollIntervals[i]);
      setTimeout(() => {
        rollLock = false;
      }, 320);
    };

    this.el.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (rollLock) return;
      menu.showAtMouseEvent(event);
    };
  }
}
