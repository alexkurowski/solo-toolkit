import { Menu, App, Editor, MarkdownView } from "obsidian";
import { SubMenuItem } from "./types";

type MenuItemOption = {
  title: string;
  checked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  subMenu?: MenuItemBlueprint[];
};

type MenuItemSeparator = "-";

type MenuItemBlueprint = MenuItemOption | MenuItemSeparator | undefined;

export const createMenu = (items: MenuItemBlueprint[]): Menu => {
  const menu = new Menu();

  for (const item of items) {
    if (item === "-") {
      menu.addSeparator();
    } else if (item) {
      menu.addItem(createItem(item));
    }
  }

  return menu;
};

const createItem = (item: MenuItemOption) => (menuItem: SubMenuItem) => {
  menuItem.setTitle(item.title);

  if (item.checked) {
    menuItem.setChecked(item.checked);
  }
  if (item.disabled) {
    menuItem.setDisabled(item.disabled);
  }
  if (item.onClick) {
    menuItem.onClick(item.onClick);
  }

  if (item.subMenu) {
    const subMenuItem = menuItem.setSubmenu();
    for (const subItem of item.subMenu) {
      if (subItem === "-") {
        subMenuItem.addSeparator();
      } else if (subItem) {
        subMenuItem.addItem(createItem(subItem));
      }
    }
  }
};

export const KNOWN_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
];

type EditorWithPosAtMouse = Editor & {
  posAtMouse?: (event: MouseEvent) => { line: number; ch: number };
};

export const findParentWidgetLines = ({
  app,
  event,
}: {
  app: App;
  event: MouseEvent;
}): [number, number] => {
  let lineStart = -1;
  let lineEnd = -1;

  // FIXME: read plugins in edit mode don't provide section info, so this is the only
  //        somewhat working solution for finding element position inside the document
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (view) {
    const editor = view.editor as EditorWithPosAtMouse;
    if (editor?.posAtMouse && typeof editor?.posAtMouse === "function") {
      const position = editor.posAtMouse(event);
      if (position) {
        lineStart = position.line;
        lineEnd = lineStart + 500; // Dunno how many lines the parent element will be, we'll hope for the best here
      }
      // NOTE: when clicking on an inline widget within a table in edit mode, caret will always jump into the cell
      editor.setSelection(position);
    }
  }

  return [lineStart, lineEnd];
};
