import { Vault } from "obsidian";

export const backwardCompatibleFixes = async (vault: Vault) => {
  // Remove old deck files
  const adapter = vault.adapter;
  const basePath = vault.configDir + "/plugins/solo-rpg-toolkit/decks/";
  if (await adapter.exists(basePath)) {
    await adapter.rmdir(basePath, true);
  }
};
