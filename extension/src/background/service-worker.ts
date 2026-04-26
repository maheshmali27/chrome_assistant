import { Bookmark, STORAGE_KEYS, Settings, DEFAULT_SETTINGS } from "@/types";
import { getItem, setItem, removeItems } from "@/utils/storage";
import { hashPasscode, isTokenExpired } from "@/utils/crypto";

const API_BASE = "http://localhost:3000/api/v1";

// ── Native fetch helper (no window dependency) ────────────────────────────────
const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    await removeItems([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.AUTH_LOGIN_TIME,
    ]);
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
};

// ── Bookmark sync ─────────────────────────────────────────────────────────────
const syncBookmarks = async () => {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (!token || isTokenExpired(token)) return;

  try {
    const res = await apiFetch<{ data: Bookmark[] }>("/bookmarks");
    const bookmarks = res.data;
    // Preserve local-only fields (folderId, order) when merging
    const existing = (await getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS)) ?? [];
    const merged = bookmarks.map((b) => {
      const local = existing.find((e) => e.id === b.id);
      return {
        ...b,
        folderId: local?.folderId ?? null,
        order: local?.order ?? 0,
      };
    });
    await setItem(STORAGE_KEYS.BOOKMARKS, merged);
    await setItem(STORAGE_KEYS.BOOKMARKS_LAST_SYNCED, Date.now());
  } catch {
    // silent - offline or auth error handled by interceptor
  }
};

// ── Message handler ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    (async () => {
      switch (message.type) {
        case "SYNC_BOOKMARKS": {
          await syncBookmarks();
          sendResponse({ success: true });
          break;
        }

        case "GET_BOOKMARK_STATUS": {
          const { url } = message.payload as { url: string };
          const bookmarks =
            (await getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS)) ?? [];
          const bookmark = bookmarks.find((b) => b.url === url) ?? null;
          sendResponse({ isBookmarked: !!bookmark, bookmark });
          break;
        }

        case "ADD_BOOKMARK_FROM_CONTENT": {
          const { title, url, passcode } = message.payload as {
            title: string;
            url: string;
            passcode?: string;
          };

          // Verify passcode lock
          const settings =
            (await getItem<Settings>(STORAGE_KEYS.SETTINGS)) ??
            DEFAULT_SETTINGS;
          const lastUnlock =
            (await getItem<number>(STORAGE_KEYS.PASSCODE_LAST_UNLOCK)) ?? 0;
          const timeoutMs = settings.passcodeTimeoutMinutes * 60 * 1000;
          const locked = Date.now() - lastUnlock > timeoutMs;

          if (locked) {
            if (!passcode) {
              sendResponse({ success: false, needPasscode: true });
              return;
            }
            const storedHash = await getItem<string>(
              STORAGE_KEYS.PASSCODE_HASH,
            );
            if (!storedHash) {
              sendResponse({ success: false, error: "No passcode set" });
              return;
            }
            const inputHash = await hashPasscode(passcode);
            if (inputHash !== storedHash) {
              sendResponse({ success: false, error: "Wrong passcode" });
              return;
            }
            await setItem(STORAGE_KEYS.PASSCODE_LAST_UNLOCK, Date.now());
          }

          try {
            const res = await apiFetch<{ data: Bookmark }>("/bookmarks", {
              method: "POST",
              body: JSON.stringify({ title, url }),
            });
            const created = res.data;
            const bookmarks =
              (await getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS)) ?? [];
            await setItem(STORAGE_KEYS.BOOKMARKS, [created, ...bookmarks]);
            sendResponse({ success: true, bookmark: created });
          } catch {
            sendResponse({ success: false, error: "API call failed" });
          }
          break;
        }

        case "GET_PASSCODE_LOCK_STATUS": {
          const settings =
            (await getItem<Settings>(STORAGE_KEYS.SETTINGS)) ??
            DEFAULT_SETTINGS;
          const lastUnlock =
            (await getItem<number>(STORAGE_KEYS.PASSCODE_LAST_UNLOCK)) ?? 0;
          const timeoutMs = settings.passcodeTimeoutMinutes * 60 * 1000;
          sendResponse({ locked: Date.now() - lastUnlock > timeoutMs });
          break;
        }

        case "VERIFY_PASSCODE": {
          const { passcode: pc } = message.payload as { passcode: string };
          const storedHash = await getItem<string>(STORAGE_KEYS.PASSCODE_HASH);
          if (!storedHash) {
            sendResponse({ success: false, error: "No passcode configured" });
            break;
          }
          const inputHash = await hashPasscode(pc);
          sendResponse({ success: inputHash === storedHash });
          break;
        }

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    })();
    return true; // keep message channel open for async response
  },
);

// ── Periodic sync every 5 minutes ─────────────────────────────────────────────
chrome.alarms.create("sync-bookmarks", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sync-bookmarks") syncBookmarks();
});

// ── On install: remove stale auth if token expired ─────────────────────────────
chrome.runtime.onStartup.addListener(async () => {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token && isTokenExpired(token)) {
    await removeItems([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.AUTH_LOGIN_TIME,
    ]);
  }
});

export {};
