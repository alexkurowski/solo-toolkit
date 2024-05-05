import { TFile, ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateWord, randomFrom } from "../utils";

export class WordView {
  view: View;
  wordBtnsEl: HTMLElement;
  wordResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
  }

  create() {
    if (this.view.isMobile) {
      this.wordResultsEl = this.view.tabViewEl.createDiv("word-results");
    }

    this.wordBtnsEl = this.view.tabViewEl.createDiv("word-buttons");
    this.wordBtnsEl.empty();
    this.createWordBtn("Subject");
    this.createWordBtn("Action");
    this.createWordBtn("Name");
    this.createWordBtn("Looks");
    this.createWordBtn("Job");
    this.createWordBtn("Town");

    if (this.view.settings.customTableRoot) {
      const files = this.view.app.vault.getMarkdownFiles();
      for (const file of files) {
        if (file.parent?.path === this.view.settings.customTableRoot) {
          this.createCustomWordBtn(file);
        }
      }
    }

    if (!this.view.isMobile) {
      this.wordResultsEl = this.view.tabViewEl.createDiv("word-results");
    }
  }

  addResult(type: string, value: string) {
    const el = this.wordResultsEl.createDiv("word-result");
    const typeEl = el.createSpan("word-result-type");
    typeEl.setText(type);
    const valueEl = el.createSpan("word-result-value");
    valueEl.setText(value);
    setTimeout(() => {
      el.classList.add("shown");
    }, 30);
  }

  createWordBtn(type: string) {
    new ButtonComponent(this.wordBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        this.addResult(type, generateWord(type));
      });
  }

  createCustomWordBtn(file: TFile) {
    const type = file.basename;
    let values: string[] = [];

    this.view.app.vault.cachedRead(file).then((content: string) => {
      if (!content) return;

      values = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line);
    });

    new ButtonComponent(this.wordBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        if (!values.length) return;
        this.addResult(type, randomFrom(values));
      });
  }
}
