export function bounce(timeout: number, once = false) {
  let lastTime = 0;
  return {
    set: () => {
      lastTime = Date.now();
    },
    check: () => {
      const result = lastTime + timeout > Date.now();
      if (once) lastTime = 0;
      return result;
    },
  };
}

export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  function debounced(...args: Parameters<T>) {
    const later = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  return debounced as T;
}
