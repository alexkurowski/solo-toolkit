import { ButtonComponent, TFolder } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Card, DefaultDeck, clickToCopyImage, clickToCopy } from "../utils";
import { TabSelect } from "./shared/tabselect";
import { CustomDeck } from "src/utils/customdeck";
import deckImages, { jokerImages } from "../icons/deck";
import tarotImages from "../icons/tarot";

const MAX_REMEMBER_SIZE = 100;

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
      "srt:Standard",
      this.view.settings.deckJokers
        ? { ...deckImages, ...jokerImages }
        : deckImages
    );
    this.createDefaultDeck("srt:Tarot", tarotImages);

    if (this.view.settings.customDeckRoot) {
      const folder = this.view.app.vault.getFolderByPath(
        this.view.settings.customDeckRoot
      );
      if (folder) {
        this.createCustomDecks(folder);
      }
    }

    const defaultTab = Object.keys(this.tabContentEls)[0];
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
    this.resultsEl.empty();
    this.repopulateResults();
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
    this.updateCount();
  }

  addResult(card: DrawnCard, immediate = false) {
    const { image, flip, file } = card;

    const parentElClass = ["deck-result", "image-result-content"];
    if (flip) parentElClass.push(`flip${flip}`);
    if (immediate) parentElClass.push("nofade");
    const parentEl = this.resultsEl.createDiv(parentElClass.join(" "));

    if (!this.view.isMobile) {
      this.resultsEl.insertAfter(parentEl, null);
    }

    if (!image) return;

    parentEl.createEl("img").setAttr("src", image);

    const zoomEl = parentEl.createDiv("image-result-zoom");
    zoomEl.createEl("img").setAttr("src", image);
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
          if (file) clickToCopy(`![[${file.path}]]`)(event);
          return;
        case "path":
          if (file) clickToCopy(file.path)(event);
          return;
        case "png":
          if (file) clickToCopyImage(image, flip || 0)(event);
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

  createDefaultDeck(tabName: string, data: Record<string, string>) {
    const label = tabName.replace("srt:", "");
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, label);

    const deck = this.decks[tabName];
    if (deck && deck instanceof DefaultDeck) {
      deck.update(data);
    } else {
      this.decks[tabName] = new DefaultDeck(tabName, data);
    }

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

    const deck = this.decks[tabName];
    if (deck instanceof CustomDeck) {
      deck.update(folder);
    } else {
      this.decks[tabName] = new CustomDeck(this.view.app.vault, folder);
    }

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
  }

  updateCount() {
    const sizeEl =
      this.tabContentEls[this.tab]?.children?.[
        (this.tabContentEls[this.tab]?.children?.length || 0) - 1
      ];

    const [current, max] = this.decks[this.tab]?.size?.() || [];
    sizeEl.setText(`${current || 0} / ${max || 0}`);
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
