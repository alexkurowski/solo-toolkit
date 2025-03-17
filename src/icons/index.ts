import { addIcon, removeIcon } from "obsidian";
import deckImages from "./deck";
import tarotImages from "./tarot";

export const defaultDeckImages = {
  Standard: deckImages,
  Tarot: tarotImages,
} as const;

const icons = {
  "srt-ribbon":
    '<g><path d="M23.2273 25.6239L42.0808 15.443C47.023 12.7742 52.977 12.7742 57.9191 15.443L76.7727 25.6239C80.8143 27.8064 83.3333 32.0295 83.3333 36.6227V63.3797C83.3333 67.9716 80.8157 72.1938 76.7759 74.3768L57.9234 84.5642C52.979 87.236 47.021 87.236 42.0766 84.5642L23.2241 74.3768C19.1843 72.1938 16.6667 67.9716 16.6667 63.3797V36.6227C16.6667 32.0295 19.1857 27.8063 23.2273 25.6239Z" stroke="currentColor" fill="none" stroke-width="8.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M44.1651 57.8767C44.7963 57.8767 45.3452 58.1099 45.8118 58.5765C46.2783 59.0431 46.5116 59.5919 46.5116 60.2232V62.1168C46.5116 62.7481 46.2783 63.2969 45.8118 63.7635C45.3452 64.2301 44.7963 64.4633 44.1651 64.4633H27.4514C26.8202 64.4633 26.2713 64.2301 25.8048 63.7635C25.3382 63.2969 25.1049 62.7481 25.1049 62.1168V60.2232C25.1049 58.6863 25.7224 57.4376 26.9574 56.477C31.4858 53.019 34.436 50.4667 35.8083 48.82C37.1805 47.1459 37.8666 45.4992 37.8666 43.88C37.8666 41.8217 36.7002 40.7925 34.3674 40.7925C32.7208 40.7925 30.5801 41.2591 27.9454 42.1922C27.3965 42.3843 26.8888 42.3294 26.4223 42.0275C25.9557 41.6982 25.7224 41.2591 25.7224 40.7102V37.9932C25.7224 37.2796 25.9283 36.6484 26.3399 36.0995C26.7516 35.5232 27.2868 35.1527 27.9454 34.988C30.635 34.3293 33.1873 34 35.6024 34C39.033 34 41.6676 34.8096 43.5064 36.4288C45.3726 38.0206 46.3058 40.2299 46.3058 43.0567C46.3058 45.3071 45.5922 47.4478 44.1651 49.4787C42.7654 51.5096 39.9935 54.2677 35.8494 57.7532C35.822 57.7806 35.8083 57.8081 35.8083 57.8355C35.8083 57.8629 35.822 57.8767 35.8494 57.8767H44.1651Z" fill="currentColor"/><path d="M59.7737 56.724C60.4049 58.0413 61.4066 58.7 62.7789 58.7C64.1511 58.7 65.1391 58.0413 65.7429 56.724C66.3741 55.3792 66.6897 52.9504 66.6897 49.4375C66.6897 45.9246 66.3741 43.5095 65.7429 42.1922C65.1391 40.8474 64.1511 40.175 62.7789 40.175C61.4066 40.175 60.4049 40.8474 59.7737 42.1922C59.1699 43.5095 58.868 45.9246 58.868 49.4375C58.868 52.9504 59.1699 55.3792 59.7737 56.724ZM53.4752 37.6227C55.5061 35.2076 58.6073 34 62.7789 34C66.9504 34 70.0516 35.2076 72.0825 37.6227C74.1134 40.0378 75.1289 43.9761 75.1289 49.4375C75.1289 54.8989 74.1134 58.8372 72.0825 61.2523C70.0516 63.6674 66.9504 64.875 62.7789 64.875C58.6073 64.875 55.5061 63.6674 53.4752 61.2523C51.4443 58.8372 50.4289 54.8989 50.4289 49.4375C50.4289 43.9761 51.4443 40.0378 53.4752 37.6227Z" fill="currentColor"/></g>',
  "srt-d4":
    '<path d="M42.7083 63.125L49.6667 51.9583V63.125H42.7083ZM91.3333 87.5H8.66667C5.16667 87.5 3 83.6667 4.83333 80.6667L46.1667 13.0417C47.9167 10.1667 52.0833 10.1667 53.8333 13.0417L95.1667 80.6667C97 83.6667 94.8333 87.5 91.3333 87.5ZM59.5417 63.125H55.9583V43.4167H49.625L36.4583 64.2083L36.75 68.1667H49.6667V75H55.9583V68.1667H59.5417V63.125Z" fill="currentColor"/>',
  "srt-d6":
    '<path d="M54.375 56.25C54.375 59.4583 52.5417 61.7917 50 61.7917C47.4583 61.7917 45.2083 59.4583 45.2083 56.25L45.125 53.25C45.125 53.25 46.7083 50 49.7917 50.4167C52.3333 50.4167 54.375 53.0417 54.375 56.25ZM87.5 20.8333V79.1667C87.5 83.7917 83.7917 87.5 79.1667 87.5H20.8333C16.25 87.5 12.5 83.7917 12.5 79.1667V20.8333C12.5 16.25 16.25 12.5 20.8333 12.5H79.1667C83.7917 12.5 87.5 16.25 87.5 20.8333ZM60.625 55.875C60.4167 47.7083 54.9583 45.2917 52.2083 45.2917C47.5417 45.2917 45.25 48.0417 45.25 48.0417C45.25 48.0417 45.375 39.5833 55.7917 39.7083V34.7083C55.7917 34.7083 38.875 33.0833 38.75 52.75C38.625 70.25 53.2083 66.6667 53.2083 66.6667C53.2083 66.6667 60.875 64.4583 60.625 55.875Z" fill="currentColor"/>',
  "srt-d8":
    '<path d="M50 8.33334C47.9167 8.33334 45.8333 9.12501 44.125 10.7917L10.7917 44.125C7.50001 47.375 7.50001 52.625 10.7917 55.875L44.125 89.2083C47.375 92.5 52.625 92.5 55.875 89.2083L89.2083 55.875C92.5 52.625 92.5 47.375 89.2083 44.125L55.875 10.7917C54.1667 9.12501 52.0833 8.33334 50 8.33334ZM50 34.375C55.4583 34.375 59.9167 38.3333 59.9167 43.25C59.9167 46.125 58.3333 48.6667 56 50.2917C58.9167 51.9167 60.8333 54.7083 60.8333 57.9167C60.8333 63 56 67.0833 50 67.0833C44 67.0833 39.1667 63 39.1667 57.9167C39.1667 54.7083 41.0833 51.9167 44 50.2917C41.6667 48.6667 40.125 46.125 40.125 43.25C40.125 38.3333 44.5417 34.375 50 34.375ZM50 39.5833C47.9167 39.5833 46.25 41.4583 46.25 43.75C46.25 46.0417 47.9167 47.9167 50 47.9167C52.0833 47.9167 53.75 46.0417 53.75 43.75C53.75 41.4583 52.0833 39.5833 50 39.5833ZM50 52.7083C47.4583 52.7083 45.4167 54.75 45.4167 57.2917C45.4167 59.8333 47.4583 61.875 50 61.875C52.5417 61.875 54.5833 59.8333 54.5833 57.2917C54.5833 54.75 52.5417 52.7083 50 52.7083Z" fill="currentColor"/>',
  "srt-d10":
    '<path d="M50 8.33334C47.9167 8.33334 45.8333 9.12501 44.125 10.7917L10.7917 44.125C7.5 47.375 7.5 52.625 10.7917 55.875L44.125 89.2083C47.375 92.5 52.625 92.5 55.875 89.2083L89.2083 55.875C92.5 52.625 92.5 47.375 89.2083 44.125L55.875 10.7917C54.1667 9.12501 52.0833 8.33334 50 8.33334ZM58.625 34.2083C64.5833 34.2083 69.3333 39 69.3333 44.9167V55.9167C69.3333 61.8333 64.5833 66.6667 58.625 66.6667C52.6667 66.6667 47.9167 61.8333 47.9167 55.9167V44.9167C47.9167 39 52.7083 34.2083 58.625 34.2083ZM43.1667 35.0417H43.75V66.6667H37.5V42.5417L30.0833 44.8333V39.7083L43.1667 35.0417ZM58.5833 40.2083C56.125 40.2083 54.1667 42.2083 54.1667 44.625V56.25C54.1667 58.625 56.125 60.5833 58.5833 60.5833C61 60.5833 63.0833 58.5833 63.0833 56.25V44.625C63.0833 42.1667 61 40.2083 58.5833 40.2083Z" fill="currentColor"/>',
  "srt-d12":
    '<path d="M50 8.33334L6.25 40.1667L22.9167 91.6667H77.0833L93.75 40.1667L50 8.33334ZM43.75 70.8333H37.0417V45.375L29.1667 47.7917V42.4583L42.9583 37.5H43.75V70.8333ZM70.8333 70.8333H48.5833V66.2917C48.5833 66.2917 63.4583 51.875 63.4583 47.5C63.4583 42.1667 59.0833 42.7083 59.0833 42.7083C56.25 42.9167 54.1667 45.2917 54.1667 48.125H47.6667C47.9167 42.0417 53 37.25 59.4583 37.5C69.75 37.5 69.875 45.2083 69.875 47.0833C69.875 54.4583 56.5833 65.7083 56.5833 65.7083L70.8333 65.625V70.8333Z" fill="currentColor"/>',
  "srt-d20":
    '<path d="M85.2917 27.5833L52.375 9.08334C51.7083 8.58334 50.875 8.33334 50 8.33334C49.125 8.33334 48.2917 8.58334 47.625 9.08334L14.7083 27.5833C13.375 28.2917 12.5 29.6667 12.5 31.25V68.75C12.5 70.3333 13.375 71.7083 14.7083 72.4167L47.625 90.9167C48.2917 91.4167 49.125 91.6667 50 91.6667C50.875 91.6667 51.7083 91.4167 52.375 90.9167L85.2917 72.4167C86.625 71.7083 87.5 70.3333 87.5 68.75V31.25C87.5 29.6667 86.625 28.2917 85.2917 27.5833ZM47.7083 66.5L26.2917 66.375V62.125C26.2917 62.125 40.5833 48.25 40.625 44.0417C40.625 38.875 36.375 39.4167 36.375 39.4167C36.375 39.4167 32.2917 39.5833 31.8333 44.625L25.5833 44.8333C25.5833 44.8333 25.75 34.4167 36.7917 34.4167C46.6667 34.4167 46.7917 41.8333 46.7917 43.75C46.7917 50.75 33.9583 61.5417 33.9583 61.5417L47.7083 61.5V66.5ZM72.9167 56.25C72.9167 62.0833 68.125 66.875 62.2083 66.875C56.25 66.875 51.5 62.0833 51.5 56.25V45.1667C51.5 39.25 56.25 34.4583 62.2083 34.4583C68.1667 34.4583 72.9167 39.25 72.9167 45.1667V56.25ZM66.6667 44.875V56.375C66.6667 58.8333 64.5833 60.8333 62.1667 60.8333C59.75 60.8333 57.75 58.8333 57.75 56.375V44.875C57.75 42.4167 59.75 40.4583 62.1667 40.4583C64.5833 40.4583 66.6667 42.4167 66.6667 44.875Z" fill="currentColor"/>',
  "srt-d100":
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M43.8021 10.4583C45.5104 8.79167 47.5938 8 49.6771 8C51.7604 8 53.8438 8.79167 55.5521 10.4583L88.8854 43.7917C92.1771 47.0417 92.1771 52.2917 88.8854 55.5417L55.5521 88.875C52.3021 92.1667 47.0521 92.1667 43.8021 88.875L10.4688 55.5417C7.17708 52.2917 7.17708 47.0417 10.4688 43.7917L43.8021 10.4583ZM34.0938 61.5833L61.5938 34.0833L65.2604 37.75L37.7604 65.25L34.0938 61.5833ZM36.6213 36.6109C37.6528 35.5795 39.0517 35 40.5104 35C41.9691 35 43.3681 35.5795 44.3995 36.6109C45.431 37.6424 46.0104 39.0413 46.0104 40.5C46.0104 41.9587 45.431 43.3576 44.3995 44.3891C43.3681 45.4205 41.9691 46 40.5104 46C39.0517 46 37.6528 45.4205 36.6213 44.3891C35.5899 43.3576 35.0104 41.9587 35.0104 40.5C35.0104 39.0413 35.5899 37.6424 36.6213 36.6109ZM54.9547 54.9442C55.9861 53.9128 57.3851 53.3333 58.8438 53.3333C60.3024 53.3333 61.7014 53.9128 62.7328 54.9442C63.7643 55.9757 64.3438 57.3746 64.3438 58.8333C64.3438 60.292 63.7643 61.691 62.7328 62.7224C61.7014 63.7539 60.3024 64.3333 58.8438 64.3333C57.3851 64.3333 55.9861 63.7539 54.9547 62.7224C53.9232 61.691 53.3438 60.292 53.3438 58.8333C53.3438 57.3746 53.9232 55.9757 54.9547 54.9442Z" fill="currentColor"/>',
  "srt-dF":
    '<path d="M 87.5 20.834 L 87.5 79.165 C 87.5 83.791 83.791 87.5 79.165 87.5 L 20.834 87.5 C 16.25 87.5 12.5 83.791 12.5 79.165 L 12.5 20.834 C 12.5 16.25 16.25 12.5 20.834 12.5 L 79.165 12.5 C 83.791 12.5 87.5 16.25 87.5 20.834 Z M 46.428 64.213 L 46.428 51.741 L 58.678 51.741 L 58.678 46.775 L 46.428 46.775 L 46.428 39.828 L 60.622 39.828 L 60.622 34.863 L 40.5 34.863 L 40.5 64.213 L 46.428 64.213 Z" fill="currentColor"/>',
  "srt-deck":
    '<g><rect x="16.6667" y="25" width="50" height="66.6667" rx="8.333" fill="none" stroke="currentColor" stroke-width="8.333"/><path d="M37.5 8.33334H75.0003C79.6025 8.33334 83.3333 12.0642 83.3333 16.6663V79.1667" fill="none" stroke="currentColor" stroke-width="8.333" stroke-linecap="round"/></g>',
};

export const registerIcons = () => {
  let icon: keyof typeof icons;
  for (icon in icons) {
    addIcon(icon, icons[icon]);
  }
};

export const unregisterIcons = () => {
  let icon: keyof typeof icons;
  for (icon in icons) {
    removeIcon(icon);
  }
};
