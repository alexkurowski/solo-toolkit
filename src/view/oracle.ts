import { ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateAnswer, clickToCopy } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class OracleView {
  view: View;
  answers: [string, string][];
  btnsEl: HTMLElement;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.answers = [];
  }

  create() {
    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    }

    this.btnsEl = this.view.tabViewEl.createDiv("oracle-buttons");
    this.createAnswerBtn("Unlikely");
    this.createAnswerBtn("Fair");
    this.createAnswerBtn("Likely");

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
    new ButtonComponent(this.btnsEl)
      .setButtonText(type)
      .setTooltip(
        `Generate a${
          type[0] === "U" ? "n" : ""
        } ${type.toLowerCase()} oracle answer`
      )
      .onClick(() => {
        const value = generateAnswer(
          type,
          this.view.settings.oracleLanguage || "en"
        );
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
