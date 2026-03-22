import { Menu, MenuItem } from "obsidian";

export type DomOptions = {
  onFocus?: () => void;
  onChange?: (event?: any) => void;
};

export interface BaseWidget {
  getText: (wrap: string) => string;
  generateDOM: (opts: DomOptions) => void;
}

export interface SubMenuItem extends MenuItem {
  setSubmenu: () => Menu;
}
