import { TFile, ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateWord, randomFrom, clickToCopy } from "../utils";

const MAX_REMEMBER_SIZE = 1000;

const wordLabels: { [word: string]: string } = {
  Oracle: "yes/no answer",
  Subject: "a subject",
  Action: "an action",
  Name: "a name",
  Aspects: "character aspects",
  Skills: "character skills",
  Job: "occupation",
  Town: "a town name",
};

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
    this.createWordBtn("Oracle");
    this.createWordBtn("Subject");
    this.createWordBtn("Action");
    this.createWordBtn("Name");
    this.createWordBtn("Aspects");
    this.createWordBtn("Skills");
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

  reset() {
    this.words = [];
    this.wordResultsEl.empty();
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["word-result"];
    if (immediate) elClass.push("nofade");
    const el = this.wordResultsEl.createEl("a", { cls: elClass.join(" ") });
    el.onclick = clickToCopy(value);

    const typeEl = el.createSpan("word-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("word-result-value");
    valueEl.setText(value);
  }

  createWordBtn(type: string) {
    new ButtonComponent(this.wordBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate ${wordLabels[type] || type.toLowerCase()}`)
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
