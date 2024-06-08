import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateAnswer, generateWord, clickToCopy, last } from "../utils";

const MAX_REMEMBER_SIZE = 100;

const wordLabels: { [word: string]: string } = {
  Subject: "a subject",
  Action: "an action",
};

export class OracleView {
  view: View;
  answers: [string, string][];
  btnsEls: HTMLElement[];
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.answers = [];
  }

  create() {
    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    }

    this.btnsEls = [];

    this.btnsEls.push(this.view.tabViewEl.createDiv("oracle-buttons"));
    this.createAnswerBtn("Unlikely");
    this.createAnswerBtn("Fair");
    this.createAnswerBtn("Likely");
    this.btnsEls.push(this.view.tabViewEl.createDiv("oracle-buttons"));
    this.createOracleBtn("Subject");
    this.createOracleBtn("Action");

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    }

    this.repopulateResults();
  }

  reset() {
    this.answers = [];
    this.resultsEl.empty();
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["oracle-result"];
    if (immediate) elClass.push("nofade");
    const el = this.resultsEl.createEl("a", { cls: elClass.join(" ") });
    el.onclick = clickToCopy(value);

    const typeEl = el.createSpan("oracle-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("oracle-result-value");
    valueEl.setText(value);
  }

  createAnswerBtn(type: string) {
    new ButtonComponent(last(this.btnsEls))
      .setButtonText(type)
      .setTooltip(
        `Generate a${
          type[0] === "U" ? "n" : ""
        } ${type.toLowerCase()} oracle answer`
      )
      .onClick(() => {
        const value = generateAnswer(type);
        this.answers.push([type, value]);
        this.addResult(type, value);
      });
  }

  createOracleBtn(type: string) {
    new ButtonComponent(last(this.btnsEls))
      .setButtonText(type)
      .setTooltip(`Generate ${wordLabels[type] || type.toLowerCase()}`)
      .onClick(() => {
        const value = generateWord(type);
        this.answers.push([type, value]);
        this.addResult(type, value);
      });
  }

  repopulateResults() {
    while (this.answers.length > MAX_REMEMBER_SIZE) {
      this.answers.shift();
    }

    for (const word of this.answers) {
      const [type, value] = word;
      this.addResult(type, value, true);
    }
  }
}
