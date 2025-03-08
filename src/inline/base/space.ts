import { BaseWidget, DomOptions } from "./types";

export const SPACE_REGEX = /^` +`$/;

const RETRY_COUNT = 20;
const RETRY_DELAY = 2;
const TAB_SIZE = 30;

interface SpaceOptions {
  observe?: boolean;
}

export class SpaceWidgetBase implements BaseWidget {
  size: number;
  width: number = 0;
  updateInitialWidth: (width: number) => void;

  el: HTMLElement;

  constructor(opts: {
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
  }) {
    this.size = opts.originalText.length - 2;
    this.width = opts.initialWidth;
    this.updateInitialWidth = opts.updateInitialWidth;
  }

  getText(wrap = ""): string {
    return `${wrap}${" ".repeat(this.size)}${wrap}`;
  }

  private setWidth(width: number) {
    this.width = width;
    this.updateInitialWidth(width);
    this.el.style.width = `${width}px`;
    this.el.style.minWidth = `2px`;
  }

  private updateWidth(triesLeft: number) {
    if (triesLeft < 0) {
      this.setWidth(50);
      return;
    }

    if (triesLeft === RETRY_COUNT) {
      const left = this.el.offsetLeft;
      if (left === 0) {
        this.updateWidth(triesLeft - 1);
        return;
      } else {
        const width = TAB_SIZE - (left % TAB_SIZE) + TAB_SIZE * (this.size - 1);
        this.setWidth(width);
      }
    } else {
      setTimeout(() => {
        const left = this.el.offsetLeft;
        if (left === 0) {
          this.updateWidth(triesLeft - 1);
          return;
        } else {
          const width =
            TAB_SIZE - (left % TAB_SIZE) + TAB_SIZE * (this.size - 1);
          this.setWidth(width);
        }
      }, RETRY_DELAY);
    }
  }

  generateDOM({ onFocus, observe }: DomOptions & SpaceOptions) {
    this.el = document.createElement("span");
    this.el.classList.add("srt-space");

    if (this.width) {
      this.el.style.width = `${this.width}px`;
      this.el.style.minWidth = `2px`;
    }

    this.updateWidth(RETRY_COUNT);

    this.el.onclick = () => {
      onFocus?.();
    };

    if (observe) {
      const observer = new MutationObserver(() => {
        if (document.contains(this.el)) {
          this.updateWidth(RETRY_COUNT);
          observer.disconnect();
        }
      });
      observer.observe(document, {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true,
      });
    }
  }
}
