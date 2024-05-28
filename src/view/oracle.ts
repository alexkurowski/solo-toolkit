import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateAnswer, clickToCopy } from "../utils";

const MAX_REMEMBER_SIZE = 1000;

export class OracleView {
  view: View;
  answers: [string, string][];
  answerBtnsEl: HTMLElement;
  answerResultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.answers = [];
  }

  create() {
    if (this.view.isMobile) {
      this.answerResultsEl = this.view.tabViewEl.createDiv("word-results");
    }

    this.answerBtnsEl = this.view.tabViewEl.createDiv("word-buttons");
    this.answerBtnsEl.empty();
    this.createAnswerBtn("Unlikely");
    this.createAnswerBtn("Fair");
    this.createAnswerBtn("Likely");

    if (!this.view.isMobile) {
      this.answerResultsEl = this.view.tabViewEl.createDiv("word-results");
    }

    this.repopulateResults();
  }

  reset() {
    this.answers = [];
    this.answerResultsEl.empty();
  }

  addResult(type: string, value: string, immediate = false) {
    const elClass = ["word-result"];
    if (immediate) elClass.push("nofade");
    const el = this.answerResultsEl.createEl("a", { cls: elClass.join(" ") });
    el.onclick = clickToCopy(value);

    const typeEl = el.createSpan("word-result-type");
    typeEl.setText(type);

    const valueEl = el.createSpan("word-result-value");
    valueEl.setText(value);
  }

  createAnswerBtn(type: string) {
    new ButtonComponent(this.answerBtnsEl)
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
