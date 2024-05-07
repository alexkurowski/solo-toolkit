# Solo RPG Toolkit

A plugin for Obsidian (https://obsidian.md) that adds helpful features for playing TTRPGs. Its features are mainly geared towards solo gameplay using a GM emulator.

## Features

### Dice roller

Quickly roll a bunch of dice by clicking on a die icon.

### Deck of cards

A standard deck of 52 cards plus two optional joker cards.

### Random generators

A set of random word generators. Great for coming up with ideas on how to progress the story.

Additionally you may add any number of your own random tables to roll on, by creating notes inside a special folder in your vault (folder "Tables" by default).

## Installation

### From GitHub Release

Download obsidian-solo-rpg-toolkit.zip from the latest release, and extract the plugin folder into your vault's plugins folder: `<path-to-vault>/.obsidian/plugins/`.

Note that `.obsidian` folder in your vault may be hidden on Linux and MacOS.

### From source

You'll need at least node-18 to be installed on your machine. Run the following commands while inside the source folder:

```
npm install
npm run build
npm run deploy
```

You will find a newly generated plugin folder `obsidian-solo-rpg-toolkit` inside folder `dist`. Move the `obsidian-solo-rpg-toolkit` plugin folder into your vault's plugins folder: `<path-to-vault>/.obsidian/plugins/`.

Note that `.obsidian` folder in your vault may be hidden on Linux and MacOS.

### Updating

Simply replace `<path-to-vault>/.obsidian/plugins/obsidian-solo-rpg-toolkit` folder with a new one.

Note that plugin settings are stored in the file `<path-to-vault>/.obsidian/plugins/obsidian-solo-rpg-toolkit/data.json`. You may want to keep it after updating to a newer version.
