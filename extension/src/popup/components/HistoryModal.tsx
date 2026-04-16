import React, { useEffect, useState } from "react";
import { X, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Bookmark, BookmarkHistory } from "@/types";
import { getBookmarkHistory } from "@/api/bookmarks";

interface Props {
  bookmark: Bookmark;
  onClose: () => void;
}

const HistoryModal: React.FC<Props> = ({ bookmark, onClose }) => {
  const [history, setHistory] = useState<BookmarkHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getBookmarkHistory(bookmark.id);
        setHistory(data);
      } catch {
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookmark.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[380px] rounded-t-2xl border border-white/10 bg-slate-900 pb-4">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            <h3 className="font-semibold text-white">History</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 pb-2 text-xs text-slate-500">
          Previous URLs for &ldquo;{bookmark.title}&rdquo;
        </div>

        <div className="max-h-[280px] overflow-y-auto px-4 space-y-2">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-indigo-400" />
            </div>
          )}

          {!loading && error && (
            <p className="py-4 text-center text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && history.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              No history yet
            </p>
          )}

          {history.map((h) => {
            const domain = (() => {
              try {
                return new URL(h.url).hostname;
              } catch {
                return h.url;
              }
            })();
            return (
              <div
                key={h.id}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                    alt=""
                    className="h-3 w-3"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {h.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">{h.url}</p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {new Date(h.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => chrome.tabs.create({ url: h.url })}
                  className="shrink-0 text-slate-400 hover:text-white transition"
                  title="Open"
                >
                  <ExternalLink size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
