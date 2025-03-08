export type DomOptions = {
  onFocus?: () => void;
  onChange?: () => void;
};

export interface BaseWidget {
  getText: (wrap: string) => string;
  generateDOM: (opts: DomOptions) => void;
}
