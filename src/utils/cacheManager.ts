/**
 * Browser Data & Image Cache Manager
 * Caches application data in localStorage and images in CacheStorage/Browser Image Cache
 * for instant 0ms reload on return visits.
 */

const CACHE_PREFIX = "boutique_store_v1_";
const IMAGE_CACHE_NAME = "boutique_images_v1";

export function loadLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing
  }
}

/**
 * Preloads and caches image URLs into the browser CacheStorage and memory
 */
export async function cacheImagesInBrowser(urls: (string | undefined | null)[]): Promise<void> {
  const validUrls = Array.from(new Set(urls.filter((u): u is string => Boolean(u && u.trim()))));
  if (validUrls.length === 0) return;

  // 1. Preload into browser image memory cache
  validUrls.forEach((url) => {
    try {
      const img = new Image();
      img.src = url;
    } catch {}
  });

  // 2. Persist in CacheStorage for persistent offline/fast returns
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      for (const url of validUrls) {
        if (!url.startsWith("http")) continue;
        try {
          const cached = await cache.match(url);
          if (!cached) {
            fetch(url, { mode: "no-cors" })
              .then((res) => {
                if (res) cache.put(url, res);
              })
              .catch(() => {});
          }
        } catch {}
      }
    } catch {}
  }
}
