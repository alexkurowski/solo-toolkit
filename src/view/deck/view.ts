import { ButtonComponent, setTooltip, TFolder } from "obsidian";
import { SoloToolkitView as View } from "../index";
import { Card, DefaultDeck, clickToCopyImage, clickToCopy } from "../../utils";
import { TabSelect } from "../shared/tabselect";
import { CustomDeck } from "./customdeck";

const MAX_REMEMBER_SIZE = 100;
const BLANK_CARD =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

type DrawnCard = Card;

export class DeckView {
  view: View;
  decks: Record<string, DefaultDeck | CustomDeck>;
  drawn: DrawnCard[];

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
    this.createDefaultDeck(
      "Standard",
      this.view.settings.deckJokers ? [] : ["JokerBlack", "JokerRed"]
    );
    this.createDefaultDeck("Tarot", []);

    if (this.view.settings.customDeckRoot) {
      const folder = this.view.app.vault.getFolderByPath(
        this.view.settings.customDeckRoot
      );
      if (folder) {
        this.createCustomDecks(folder);
      }
    }

    const availableTabs = Object.keys(this.tabContentEls);
    const defaultTab = availableTabs.includes(this.view.settings.deckTab)
      ? this.view.settings.deckTab
      : availableTabs[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    this.repopulateResults();
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

  addResult(card: DrawnCard, immediate = false) {
    const { image, flip, file, path, url } = card;

    const parentElClass = ["deck-result", "image-result-content"];
    if (flip) parentElClass.push(`deck-flip${flip}`);
    if (immediate) parentElClass.push("nofade");
    const parentEl = this.resultsEl.createDiv(parentElClass.join(" "));

    if (!this.view.isMobile) {
      this.resultsEl.insertAfter(parentEl, null);
    }

    if (!image) return;

    const imgEl = parentEl.createEl("img");
    imgEl.setAttr("src", image);
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
    const zoomImgEl = zoomEl.createEl("img");
    zoomImgEl.setAttr("src", image);
    zoomImgEl.onerror = () => {
      zoomEl.remove();
    };
    zoomEl.onmousedown = (event) => {
      event.stopPropagation();
      zoomEl.removeClass("shown");
    };

    parentEl.onmousedown = (event) => {
      event.preventDefault();
      const isShown = zoomEl.hasClass("shown");
      zoomEl.toggleClass("shown", !isShown);
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
            clickToCopyImage(image, flip || 0)(event);
          }
          return;
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

  createDefaultDeck(tabName: string, excludedKeys: string[]) {
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, tabName);

    const deck = this.decks[tabName];
    if (deck && deck instanceof DefaultDeck) {
      deck.update(excludedKeys);
    } else {
      this.decks[tabName] = new DefaultDeck(
        tabName,
        this.view.app.vault,
        excludedKeys
      );
    }

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Draw")
      .onClick(async () => {
        const card = await this.decks[tabName].draw();
        if (!this.view.settings.deckFlip) card.flip = 0;
        this.drawn.push(card);
        this.addResult(card);
        this.updateCount();
      });

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Shuffle")
      .onClick(() => {
        this.decks[tabName].shuffle();
        this.updateCount();
      });

    this.tabContentEls[tabName].createDiv("deck-size");
  }

  createCustomDecks(folder: TFolder) {
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        this.createCustomDeck(child);
      }
    }
  }

  createCustomDeck(folder: TFolder) {
    const tabName = folder.name;
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, tabName);

    if (!this.decks[tabName] || !(this.decks[tabName] instanceof CustomDeck)) {
      this.decks[tabName] = new CustomDeck(this.view.app.vault, folder);
    }
    const deck = this.decks[tabName];
    if (deck instanceof CustomDeck) {
      deck.update(folder).then(() => {
        new ButtonComponent(this.tabContentEls[tabName])
          .setButtonText("Draw")
          .onClick(async () => {
            const card = await this.decks[tabName].draw();
            this.drawn.push(card);
            this.addResult(card);
            this.updateCount();
          });

        new ButtonComponent(this.tabContentEls[tabName])
          .setButtonText("Shuffle")
          .onClick(() => {
            this.decks[tabName].shuffle();
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

    if (sizeEl) {
      const [current, max] = this.decks[this.tab]?.size?.() || [];
      sizeEl.setText(`${current || 0} / ${max || 0}`);
    }
  }

  repopulateResults() {
    while (this.drawn.length > MAX_REMEMBER_SIZE) {
      this.drawn.shift();
    }

    for (const drawn of this.drawn) {
      this.addResult(drawn, true);
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
