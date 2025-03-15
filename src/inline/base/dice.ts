import { setTooltip } from "obsidian";
import { capitalize, identity, nroll, rollIntervals } from "src/utils";
import { createMenu, KNOWN_COLORS } from "./shared";
import { BaseWidget, DomOptions } from "./types";

export const DICE_REGEX =
  /^`!?(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100)(\|#?[\w\d]+)*(( = |: )\d+)?`$/;
export const DICE_REGEX_G =
  /`!?(sm|lg|s|l)?(\d+)?d(4|6|8|10|12|20|100)(\|#?[\w\d]+)*(( = |: )\d+)?`/g;

const MIN_VALUE = 1;
const MIN_SIZE = 10;
const SIZE_DEFAULT = 36;
const SIZE_SMALL = 30;
const SIZE_LARGE = 52;

let rollLock = false;

export class DiceWidgetBase implements BaseWidget {
  disabled: boolean;
  quantity: number;
  max: number;
  value: number;
  color: string;
  size: number;

  el: HTMLElement;
  svgEl: SVGElement;
  valueEl: HTMLElement;

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.value < MIN_VALUE) this.value = MIN_VALUE;
    if (this.size < MIN_SIZE) this.size = MIN_SIZE;
  }

  private parseValue(text: string) {
    this.disabled = false;
    this.color = "";
    this.size = SIZE_DEFAULT;
    this.quantity = 1;
    this.max = 20;
    this.value = 20;

    const normalized = text.replace(/^`+|`+$/g, "");

    // Split text into parts
    const [controlWithParams, value] = normalized.split(
      normalized.includes("=") ? " = " : ": "
    );
    const params: string[] = controlWithParams.split("|");
    const control: string = params.shift()!;

    const cMatch = control.match(/(!)?(sm|lg|s|l)?(\d+)?d(\d+)/);
    const cDisabled = !!cMatch?.[1];
    const cSize = cMatch?.[2] || "";
    const cQuantity = parseInt(cMatch?.[3] || "");
    const cMax = parseInt(cMatch?.[4] || "");

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

    if (params) {
      for (const param of params) {
        if (param.match(/^\d+$/)) {
          this.size = parseInt(param) || this.size;
        } else {
          this.color = param;
        }
      }
    }

    this.value = parseInt(value || "") || this.max;
  }

  private roll() {
    this.value = nroll(this.quantity, this.max, this.value);
    this.valueEl.innerText = this.value.toString();
  }

  private toggleDisable() {
    this.disabled = !this.disabled;
    if (this.disabled) {
      this.el.classList.add("srt-dice-disabled");
    } else {
      this.el.classList.remove("srt-dice-disabled");
    }
  }

  getText(wrap = ""): string {
    return [
      wrap,
      this.disabled ? "!" : "",
      this.quantity > 1 ? this.quantity : "",
      "d",
      this.max,
      this.color ? `|${this.color}` : "",
      this.size !== SIZE_DEFAULT ? `|${this.size}` : "",
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
      let cssValue = this.color.replace("|", "");
      if (KNOWN_COLORS.includes(cssValue)) {
        cssValue = `var(--color-${cssValue})`;
      }
      pathEl.style.stroke = cssValue;
      pathEl.style.fill = cssValue;
    }
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-dice", `srt-dice-d${this.max}`);
    if (this.disabled) {
      this.el.classList.add("srt-dice-disabled");
    }

    const sizeText = `${this.quantity > 1 ? this.quantity : ""}d${this.max}`;
    setTooltip(this.el, sizeText, { delay: 0 });

    this.svgEl = this.el.createSvg("svg", {
      cls: "srt-dice-svg",
      attr: {
        width: this.size || 26,
        height: this.size || 26,
      },
    });

    this.generateSvg();

    this.valueEl = this.el.createEl("button");
    this.valueEl.classList.add("clickable-icon", "srt-dice-btn");
    this.valueEl.innerText = this.value.toString();

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
    this.valueEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (rollLock) return;
      menu.showAtMouseEvent(event);
    };
  }
}
