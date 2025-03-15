import { Menu } from "obsidian";
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
