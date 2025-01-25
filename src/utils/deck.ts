import { base64ToArrayBuffer, Vault } from "obsidian";

const deckMemo: Record<string, string[]> = {};

export const exportDeck = async (
  vault: Vault,
  folderName: string,
  data: Record<string, string>
) => {
  const adapter = vault.adapter;
  const basePath =
    vault.configDir + "/plugins/solo-rpg-toolkit/decks/" + folderName;

  try {
    await adapter.mkdir(basePath);
    const existingFiles = await adapter.list(basePath);
    await Promise.all(
      Object.keys(data)
        .filter((key) => {
          const filename = `${key}.png`;
          return !existingFiles.files?.includes(basePath + "/" + filename);
        })
        .map(async (key) => {
          const filename = `${key}.png`;
          return adapter.writeBinary(
            basePath + "/" + filename,
            base64ToArrayBuffer(data[key].trim())
          );
        })
    );
    deckMemo[folderName] = Object.keys(data);
  } catch (error) {
    // Failed to export deck images
  }
};

export const getDeck = (folderName: string) => deckMemo[folderName];
