import { ButtonComponent, ExtraButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { clickToCopy, capitalize, an } from "../utils";
import { TabSelect } from "./shared/tabselect";
import {
  Oracle,
  StandardOracle,
  Standard2Oracle,
  MythicOracle,
  FuOracle,
  MuneOracle,
  AnswerVariant,
  Language,
} from "src/utils/oracles";

const MAX_REMEMBER_SIZE = 100;

const tabLabels: { [word: string]: string } = {
  default: "Default",
  default2: "d6 + X",
  mythic: "Mythic",
  fu: "Freeform Universal",
  mune: "Mune",
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
      default2: new Standard2Oracle(),
      mythic: new MythicOracle(this.view.settings.mythicFactor || 5),
      fu: new FuOracle(),
      mune: new MuneOracle(),
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
    this.createOracle("default2");
    this.createOracle("mythic");
    this.createOracle("fu");
    this.createOracle("mune");

    const availableTabs = Object.keys(this.tabContentEls);
    const defaultTab = availableTabs.includes(this.view.settings.oracleTab)
      ? this.view.settings.oracleTab
      : availableTabs[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    this.repopulateResults();
  }

  reset() {
    this.answers = [];
    this.resultsEl.empty();
  }

  setTab(newTab: string) {
    this.tab = newTab;
    this.view.setSettings({ oracleTab: newTab });
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

    el.onclick = (event) => {
      switch (this.view.settings.wordClipboardMode) {
        case "plain":
          return clickToCopy(value)(event);
        case "code":
          return clickToCopy(`\`${value}\``)(event);
      }
    };

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
      this.createMythicFactorBtns(tabName);
    } else if (tabName === "default2") {
      this.createDefault2Btn(tabName, "-2");
      this.createDefault2Btn(tabName, "-1");
      this.createDefault2Btn(tabName, "0");
      this.createDefault2Btn(tabName, "+1");
      this.createDefault2Btn(tabName, "+2");
    } else if (
      tabName === "default" ||
      tabName === "fu" ||
      tabName === "mune"
    ) {
      this.createDefaultBtn(tabName, "low");
      this.createDefaultBtn(tabName, "mid");
      this.createDefaultBtn(tabName, "high");
    }
  }

  createDefaultBtn(tabName: string, type: AnswerVariant) {
    const label = oracleLabels[type] || capitalize(type);
    const a = an(label);
    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(label)
      .setTooltip(`Generate ${a} ${label.toLowerCase()} oracle answer`)
      .onClick(() => {
        const oracle = this.oracles[tabName];
        if (!oracle) return;
        oracle.setLanguage(
          (this.view.settings.oracleLanguage as Language) || "en"
        );
        if (oracle instanceof StandardOracle) {
          oracle.setConfig({
            bias: this.view.settings.standardOracleBias,
            events: this.view.settings.standardOracleEvents,
          });
        }
        const value = oracle.getAnswer(type);
        this.answers.push([label, value]);
        this.addResult(label, value);
      });
  }

  createDefault2Btn(tabName: string, type: string) {
    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText(type)
      .setTooltip(`Generate a ${type} oracle answer`)
      .onClick(() => {
        const oracle = this.oracles[tabName];
        if (!oracle || !(oracle instanceof Standard2Oracle)) return;
        oracle.setLanguage(
          (this.view.settings.oracleLanguage as Language) || "en"
        );
        oracle.setConfig({
          events: this.view.settings.standardOracleEvents,
        });
        const value = oracle.getAnswer(type);
        this.answers.push([type, value]);
        this.addResult(type, value);
      });
  }

  createMythicBtn(tabName: string, type: string) {
    const label = oracleLabels[type] || capitalize(type);
    const a = an(label);
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

  createMythicFactorBtns(tabName: string) {
    const containerEl = this.tabContentEls[tabName].createDiv("mythic-factor");
    const oracle = this.oracles[tabName];
    if (!oracle || !(oracle instanceof MythicOracle)) return;

    new ExtraButtonComponent(containerEl)
      .setIcon("minus")
      .setTooltip("Decrease factor")
      .onClick(() => {
        oracle.changeFactor(-1);
        counterEl.setText(oracle.factor.toString());
        this.view.setSettings({ mythicFactor: oracle.factor });
      });
    const counterEl = containerEl.createDiv("counter");
    counterEl.setText(oracle.factor.toString());
    new ExtraButtonComponent(containerEl)
      .setIcon("plus")
      .setTooltip("Increase factor")
      .onClick(() => {
        oracle.changeFactor(+1);
        counterEl.setText(oracle.factor.toString());
        this.view.setSettings({ mythicFactor: oracle.factor });
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
