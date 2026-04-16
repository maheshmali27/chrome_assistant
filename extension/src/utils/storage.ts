/**
 * Typed wrappers around chrome.storage.local
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? null);
    });
  });
};

export const setItem = async <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
};

export const removeItems = async (keys: string[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
};

export const getMultiple = async <T extends Record<string, unknown>>(
  keys: string[],
): Promise<Partial<T>> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result as Partial<T>);
    });
  });
};
