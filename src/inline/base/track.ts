import { setTooltip } from "obsidian";
import { capitalize, identity } from "src/utils";
import { createMenu, KNOWN_COLORS } from "./shared";
import { BaseWidget, DomOptions } from "./types";

export const TRACK_REGEX =
  /^`(sm|lg|s|l)?(b|box|boxes|circle|circles)(\|#?[\w\d]+)*: ?([+-]?\d+\/)?\d+`$/;
export const TRACK_REGEX_G =
  /`(sm|lg|s|l)?(b|box|boxes|circle|circles)(\|#?[\w\d]+)*: ?([+-]?\d+\/)?\d+`/g;

const MIN_VALUE = 0;
const MIN_MAX = 1;
const MAX_MAX = 200;

const MIN_SIZE = 16;
const SIZE_DEFAULT = 22;
const SIZE_SMALL = 16;
const SIZE_LARGE = 38;

export class TrackWidgetBase implements BaseWidget {
  shape: "boxes" | "circles";
  value: number;
  max: number;
  color: string;
  size: number;

  el: HTMLElement;
  btnEls: HTMLElement[];

  constructor(opts: { originalText: string }) {
    this.parseValue(opts.originalText);

    if (this.max < MIN_MAX) this.max = MIN_MAX;
    if (this.max > MAX_MAX) this.max = MAX_MAX;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    if (this.size < MIN_SIZE) this.size = MIN_SIZE;
  }

  private parseValue(text: string) {
    this.value = 0;
    this.max = 0;

    const parts = text.replace(/^`+|`+$/g, "").split(":");

    const params = parts[0].split("|");
    const shape = params.shift();

    if ((shape || "").startsWith("c")) {
      this.shape = "circles";
    } else {
      this.shape = "boxes";
    }

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
      this.shape,
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
    if (this.value > newValue + 1) {
      this.value = newValue + 1;
    } else if (this.value === newValue + 1) {
      this.value = newValue;
    } else {
      this.value = newValue + 1;
    }
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    this.updateButtons();
  }

  private setValueTo(newValue: number) {
    this.value = newValue;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    this.updateButtons();
  }

  private addValue(add: number) {
    this.value += add;
    if (this.value <= MIN_VALUE) this.value = MIN_VALUE;
    if (this.value > this.max) this.value = this.max;
    this.updateButtons();
  }

  private updateButtons() {
    let cssFill = "";
    if (this.color) {
      if (KNOWN_COLORS.includes(this.color)) {
        cssFill = `var(--color-${this.color})`;
      } else {
        cssFill = this.color;
      }
    }

    for (const i in this.btnEls) {
      const btnEl = this.btnEls[i];
      if (parseInt(i) < this.value) {
        btnEl.classList.add("active");
        if (cssFill) {
          btnEl.style.borderColor = cssFill;
          btnEl.style.backgroundColor = cssFill;
        }
      } else {
        btnEl.classList.remove("active");
        btnEl.style.borderColor = "";
        btnEl.style.backgroundColor = "";
      }
    }
  }

  generateDOM({ onFocus, onChange }: DomOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-track");

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
          this.setValueTo(this.max);
          onChange?.();
        },
      },
      {
        title: "Reset",
        onClick: () => {
          this.setValueTo(0);
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
      {
        title: "Shape",
        subMenu: [
          {
            title: "Box",
            checked: this.shape === "boxes",
            onClick: () => {
              this.shape = "boxes";
              onChange?.();
            },
          },
          {
            title: "Circle",
            checked: this.shape === "circles",
            onClick: () => {
              this.shape = "circles";
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

    this.btnEls = [];
    for (let i = 0; i < this.max; i++) {
      const btnEl = this.el.createEl("button");
      btnEl.style.width = `${this.size}px`;
      btnEl.style.height = `${this.size}px`;
      btnEl.classList.add(
        "clickable-icon",
        "srt-track-btn",
        `srt-track-${this.shape}`
      );
      btnEl.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setValue(i);
        onChange?.();
      };
      setTooltip(btnEl, (i + 1).toString(), { delay: 0 });
      this.btnEls.push(btnEl);
    }

    this.el.oncontextmenu = (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.showAtMouseEvent(event);
    };

    this.updateButtons();
  }
}
