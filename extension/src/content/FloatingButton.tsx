import React, { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkHistory } from "@/types";
import * as BookmarkAPI from "@/api/bookmarks";

const FAB = 56; // main button size
const SUB = 48; // sub-action size
const GAP = 12; // gap between buttons

type ActiveFeature = "bookmark" | null;

interface BookmarkStatus {
  isBookmarked: boolean;
  bookmark: Bookmark | null;
}

// ─── FloatingButton ───────────────────────────────────────────────────────────
const FloatingButton: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);

  // bookmark feature state
  const [bookmarkStatus, setBookmarkStatus] = useState<BookmarkStatus>({
    isBookmarked: false,
    bookmark: null,
  });
  const [history, setHistory] = useState<BookmarkHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [addState, setAddState] = useState<
    "idle" | "adding" | "passcode" | "done" | "error"
  >("idle");
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");

  // lock feature state
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockInput, setLockInput] = useState("");
  const [lockError, setLockError] = useState("");
  const [lockLoading, setLockLoading] = useState(false);

  // drag
  const [pos, setPos] = useState({
    x: window.innerWidth - FAB - 16,
    y: window.innerHeight - FAB - 24,
  });
  const dragging = useRef(false);
  const hasMoved = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const currentUrl = window.location.href;
  const currentTitle = document.title;

  // ── Bookmark status on mount ───────────────────────────────────────────────
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_BOOKMARK_STATUS", payload: { url: currentUrl } },
      (res: BookmarkStatus) => {
        if (res) setBookmarkStatus(res);
      },
    );
  }, [currentUrl]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    hasMoved.current = false;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      hasMoved.current = true;
      setPos({
        x: Math.max(
          0,
          Math.min(window.innerWidth - FAB, e.clientX - dragOffset.current.x),
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - FAB, e.clientY - dragOffset.current.y),
        ),
      });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Toggle menu ───────────────────────────────────────────────────────────
  const toggleMenu = () => {
    if (hasMoved.current) return;
    if (menuOpen) {
      setMenuOpen(false);
      setActiveFeature(null);
    } else {
      setMenuOpen(true);
    }
  };

  // ── Lock page ─────────────────────────────────────────────────────────────
  const lockPage = () => {
    setMenuOpen(false);
    setActiveFeature(null);
    setLockInput("");
    setLockError("");
    setIsPageLocked(true);
  };

  // ── Open bookmark feature ─────────────────────────────────────────────────
  const openBookmark = async () => {
    setMenuOpen(false);
    setActiveFeature("bookmark");
    setAddState("idle");
    setPasscode("");
    setPassError("");
    if (bookmarkStatus.bookmark) {
      setLoadingHistory(true);
      try {
        const hist = await BookmarkAPI.getBookmarkHistory(
          bookmarkStatus.bookmark.id,
        );
        setHistory(hist);
      } catch {
        /* silent */
      }
      setLoadingHistory(false);
    }
  };

  // ── Verify passcode and unlock page ─────────────────────────────────────
  const handleUnlock = () => {
    if (!lockInput.trim()) {
      setLockError("Please enter your passcode");
      return;
    }
    setLockLoading(true);
    setLockError("");
    chrome.runtime.sendMessage(
      { type: "VERIFY_PASSCODE", payload: { passcode: lockInput } },
      (res: { success: boolean; error?: string }) => {
        setLockLoading(false);
        if (chrome.runtime.lastError || !res) {
          setLockError("Failed to verify passcode");
          return;
        }
        if (res.success) {
          setIsPageLocked(false);
          setLockInput("");
        } else {
          setLockError(res.error ?? "Incorrect passcode");
          setLockInput("");
        }
      },
    );
  };

  // ── Add bookmark ──────────────────────────────────────────────────────────
  const handleAdd = async (pc?: string) => {
    setAddState("adding");
    setPassError("");
    chrome.runtime.sendMessage(
      {
        type: "ADD_BOOKMARK_FROM_CONTENT",
        payload: { title: currentTitle, url: currentUrl, passcode: pc },
      },
      (res: {
        success: boolean;
        needPasscode?: boolean;
        bookmark?: Bookmark;
        error?: string;
      }) => {
        if (res.needPasscode) {
          setAddState("passcode");
        } else if (res.success && res.bookmark) {
          setBookmarkStatus({ isBookmarked: true, bookmark: res.bookmark });
          setHistory([]);
          setAddState("done");
          setTimeout(() => setAddState("idle"), 1500);
        } else {
          setPassError(res.error ?? "Failed to save");
          setAddState("error");
        }
      },
    );
  };

  // shorthand
  const isBm = bookmarkStatus.isBookmarked;
  // sub-item left position: center-align SUB under FAB
  const subLeft = pos.x + (FAB - SUB) / 2;

  return (
    <>
      {/* ── Sub-action: Lock ──────────────────────────────────────────────── */}
      <button
        onClick={lockPage}
        title="Lock this page"
        style={{
          position: "fixed",
          left: subLeft,
          top: pos.y - 2 * (SUB + GAP),
          zIndex: 2147483645,
          width: SUB,
          height: SUB,
          borderRadius: "50%",
          background: "#fff",
          border: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen
            ? "scale(1) translateY(0)"
            : "scale(0.5) translateY(20px)",
          transition: "opacity 0.2s 0.1s, transform 0.2s 0.1s",
          pointerEvents: menuOpen ? "auto" : "none",
          userSelect: "none",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" fill="#6366f1" />
          <path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            stroke="#6366f1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* ── Sub-action: Bookmark ───────────────────────────────────────────── */}
      <button
        onClick={openBookmark}
        title={isBm ? "View Bookmark" : "Bookmark this page"}
        style={{
          position: "fixed",
          left: subLeft,
          top: pos.y - SUB - GAP,
          zIndex: 2147483645,
          width: SUB,
          height: SUB,
          borderRadius: "50%",
          background: "#fff",
          border: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen
            ? "scale(1) translateY(0)"
            : "scale(0.5) translateY(20px)",
          transition: "opacity 0.2s 0.05s, transform 0.2s 0.05s",
          pointerEvents: menuOpen ? "auto" : "none",
          userSelect: "none",
        }}
      >
        {/* Bookmark icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={isBm ? "#ec4899" : "#94a3b8"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3-7 3V5z" />
        </svg>
      </button>

      {/* ── Main FAB ──────────────────────────────────────────────────────── */}
      <button
        onMouseDown={onMouseDown}
        onClick={toggleMenu}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 2147483646,
          width: FAB,
          height: FAB,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #f472b6 0%, #ec4899 60%, #db2777 100%)",
          border: "none",
          boxShadow: "0 6px 24px rgba(236,72,153,0.55)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          transition: "transform 0.15s",
        }}
        title="Personal Assistant"
      >
        {menuOpen ? (
          /* X icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          /* Hamburger / PA icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {/* ── Bookmark feature panel ────────────────────────────────────────── */}
      {activeFeature === "bookmark" && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 2147483644,
            width: 300,
            maxHeight: 450,
            borderRadius: 16,
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            overflowY: "auto",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#f1f5f9",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isBm ? "#22c55e" : "#ef4444",
                  boxShadow: `0 0 6px ${isBm ? "#22c55e" : "#ef4444"}`,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {isBm ? "Bookmarked" : "Not Bookmarked"}
              </span>
            </div>
            <button
              onClick={() => setActiveFeature(null)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Page info */}
          <div style={{ padding: "10px 14px" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentTitle}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#64748b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUrl}
            </p>
          </div>

          {/* Bookmark detail */}
          {bookmarkStatus.bookmark && (
            <div
              style={{
                margin: "0 14px 8px",
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <p style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 500 }}>
                Saved as
              </p>
              <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                {bookmarkStatus.bookmark.title}
              </p>
            </div>
          )}

          {/* Add UI */}
          {!isBm && (
            <div style={{ padding: "0 14px 12px" }}>
              {addState === "passcode" ? (
                <div>
                  <p
                    style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}
                  >
                    Enter passcode to bookmark
                  </p>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="6-digit passcode"
                    autoFocus
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "8px 12px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      marginBottom: 6,
                      boxSizing: "border-box",
                    }}
                  />
                  {passError && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#f87171",
                        marginBottom: 6,
                      }}
                    >
                      {passError}
                    </p>
                  )}
                  <button
                    onClick={() => handleAdd(passcode)}
                    style={{
                      width: "100%",
                      background: "linear-gradient(90deg, #6366f1, #a855f7)",
                      border: "none",
                      borderRadius: 10,
                      padding: "8px",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Confirm
                  </button>
                </div>
              ) : addState === "done" ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#4ade80",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "8px 0",
                  }}
                >
                  ✓ Bookmarked!
                </div>
              ) : (
                <button
                  onClick={() => handleAdd()}
                  disabled={addState === "adding"}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #6366f1, #a855f7)",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    opacity: addState === "adding" ? 0.6 : 1,
                  }}
                >
                  {addState === "adding" ? "Saving…" : "+ Bookmark This Page"}
                </button>
              )}
            </div>
          )}

          {/* History */}
          {bookmarkStatus.bookmark && (
            <div style={{ padding: "0 14px 12px" }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                History
              </p>
              {loadingHistory ? (
                <p style={{ fontSize: 12, color: "#64748b" }}>Loading…</p>
              ) : history.length === 0 ? (
                <p style={{ fontSize: 12, color: "#475569" }}>
                  No previous URLs
                </p>
              ) : (
                history.slice(0, 5).map((h) => (
                  <a
                    key={h.id}
                    href={h.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      marginBottom: 4,
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      textDecoration: "none",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#e2e8f0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h.title}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "#475569",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(h.createdAt).toLocaleDateString()}
                    </p>
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Lock overlay ──────────────────────────────────────────────────── */}
      {isPageLocked && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 2147483647,
            background: "#0d1520",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400, padding: "0 32px" }}>
            {/* Icon */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    fill="#6366f1"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#f1f5f9",
                margin: "0 0 8px",
                textAlign: "center",
              }}
            >
              Enter your{" "}
              <span style={{ color: "#3b82f6" }}>local passcode</span>
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#475569",
                textAlign: "center",
                margin: "0 0 36px",
              }}
            >
              This page is locked. Enter your passcode to view its content.
            </p>

            {/* Input */}
            <div style={{ marginBottom: 8 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#94a3b8",
                  marginBottom: 8,
                }}
              >
                Your passcode
              </label>
              <input
                type="password"
                value={lockInput}
                onChange={(e) => setLockInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                autoFocus
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid #3b82f6",
                  outline: "none",
                  color: "#f1f5f9",
                  fontSize: 16,
                  padding: "8px 0",
                  boxSizing: "border-box",
                  caretColor: "#3b82f6",
                }}
              />
            </div>

            {lockError && (
              <p
                style={{
                  fontSize: 12,
                  color: "#f87171",
                  margin: "8px 0 0",
                }}
              >
                {lockError}
              </p>
            )}

            <div style={{ height: 28 }} />

            {/* Submit */}
            <button
              onClick={handleUnlock}
              disabled={lockLoading}
              style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: lockLoading ? "not-allowed" : "pointer",
                opacity: lockLoading ? 0.7 : 1,
                boxSizing: "border-box",
              }}
            >
              {lockLoading ? "Verifying\u2026" : "Submit"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingButton;
