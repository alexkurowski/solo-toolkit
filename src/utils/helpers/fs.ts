export const normalizePath = (value: string): string => {
  return (value || "").replace(/^\/+|\/+$/g, "");
};
