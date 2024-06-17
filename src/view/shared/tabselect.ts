import { DropdownComponent, ExtraButtonComponent } from "obsidian";

export class TabSelect {
  containerEl: HTMLElement;
  dropdown: DropdownComponent;
  callback: (newTab: string) => void;

  constructor(parent: HTMLElement, callback: (newValue: string) => void) {
    this.containerEl = parent.createDiv("srt-category-picker");
    this.callback = callback;

    new ExtraButtonComponent(this.containerEl)
      .setIcon("chevron-left")
      .setTooltip("Previous category")
      .onClick(this.setPrevValue.bind(this));

    this.dropdown = new DropdownComponent(this.containerEl).onChange(
      this.callback
    );

    new ExtraButtonComponent(this.containerEl)
      .setIcon("chevron-right")
      .setTooltip("Next category")
      .onClick(this.setNextValue.bind(this));
  }

  setPrevValue() {
    let prevIndex = this.dropdown.selectEl.selectedIndex - 1;
    if (prevIndex < 0) prevIndex = this.dropdown.selectEl.children.length - 1;
    const newValue = (
      this.dropdown.selectEl.children[prevIndex] as HTMLOptionElement
    )?.value;
    if (newValue) {
      this.dropdown.setValue(newValue);
      this.callback(newValue);
    }
  }

  setNextValue() {
    let nextIndex = this.dropdown.selectEl.selectedIndex + 1;
    if (nextIndex > this.dropdown.selectEl.children.length - 1) nextIndex = 0;
    const newValue = (
      this.dropdown.selectEl.children[nextIndex] as HTMLOptionElement
    )?.value;
    if (newValue) {
      this.dropdown.setValue(newValue);
      this.callback(newValue);
    }
  }

  setValue(newValue: string) {
    this.dropdown.setValue(newValue);
    this.callback(newValue);
  }

  addOption(value: string, label: string) {
    this.dropdown.addOption(value, label);
  }

  hide() {
    this.containerEl.hide();
  }
}
