import { setTooltip } from "obsidian";
import { capitalize, identity } from "src/utils";
import { createMenu, KNOWN_COLORS } from "./shared";
import { BaseWidget, DomOptions } from "./types";

export const CLOCK_REGEX =
  /^`(sm|lg|s|l)?(c|cl|clock)(\|#?[\w\d]+)*: ?([+-]?\d+\/)?\d+`$/;
export const CLOCK_REGEX_G =
  /`(sm|lg|s|l)?(c|cl|clock)(\|#?[\w\d]+)*: ?([+-]?\d+\/)?\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 16;
const RAD = Math.PI / 180;

const MIN_SIZE = 10;
const SIZE_DEFAULT = 50;
const SIZE_SMALL = 40;
const SIZE_LARGE = 80;

export class ClockWidgetBase implements BaseWidget {
  value: number;
  max: number;
  color: string;
  size: number;

  el: HTMLElement;
  btnEl: HTMLElement;
  svgEl: SVGElement;

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    if (this.size < MIN_SIZE) this.size = MIN_SIZE;
  }

  private parseValue(text: string) {
    this.value = MIN_VALUE;
    this.max = MIN_MAX;
    this.color = "";
    this.size = SIZE_DEFAULT;

    const parts = text.replace(/^`+|`+$/g, "").split(":");

    const params = parts[0].split("|");
    params.shift();

    // Legacy size
    this.size = SIZE_DEFAULT;
    if (parts[0].startsWith("s")) {
      this.size = SIZE_SMALL;
    } else if (parts[0].startsWith("l")) {
      this.size = SIZE_LARGE;
    }

    for (const param of params) {
      if (param.match(/^\d+$/)) {
        this.size = parseInt(param) || this.size;
      } else {
        this.color = param;
      }
    }

    const split = parts[1].split("/");
    if (split.length > 1) {
      this.value = parseInt(split[0].trim()) || 0;
      this.max = parseInt(split[1].trim()) || 0;
    } else {
      this.value = 0;
      this.max = parseInt(split[0].trim()) || 0;
    }
  }

  getText(wrap = ""): string {
    return [
      wrap,
      "clock",
      this.color ? `|${this.color}` : "",
      this.size !== SIZE_DEFAULT ? `|${this.size}` : "",
      ": ",
      this.value.toString(),
      "/",
      this.max.toString(),
      wrap,
    ]
      .filter(identity)
      .join("");
  }

  private setValue(newValue: number) {
    this.value = newValue;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    setTooltip(this.el, this.value.toString(), { delay: 0 });
    this.generateSvg();
  }

  private addValue(add: number) {
    this.value = this.value + add;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    setTooltip(this.el, this.value.toString(), { delay: 0 });
    this.generateSvg();
  }

  private calculatePath(
    centerX: number,
    centerY: number,
    size: number,
    index: number,
    step: number
  ): string {
    const angleA = -index * step + 90;
    const angleB = (-index - 1) * step + 90;
    const x = centerX;
    const y = centerY;
    const cr = size;
    const cx1 = Math.cos(angleB * RAD) * cr + x;
    const cy1 = -Math.sin(angleB * RAD) * cr + y;
    const cx2 = Math.cos(angleA * RAD) * cr + x;
    const cy2 = -Math.sin(angleA * RAD) * cr + y;

    return `M${x} ${y} ${cx1} ${cy1} A${cr} ${cr} 0 0 0 ${cx2} ${cy2}Z`;
  }

  private generateSvg() {
    this.svgEl.empty();

    const center = this.size / 2;
    const radius = center - 2;

    let cssFill = "";
    if (this.color) {
      if (KNOWN_COLORS.includes(this.color)) {
        cssFill = `var(--color-${this.color})`;
      } else {
        cssFill = this.color;
      }
    }

    if (this.max <= 1) {
      const pathEl = this.svgEl.createSvg("circle", {
        attr: {
          cx: center,
          cy: center,
          r: radius,
          fill: this.value > 0 ? "currentColor" : "none",
          stroke: "currentColor",
          "stroke-width": 1.25,
        },
      });
      if (cssFill && this.value > 0) {
        pathEl.style.fill = cssFill;
      }
    } else {
      const step = 360 / this.max;
      for (let i = 0; i < this.max; i++) {
        const pathEl = this.svgEl.createSvg("path", {
          attr: {
            d: this.calculatePath(center, center, radius, i, step),
            fill: this.value > i ? "currentColor" : "none",
            stroke: "currentColor",
          },
        });
        if (cssFill && this.value > i) {
          pathEl.style.fill = cssFill;
        }
      }
      this.svgEl.createSvg("circle", {
        attr: {
          cx: center,
          cy: center,
          r: radius,
          fill: "none",
          stroke: "currentColor",
          "stroke-width": 1.25,
        },
      });
    }
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-clock");
    setTooltip(this.el, this.value.toString(), { delay: 0 });

    this.btnEl = this.el.createEl("button");
    this.btnEl.classList.add("clickable-icon", "srt-clock-btn");

    this.svgEl = this.btnEl.createSvg("svg", {
      cls: "srt-clock-svg",
      attr: {
        width: this.size || 50,
        height: this.size || 50,
      },
    });

    this.generateSvg();

    const menu = createMenu([
      {
        title: "Advance",
        onClick: () => {
          this.addValue(1);
          onChange?.();
        },
      },
      {
        title: "Subtract",
        onClick: () => {
          this.addValue(-1);
          onChange?.();
        },
      },
      "-",
      {
        title: "Fill",
        onClick: () => {
          this.setValue(this.max);
          onChange?.();
        },
      },
      {
        title: "Reset",
        onClick: () => {
          this.setValue(0);
          onChange?.();
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

    this.btnEl.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!event.shiftKey) {
        this.addValue(1);
      } else {
        this.addValue(-1);
      }
      onChange?.();
    };
    this.btnEl.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.showAtMouseEvent(event);
    };
  }
}
