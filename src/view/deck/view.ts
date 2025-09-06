import { ButtonComponent, setTooltip, TFolder } from "obsidian";
import { SoloToolkitView as View } from "../index";
import { clickToCopyImage, clickToCopy, exportDeck } from "../../utils";
import { defaultDeckImages } from "../../icons";
import { TabSelect } from "../shared/tabselect";
import { Deck } from "./deck";
import { DrawType, DrawnCard } from "./types";

const MAX_REMEMBER_SIZE = 100;
const BLANK_CARD =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export class DeckView {
  view: View;
  deckRoot: string;
  decks: Record<string, Deck>;
  drawn: [DrawType, DrawnCard][];

  tab: string;
  tabSelect: TabSelect;
  tabContainerEl: HTMLElement;
  tabContentEls: Record<string, HTMLElement>;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.drawn = [];
    this.decks = {};
  }

  create() {
    // Create layout
    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    this.tabContainerEl = this.view.tabViewEl.createDiv(
      "deck-buttons-container"
    );
    this.tabContentEls = {};

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    } else {
      this.tabSelect = new TabSelect(
        this.view.tabViewEl,
        this.setTab.bind(this)
      );
    }

    // Populate layout
    const rootFolder = this.getRootFolder();

    this.createDefaultDeck(rootFolder, "Standard");
    this.createDefaultDeck(rootFolder, "Tarot");

    if (rootFolder) {
      this.createCustomDecks(rootFolder);
    }

    const availableTabs = Object.keys(this.tabContentEls);
    const defaultTab = availableTabs.includes(this.view.settings.deckTab)
      ? this.view.settings.deckTab
      : availableTabs[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    this.repopulateResults();
  }

  private getRootFolder(): TFolder | null {
    // Update root path
    this.deckRoot = this.view.settings.customDeckRoot || "";
    this.deckRoot = this.deckRoot.replace(/^\/+|\/+$/g, "");

    // Find the folder
    const folder = this.view.app.vault.getFolderByPath(this.deckRoot || "/");
    if (folder && folder instanceof TFolder) {
      return folder;
    } else {
      return null;
    }
  }

  reset() {
    for (const key in this.decks) {
      this.decks[key].shuffle();
    }
    this.drawn = [];
  }

  onResize() {
    if (this.resultsEl) {
      this.resultsEl.empty();
      this.repopulateResults();
    }
  }

  setTab(newTab: string) {
    this.tab = newTab;
    this.view.setSettings({ deckTab: newTab });
    for (const tabName in this.tabContentEls) {
      if (tabName === newTab) {
        this.tabContentEls[tabName].show();
      } else {
        this.tabContentEls[tabName].hide();
      }
    }
    this.updateCount();
  }

  addResult(type: DrawType, drawnCard: DrawnCard, immediate = false) {
    const { card, faceImage, backImage, flip, file, path, url } = drawnCard;

    const parentElClass = ["deck-result", "image-result-content"];
    if (flip) parentElClass.push(`deck-flip${flip}`);
    if (immediate) parentElClass.push("nofade");
    const parentEl = this.resultsEl.createDiv(parentElClass.join(" "));

    if (!this.view.isMobile) {
      this.resultsEl.insertAfter(parentEl, null);
    }

    if (!faceImage) return;

    const imgEl = parentEl.createEl("img");
    imgEl.setAttr("src", faceImage);
    imgEl.onerror = () => {
      imgEl.setAttr("src", BLANK_CARD);
      if (file) {
        setTooltip(imgEl, `Failed to load ${file.name}`);
      } else if (path) {
        setTooltip(imgEl, `Failed to load ${path}`);
      } else if (url) {
        setTooltip(imgEl, `Failed to load ${url}`);
      }
    };

    const zoomEl = parentEl.createDiv("image-result-zoom");
    if (backImage) {
      zoomEl.classList.add("with-back");
    }

    const zoomFaceImgEl = zoomEl.createEl("img");
    zoomFaceImgEl.setAttr("src", faceImage);
    zoomFaceImgEl.onerror = () => {
      zoomEl.remove();
    };
    if (backImage) {
      const zoomBackImgEl = zoomEl.createEl("img");
      zoomBackImgEl.setAttr("src", backImage);
      zoomBackImgEl.onerror = () => {
        zoomBackImgEl.remove();
      };
    }
    zoomEl.onmousedown = (event) => {
      event.stopPropagation();
      zoomEl.removeClass("shown");
    };

    parentEl.onmousedown = (event) => {
      event.preventDefault();
      const isShown = zoomEl.hasClass("shown");
      zoomEl.toggleClass("shown", !isShown);
      if (event.button === 2) {
        this.drawn.splice(
          this.drawn.findLastIndex(
            (drawn) => drawn[0] === type && drawn[1] === drawnCard
          ),
          1
        );
        parentEl.remove();
        const deck = this.decks[type];
        if (card && deck instanceof Deck) {
          deck.shuffleIn(card);
        }
        this.updateCount();
      } else {
        switch (this.view.settings.deckClipboardMode) {
          case "md":
            if (file) {
              if (flip) {
                clickToCopy(`![[${file.path}|srt-flip${flip}]]`)(event);
              } else {
                clickToCopy(`![[${file.path}]]`)(event);
              }
            } else if (path) {
              const resourcePath =
                this.view.app.vault.adapter.getResourcePath(path);
              if (flip) {
                clickToCopy(`![srt-flip${flip}](${resourcePath})`)(event);
              } else {
                clickToCopy(`![srt-flip0](${resourcePath})`)(event);
              }
            } else if (url) {
              if (flip) {
                clickToCopy(`![srt-flip${flip}](${url})`)(event);
              } else {
                clickToCopy(`![img](${url})`)(event);
              }
            }
            return;
          case "path":
            if (file) {
              clickToCopy(file.path)(event);
            } else if (path) {
              clickToCopy(path)(event);
            } else if (url) {
              clickToCopy(url)(event);
            }
            return;
          case "png":
            if (file || path) {
              clickToCopyImage(faceImage, flip || 0)(event);
            }
            return;
        }
      }
    };
    if (!this.view.isMobile) {
      parentEl.onmouseenter = () => {
        zoomEl.toggleClass("shown", !zoomEl.hasClass("shown"));
      };
    }
    parentEl.onmouseleave = () => {
      zoomEl.removeClass("shown");
    };

    if (this.view.isMobile) {
      this.resultsEl.scrollTop = this.resultsEl.scrollHeight;
    }
  }

  createDefaultDeck(rootFolder: TFolder | null, tabName: "Standard" | "Tarot") {
    const folder = rootFolder?.children?.find(
      (child) => child instanceof TFolder && child.name === tabName
    );

    if (folder && folder instanceof TFolder) {
      this.createDeck(folder);
    } else {
      // Folder is missing, offer to create it

      this.tabContentEls[tabName] =
        this.tabContainerEl.createDiv("deck-buttons");
      this.tabSelect.addOption(tabName, tabName);

      const missingEl = this.tabContentEls[tabName].createDiv("deck-missing");

      missingEl
        .createDiv("deck-missing-message")
        .setText(`'${this.deckRoot}/${tabName}' not found`);

      new ButtonComponent(missingEl)
        .setButtonText("Fix now")
        .setTooltip(
          `This action will create folder '${this.deckRoot}/${tabName}' and populate it with default card images\n\nYou can change folder location in plugin settings`,
          {
            delay: 0,
          }
        )
        .onClick(() => {
          Promise.all([
            exportDeck({
              vault: this.view.app.vault,
              basePath: this.deckRoot,
              folderName: "Standard",
              data: defaultDeckImages.Standard,
            }),
            exportDeck({
              vault: this.view.app.vault,
              basePath: this.deckRoot,
              folderName: "Tarot",
              data: defaultDeckImages.Tarot,
            }),
          ]).then(() => {
            this.view.createTab();
          });
        });
    }
  }

  createCustomDecks(folder: TFolder) {
    for (const child of folder.children) {
      if (
        child instanceof TFolder &&
        child.name !== "Standard" &&
        child.name !== "Tarot"
      ) {
        this.createDeck(child);
      }
    }
  }

  createDeck(folder: TFolder) {
    const tabName = folder.name;
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, tabName);

    if (!this.decks[tabName] || !(this.decks[tabName] instanceof Deck)) {
      this.decks[tabName] = new Deck(this.view, folder);
    }
    const deck = this.decks[tabName];

    if (deck instanceof Deck) {
      deck.update(folder).then(() => {
        new ButtonComponent(this.tabContentEls[tabName])
          .setButtonText("Draw")
          .onClick(async () => {
            const card = await deck.draw();
            this.drawn.push([tabName, card]);
            this.addResult(tabName, card);
            this.updateCount();
          });

        new ButtonComponent(this.tabContentEls[tabName])
          .setButtonText("Shuffle")
          .onClick(() => {
            deck.shuffle();
            this.updateCount();
          });

        this.tabContentEls[tabName].createDiv("deck-size");

        this.updateCount();
      });
    }
  }

  updateCount() {
    const sizeEl =
      this.tabContentEls[this.tab]?.children?.[
        (this.tabContentEls[this.tab]?.children?.length || 0) - 1
      ];

    if (sizeEl && sizeEl.classList.contains("deck-size")) {
      const [current, max] = this.decks[this.tab]?.size?.() || [];
      sizeEl.setText(`${current || 0} / ${max || 0}`);
    }
  }

  repopulateResults() {
    while (this.drawn.length > MAX_REMEMBER_SIZE) {
      this.drawn.shift();
    }

    for (const drawn of this.drawn) {
      const [type, card] = drawn;
      this.addResult(type, card, true);
    }

    // Add blank cards for the grid
    const availableWidth = this.view.tabViewEl.innerWidth;
    const gridGap = 16;
    const cardWidth = 100;
    let maxCardsInRow = Math.floor(availableWidth / cardWidth);
    if (
      maxCardsInRow * cardWidth + gridGap * (maxCardsInRow - 1) >
      availableWidth
    ) {
      maxCardsInRow--;
    }

    for (let i = 0; i < maxCardsInRow; i++) {
      const fakeCardEl = this.resultsEl.createDiv(
        "deck-result fake-result-content"
      );
      if (this.view.isMobile) {
        this.resultsEl.insertAfter(fakeCardEl, null);
      }
    }

    if (this.view.isMobile) {
      this.resultsEl.scrollTop = this.resultsEl.scrollHeight;
    }
  }
}
