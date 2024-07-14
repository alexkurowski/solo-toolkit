export const SPACE_REGEX = /^` +`$/;
const RETRY_COUNT = 20;
const RETRY_DELAY = 2;
const TAB_SIZE = 30;

export class SpaceWidget {
  node: HTMLElement;
  size: number;
  width: number = 0;
  updateInitialWidth: (width: number) => void;

  constructor(opts: {
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
  }) {
    this.size = opts.originalText.length - 2;
    this.width = opts.initialWidth;
    this.updateInitialWidth = opts.updateInitialWidth;
  }

  setWidth(el: HTMLElement, width: number) {
    this.width = width;
    this.updateInitialWidth(width);
    el.style.width = `${width}px`;
    el.style.minWidth = `2px`;
  }

  updateWidth(el: HTMLElement, triesLeft: number) {
    if (triesLeft < 0) {
      this.setWidth(el, 50);
      return;
    }

    if (triesLeft === RETRY_COUNT) {
      const left = el.offsetLeft;
      if (left === 0) {
        this.updateWidth(el, triesLeft - 1);
      } else {
        let width = TAB_SIZE - (left % TAB_SIZE);
        for (let i = 1; i < this.size; i++) width += TAB_SIZE;
        this.setWidth(el, width);
      }
    } else {
      setTimeout(() => {
        const left = el.offsetLeft;
        if (left === 0) {
          this.updateWidth(el, triesLeft - 1);
        } else {
          let width = TAB_SIZE - (left % TAB_SIZE);
          for (let i = 1; i < this.size; i++) width += TAB_SIZE;
          this.setWidth(el, width);
        }
      }, RETRY_DELAY);
    }
  }

  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.classList.add("srt-space");

    if (this.width) {
      el.style.width = `${this.width}px`;
      el.style.minWidth = `2px`;
    }

    const observer = new MutationObserver(() => {
      if (document.contains(el)) {
        this.updateWidth(el, RETRY_COUNT);
        observer.disconnect();
      }
    });
    observer.observe(document, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    });

    return el;
  }
}
