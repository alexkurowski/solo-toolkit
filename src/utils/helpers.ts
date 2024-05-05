export const capitalize = (value: string): string => {
  if (value) {
    return value[0].toUpperCase() + value.substring(1);
  } else {
    return "";
  }
};
