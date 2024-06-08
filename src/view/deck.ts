import { ButtonComponent, setIcon, setTooltip } from "obsidian";
import { SoloToolkitView as View } from "./index";
import { Deck, Tarot, capitalize, clickToCopy, last } from "../utils";

const MAX_REMEMBER_SIZE = 100;

export class DeckView {
  view: View;
  deck: Deck;
  tarot: Tarot;
  drawn: [string, string, number?][];
  countEls: HTMLElement[];
  btnsEls: HTMLElement[];
  resultsEl: HTMLElement;

  constructor(view: View) {
    this.view = view;
    this.deck = new Deck(this.view.settings.deckJokers);
    this.tarot = new Tarot();
    this.drawn = [];
  }

  create() {
    this.deck.setJokers(this.view.settings.deckJokers);

    if (this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.btnsEls = [];
    this.countEls = [];

    this.btnsEls.push(this.view.tabViewEl.createDiv("deck-buttons"));
    this.createDeckBtns();
    this.createDeckCounter();

    if (this.view.settings.deckTarot) {
      this.btnsEls.push(this.view.tabViewEl.createDiv("deck-buttons"));
      this.createTarotBtns();
      this.createTarotCounter();
    }

    if (!this.view.isMobile) {
      this.resultsEl = this.view.tabViewEl.createDiv("deck-results");
    }

    this.updateCount();
    this.repopulateResults();
  }

  reset() {
    this.deck.shuffle();
    this.drawn = [];
    this.resultsEl.empty();
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
    new ButtonComponent(last(this.btnsEls))
      .setButtonText("Draw a card")
      .onClick(() => {
        const [value, suit] = this.deck.draw();
        this.drawn.push([value, suit]);
        this.addResult(value, suit);
        this.updateCount();
      });

    new ButtonComponent(last(this.btnsEls))
      .setButtonText("Shuffle")
      .onClick(() => {
        this.deck.shuffle();
        this.updateCount();
      });
  }

  createDeckCounter() {
    this.countEls[0] = last(this.btnsEls).createDiv("deck-size");
  }

  createTarotBtns() {
    new ButtonComponent(last(this.btnsEls))
      .setButtonText("Draw a tarot")
      .onClick(() => {
        const [value, suit, index] = this.tarot.draw();
        this.drawn.push([value, suit, index]);
        this.addResult(value, suit, index);
        this.updateCount();
      });

    new ButtonComponent(last(this.btnsEls))
      .setButtonText("Shuffle")
      .onClick(() => {
        this.tarot.shuffle();
        this.updateCount();
      });
  }

  createTarotCounter() {
    this.countEls[1] = last(this.btnsEls).createDiv("deck-size");
  }

  updateCount() {
    const [deckCurrent, deckMax] = this.deck.size();
    if (this.countEls[0])
      this.countEls[0].setText(`${deckCurrent} / ${deckMax}`);
    const [tarotCurrent, tarotMax] = this.tarot.size();
    if (this.countEls[1])
      this.countEls[1].setText(`${tarotCurrent} / ${tarotMax}`);
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
