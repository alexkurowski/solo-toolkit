import { Notice } from "obsidian";

export const clickToCopy = (value: string) => (event?: MouseEvent) => {
  event?.preventDefault();
  navigator.clipboard.writeText(value);
  new Notice("Copied to clipboard");
};

export const clickToCopyImage =
  (value: string, flip: number) => (event: MouseEvent) => {
    event.preventDefault();

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = function (event) {
      const target = event.target as HTMLImageElement;
      if (flip === 1 || flip === 3) {
        canvas.width = target.naturalHeight;
        canvas.height = target.naturalWidth;
      } else {
        canvas.width = target.naturalWidth;
        canvas.height = target.naturalHeight;
      }

      // Make image not larger that 300px to save on space
      let scale = 1;
      const maxSize = 300;
      if (canvas.width > maxSize || canvas.height > maxSize) {
        scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
        canvas.width = Math.floor(canvas.width * scale);
        canvas.height = Math.floor(canvas.height * scale);
      }

      if (ctx) {
        if (flip) {
          switch (flip) {
            case 1:
              ctx.translate(canvas.width, 0);
              break;
            case 2:
              ctx.translate(canvas.width, canvas.height);
              break;
            case 3:
              ctx.translate(0, canvas.height);
              break;
          }
          ctx.rotate((flip * 90 * Math.PI) / 180);
        }
        ctx.scale(scale, scale);
        ctx.drawImage(target, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(() => {
                new Notice("Copied to clipboard");
              })
              .catch((error) => {
                new Notice(`Failed to copy: ${error}`);
              });
          }
        }, "image/png");
      }
    };

    img.src = value;
  };
