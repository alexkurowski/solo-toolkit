import { ButtonComponent, setIcon, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Deck, Tarot, capitalize, clickToCopy } from "../utils";
import { TabSelect } from "./shared/tabselect";

const MAX_REMEMBER_SIZE = 100;

export class DeckView {
  view: View;
  deck: Deck;
  tarot: Tarot;
  drawn: [string, string, number?][];

  tab: string;
  tabSelect: TabSelect;
  tabContainerEl: HTMLElement;
  tabContentEls: Record<string, HTMLElement>;
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.deck = new Deck(this.view.settings.deckJokers);
    this.tarot = new Tarot();
    this.drawn = [];
  }

  create() {
    // Create layout
    this.deck.setJokers(this.view.settings.deckJokers);

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
    this.createDeckBtns();
    this.createTarotBtns();

    const defaultTab = Object.keys(this.tabContentEls)[0];
    this.tabSelect.setValue(this.tab || defaultTab);

    this.repopulateResults();
  }

  reset() {
    this.deck.shuffle();
    this.tarot.shuffle();
    this.drawn = [];
    this.resultsEl.empty();
    this.updateCount();
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

  addResult(value: string, suit: string, index?: number, immediate = false) {
    const parentElClass = ["deck-result"];
    if (immediate) parentElClass.push("nofade");
    const parentEl = this.resultsEl.createDiv(parentElClass.join(" "));

    if (typeof index === "number") {
      // Tarot
      const elClass = ["tarot-result-content"];
      const el = parentEl.createDiv(elClass.join(" "));

      setTooltip(parentEl, `${value}: ${suit}`);
      el.createSpan("tarot-result-index").setText(index.toString());
      el.createSpan("tarot-result-value").setText(value);
    } else {
      // Deck
      const isRed = suit === "heart" || suit === "diamond" || suit === "red";
      const isBlack = suit === "club" || suit === "spade" || suit === "black";
      const isSuit = suit !== "red" && suit !== "black";

      const elClass = ["deck-result-content"];
      if (isRed) elClass.push("deck-result-red");
      if (isBlack) elClass.push("deck-result-black");
      const el = parentEl.createDiv(elClass.join(" "));

      let tooltipValue = value;
      if (value === "J") tooltipValue = "Jack";
      if (value === "Q") tooltipValue = "Queen";
      if (value === "K") tooltipValue = "King";
      if (value === "A") tooltipValue = "Ace";
      if (value === "Joker") tooltipValue = "joker";
      const tooltipText = isSuit
        ? `${tooltipValue} of ${suit}s`
        : `${capitalize(suit)} ${tooltipValue}`;
      setTooltip(parentEl, tooltipText);
      parentEl.onclick = clickToCopy(tooltipText);

      const valueEl = el.createSpan("deck-result-value");
      valueEl.setText(value);

      if (isSuit) {
        const typeEl = el.createSpan("deck-result-type");
        setIcon(typeEl, suit);
      }
    }
  }

  createDeckBtns() {
    const tabName = "Standard";
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, tabName);

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit] = this.deck.draw();
        this.drawn.push([value, suit]);
        this.addResult(value, suit);
        this.updateCount();
      });

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Shuffle")
      .onClick(() => {
        this.deck.shuffle();
        this.updateCount();
      });

    this.tabContentEls[tabName].createDiv("deck-size");
  }

  createTarotBtns() {
    const tabName = "Tarot";
    this.tabContentEls[tabName] = this.tabContainerEl.createDiv("deck-buttons");
    this.tabSelect.addOption(tabName, tabName);

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit, index] = this.tarot.draw();
        this.drawn.push([value, suit, index]);
        this.addResult(value, suit, index);
        this.updateCount();
      });

    new ButtonComponent(this.tabContentEls[tabName])
      .setButtonText("Shuffle")
      .onClick(() => {
        this.tarot.shuffle();
        this.updateCount();
      });

    this.tabContentEls[tabName].createDiv("deck-size");
  }

  updateCount() {
    const sizeEl =
      this.tabContentEls[this.tab]?.children?.[
        (this.tabContentEls[this.tab]?.children?.length || 0) - 1
      ];

    if (!sizeEl) return;
    if (this.tab === "Standard") {
      const [current, max] = this.deck.size();
      sizeEl.setText(`${current} / ${max}`);
    } else if (this.tab === "Tarot") {
      const [current, max] = this.tarot.size();
      sizeEl.setText(`${current} / ${max}`);
    }
  }

  repopulateResults() {
    while (this.drawn.length > MAX_REMEMBER_SIZE) {
      this.drawn.shift();
    }

    for (const drawn of this.drawn) {
      const [value, suit, index] = drawn;
      this.addResult(value, suit, index, true);
    }
  }
}
