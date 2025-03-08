import { base64ToArrayBuffer, Vault } from "obsidian";

const deckMemo: Record<string, string[]> = {};

export const exportDeck = async (opts: {
  vault: Vault;
  basePath: string;
  folderName: string;
  data: Record<string, string>;
}) => {
  const { vault, basePath, folderName, data } = opts;

  const path = `${basePath}/${folderName}`.replace(/\/\/+/g, "/");

  const adapter = vault.adapter;

  try {
    await adapter.mkdir(path);
    const existingFiles = await adapter.list(path);
    await Promise.all(
      Object.keys(data)
        .filter((key) => {
          const filename = `${key}.png`;
          return !existingFiles.files?.includes(path + "/" + filename);
        })
        .map(async (key) => {
          const filename = `${key}.png`;
          return adapter.writeBinary(
            path + "/" + filename,
            base64ToArrayBuffer(data[key].trim())
          );
        })
    );
    deckMemo[folderName] = Object.keys(data);
  } catch (error) {
    // Failed to export deck images
    console.error(error);
  }
};

export const getDeck = (folderName: string) => deckMemo[folderName];
