import { TFile, TFolder, ButtonComponent } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { generateWord, randomFrom, clickToCopy } from "../utils";

const MAX_REMEMBER_SIZE = 1000;
const DEFAULT = "DEFAULT";

const wordLabels: { [word: string]: string } = {
  Subject: "a subject",
  Action: "an action",
  Name: "a name",
  Aspects: "character aspects",
  Skills: "character skills",
  Job: "occupation",
  Town: "a town name",
  Place: "a place description",
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
    this.createWordBtn("Subject");
    this.createWordBtn("Action");
    this.createWordBtn("Name");
    this.createWordBtn("Aspects");
    this.createWordBtn("Skills");
    this.createWordBtn("Job");
    this.createWordBtn("Town");
    this.createWordBtn("Describe");

    if (this.view.settings.customTableRoot) {
      const folder = this.view.app.vault.getFolderByPath(
        this.view.settings.customTableRoot
      );
      if (folder) {
        this.createCustomWordBtns(folder);
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

  createCustomWordBtns(folder: TFolder) {
    for (const child of folder.children) {
      if (child instanceof TFile) {
        if (child.extension === "md") {
          this.createCustomWordBtn(child);
        }
      }
      if (child instanceof TFolder) {
        this.createCustomWordBtns(child);
      }
    }
  }

  createCustomWordBtn(file: TFile) {
    const type = file.basename;
    const templates: string[] = [];
    const values: Record<string, string[]> = { [DEFAULT]: [] };

    this.view.app.vault.cachedRead(file).then((content: string) => {
      if (!content) return;

      const lines = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line);

      let currentKey = "";
      let readingProperties = false;

      for (const i in lines) {
        const line = lines[i];

        // Switch properties parsing mode
        if (i == "0" && line === "---") {
          readingProperties = true;
          continue;
        } else if (readingProperties && line === "---") {
          readingProperties = false;
          continue;
        }

        // New template
        if (readingProperties) {
          templates.push(
            line
              .substring(line.indexOf(":") + 1)
              .trim()
              .replace(/^"|"$/g, "")
              .toLowerCase()
          );
          continue;
        }

        // Treat headers as template keys
        if (line.startsWith("#")) {
          currentKey = line.replace(/#/g, "").trim().toLowerCase();
          values[currentKey] = [];
          continue;
        }

        values[DEFAULT].push(line);
        if (currentKey) values[currentKey].push(line);
      }

      console.log(type, { templates, values });
    });

    const getValuesForKey = (key: string): string[] => {
      return (
        values[key] ||
        values[key + "s"] ||
        values[key.replace(/y$/, "ies")] || [`{${key}}`]
      );
    };

    const generateCustomWord = (): string => {
      if (templates.length) {
        const template = randomFrom(templates);
        const lastSubs: Record<string, string> = {};
        return template
          .replace(/{+ ?[^}]+ ?}+/g, (wkey: string) => {
            const key = wkey.replace(/{|}/g, "").trim().toLowerCase();
            console.log({ wkey, key });
            if (!key) return "";
            return (lastSubs[key] = randomFrom(
              getValuesForKey(key),
              lastSubs[key] || null
            ));
          })
          .trim();
      } else {
        return randomFrom(values[DEFAULT]);
      }
    };

    new ButtonComponent(this.wordBtnsEl)
      .setButtonText(type)
      .setTooltip(`Generate ${type.toLowerCase()}`)
      .onClick(() => {
        const value = generateCustomWord();
        if (!value) return;
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
