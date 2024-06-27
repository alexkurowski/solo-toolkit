import { ButtonComponent, ExtraButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { clickToCopy, capitalize, vowels } from "../utils";
import { TabSelect } from "./shared/tabselect";
import {
  Oracle,
  StandardOracle,
  MythicOracle,
  FuOracle,
  AnswerVariant,
  Language,
} from "src/utils/oracles";

const MAX_REMEMBER_SIZE = 100;

const tabLabels: { [word: string]: string } = {
  default: "Default",
  mythic: "Mythic",
  fu: "Freeform Universal",
};

const oracleLabels: { [word: string]: string } = {
  low: "Unlikely",
  mid: "Fair",
  high: "Likely",
};

export class OracleView {
  view: View;
  oracles: Record<string, Oracle>;
  answers: [string, string][];

  tab: string;
  tabSelect: TabSelect;
  tabContainerEl: HTMLElement;
  tabContentEls: Record<string, HTMLElement>;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.oracles = {
      default: new StandardOracle(),
      mythic: new MythicOracle(),
      fu: new FuOracle(),
    };
    this.answers = [];
  }

  create() {
    // Create layout
    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    this.tabContainerEl = this.view.tabViewEl.createDiv(
      "oracle-buttons-container"
    );
    this.tabContentEls = {};

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    // Populate layout
    this.createOracle("default");
    this.createOracle("mythic");
    this.createOracle("fu");

    const defaultTab = Object.keys(this.tabContentEls)[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    this.repopulateResults();

    // if (this.view.isMobile) {
    //   this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    // }

    // this.btnsEl = this.view.tabViewEl.createDiv("oracle-buttons");
    // this.createAnswerBtn("Unlikely");
    // this.createAnswerBtn("Fair");
    // this.createAnswerBtn("Likely");

    // if (!this.view.isMobile) {
    //   this.resultsEl = this.view.tabViewEl.createDiv("oracle-results");
    // }

    // this.repopulateResults();
  }

  reset() {
    this.answers = [];
    this.resultsEl.empty();
  }

  setTab(newTab: string) {
    this.tab = newTab;
    for (const tabName in this.tabContentEls) {
      if (tabName === newTab) {
        this.tabContentEls[tabName].show();
      } else {
        this.tabContentEls[tabName].hide();
      }
    }
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

  createOracle(tabName: string) {
    const label = tabLabels[tabName] || capitalize(tabName);
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv(
      `oracle-buttons oracle-buttons-${tabName}`
    );
    this.tabSelect.addOption(tabName, label);

    if (tabName === "default") {
      this.createDefaultBtn(tabName, "low");
      this.createDefaultBtn(tabName, "mid");
      this.createDefaultBtn(tabName, "high");
    }
    if (tabName === "mythic") {
      this.createMythicBtn(tabName, "certain");
      this.createMythicBtn(tabName, "nearly certain");
      this.createMythicBtn(tabName, "very likely");
      this.createMythicBtn(tabName, "likely");
      this.createMythicBtn(tabName, "50/50");
      this.createMythicBtn(tabName, "unlikely");
      this.createMythicBtn(tabName, "very unlikely");
      this.createMythicBtn(tabName, "nearly impossible");
      this.createMythicBtn(tabName, "impossible");
      this.createMythicChaosBtn(tabName);
    }
    if (tabName === "fu") {
      this.createDefaultBtn(tabName, "low");
      this.createDefaultBtn(tabName, "mid");
      this.createDefaultBtn(tabName, "high");
    }
  }

  createDefaultBtn(tabName: string, type: AnswerVariant) {
    const label = oracleLabels[type] || capitalize(type);
    const a = vowels.includes(label[0].toLowerCase()) ? "an" : "a";
    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(label)
      .setTooltip(`Generate ${a} ${label.toLowerCase()} oracle answer`)
      .onClick(() => {
        const oracle = this.oracles[tabName];
        if (!oracle) return;
        oracle.setLanguage(
          (this.view.settings.oracleLanguage as Language) || "en"
        );
        const value = oracle.getAnswer(type);
        this.answers.push([label, value]);
        this.addResult(label, value);
      });
  }

  createMythicBtn(tabName: string, type: string) {
    const label = oracleLabels[type] || capitalize(type);
    const a = vowels.includes(label[0].toLowerCase()) ? "an" : "a";
    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(label)
      .setTooltip(`Generate ${a} ${label.toLowerCase()} oracle answer`)
      .onClick(() => {
        const oracle = this.oracles[tabName];
        if (!oracle || !(oracle instanceof MythicOracle)) return;
        oracle.setLanguage(
          (this.view.settings.oracleLanguage as Language) || "en"
        );
        const value = oracle.getAnswer(type);
        this.answers.push([label, value]);
        this.addResult(label, value);
      });
  }

  createMythicChaosBtn(tabName: string) {
    const containerEl = this.tabContentEls[tabName].createDiv("mythic-factor");
    const oracle = this.oracles[tabName];
    if (!oracle || !(oracle instanceof MythicOracle)) return;

    new ExtraButtonComponent(containerEl)
      .setIcon("minus")
      .setTooltip("Decrease factor")
      .onClick(() => {
        oracle.changeFactor(-1);
        counterEl.setText(oracle.factor.toString());
      });
    const counterEl = containerEl.createDiv("counter");
    counterEl.setText(oracle.factor.toString());
    new ExtraButtonComponent(containerEl)
      .setIcon("plus")
      .setTooltip("Increase factor")
      .onClick(() => {
        oracle.changeFactor(+1);
        counterEl.setText(oracle.factor.toString());
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
