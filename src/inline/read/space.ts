import { SpaceWidgetBase, SPACE_REGEX } from "../base";

export { SPACE_REGEX };

export class SpaceWidget {
  base: SpaceWidgetBase;

  constructor(opts: {
    originalText: string;
    initialWidth: number;
    updateInitialWidth: (width: number) => void;
  }) {
    this.base = new SpaceWidgetBase(opts);
  }

  toDOM(): HTMLElement {
    this.base.generateDOM({
      observe: true,
    });

    return this.base.el;
  }
}
