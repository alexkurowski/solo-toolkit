import { TFile, Vault } from "obsidian";

export const replaceInFile = (opts: {
  vault: Vault;
  file: TFile;
  lineStart: number;
  lineEnd: number;
  regex: RegExp;
  newValue: string;
  replaceIndex: number;
}) => {
  opts.vault.process(opts.file, (content: string): string => {
    const lines = content.split("\n");

    const regex = new RegExp(opts.regex, "g");
    let matchIndex = 0;

    lookup: {
      for (let i = opts.lineStart; i <= opts.lineEnd; i++) {
        for (
          let match = regex.exec(lines[i]);
          match !== null;
          match = regex.exec(lines[i])
        ) {
          if (matchIndex < opts.replaceIndex) {
            matchIndex++;
          } else if (matchIndex === opts.replaceIndex) {
            lines[i] =
              lines[i].substring(0, match.index) +
              opts.newValue +
              lines[i].substring(match.index + match[0].length);
            break lookup;
          }
        }
      }

      // console.error("Match index not found")
    }

    return lines.join("\n");
  });
};

export const backwardCompatibleFixes = async (vault: Vault) => {
  // Remove old deck files
  const adapter = vault.adapter;
  const basePath = vault.configDir + "/plugins/solo-rpg-toolkit/decks/";
  if (await adapter.exists(basePath)) {
    await adapter.rmdir(basePath, true);
  }
};
