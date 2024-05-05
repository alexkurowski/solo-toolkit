import { TFile, ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateWord, randomFrom } from "../utils";

const MAX_REMEMBER_SIZE = 1000;

export class WordView {
  view: View;
  words: [string, string][];
  wordBtnsEl: HTMLElement;
  wordResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.words = [];
  }

  create() {
    if (this.view.isMobile) {
      this.wordResultsEl = this.view.tabViewEl.createDiv("word-results");
    }

    this.wordBtnsEl = this.view.tabViewEl.createDiv("word-buttons");
    this.wordBtnsEl.empty();
    this.createResetBtn();
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

    this.repopulateResults();
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["word-result"];
    if (immediate) elClass.push("shown");
    const el = this.wordResultsEl.createDiv(elClass.join(" "));

    const typeEl = el.createSpan("word-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("word-result-value");
    valueEl.setText(value);

    if (!immediate) {
      setTimeout(() => {
        el.classList.add("shown");
      }, 30);
    }
  }

  createResetBtn() {
    new ButtonComponent(this.wordBtnsEl)
      .setIcon("refresh-ccw")
      .setTooltip("Remove all generated words")
      .onClick(() => {
        this.words = [];
        this.wordResultsEl.empty();
      });
  }

  createWordBtn(type: string) {
    new ButtonComponent(this.wordBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        const value = generateWord(type);
        this.words.push([type, value]);
        this.addResult(type, value);
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
        const value = randomFrom(values);
        this.words.push([type, value]);
        this.addResult(type, value);
      });
  }

  repopulateResults() {
    while (this.words.length > MAX_REMEMBER_SIZE) {
      this.words.shift();
    }

    for (const word of this.words) {
      const [type, value] = word;
      this.addResult(type, value, true);
    }
  }
}
