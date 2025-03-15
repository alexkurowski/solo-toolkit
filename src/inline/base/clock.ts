import { setTooltip } from "obsidian";
import { BaseWidget, DomOptions } from "./types";

export const CLOCK_REGEX = /^`[+-]?\d+\/\d+`$/;
export const EXPLICIT_CLOCK_REGEX =
  /^`((s|l)?c:|(sm|lg)?clock:) ?[+-]?\d+\/\d+`$/;
export const CLOCK_REGEX_G = /`[+-]?\d+\/\d+`/g;
export const EXPLICIT_CLOCK_REGEX_G =
  /`((s|l)?c:|(sm|lg)?clock:) ?[+-]?\d+\/\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 16;
const RAD = Math.PI / 180;

export class ClockWidgetBase implements BaseWidget {
  prefix: string;
  value: number;
  max: number;
  size: number;

  el: HTMLElement;
  btnEl: HTMLElement;
  svgEl: SVGElement;

  constructor(opts: { originalText: string; defaultSize: string }) {
    this.parseValue(opts.originalText);

    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;

    if (this.prefix.startsWith("s")) {
      this.size = 40;
    } else if (this.prefix.startsWith("l")) {
      this.size = 80;
    } else if (opts.defaultSize === "small_clock") {
      this.size = 40;
    } else if (opts.defaultSize === "big_clock") {
      this.size = 80;
    } else {
      this.size = 50;
    }
  }

  private parseValue(text: string) {
    this.prefix = "";
    this.value = 0;
    this.max = 0;

    const split = text.replace(/`/g, "").split("/");
    if (split[0].includes(":")) {
      const match = split[0].match(/\d/);
      if (match) {
        this.prefix = split[0].substring(0, match.index);
        split[0] = split[0].replace(this.prefix, "");
      }
    }

    this.value = parseInt(split[0]) || 0;
    this.max = parseInt(split[1]) || 0;
  }

  private addValue(add: number) {
    this.value = Math.min(Math.max(MIN_VALUE, this.value + add), this.max);
    setTooltip(this.el, this.value.toString(), { delay: 0 });
    this.generateSvg();
  }

  getText(wrap = ""): string {
    return `${wrap}${this.prefix}${this.value}/${this.max}${wrap}`;
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

    if (this.max <= 1) {
      this.svgEl.createSvg("circle", {
        attr: {
          cx: center,
          cy: center,
          r: radius,
          fill: this.value > 0 ? "currentColor" : "none",
          stroke: "currentColor",
          "stroke-width": 1.25,
        },
      });
    } else {
      const step = 360 / this.max;
      for (let i = 0; i < this.max; i++) {
        this.svgEl.createSvg("path", {
          attr: {
            d: this.calculatePath(center, center, radius, i, step),
            fill: this.value > i ? "currentColor" : "none",
            stroke: "currentColor",
          },
        });
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

  generateDOM({ onChange }: DomOptions) {
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
      this.addValue(-1);
      onChange?.();
    };
  }
}
