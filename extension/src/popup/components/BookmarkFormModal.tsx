import React, { useEffect, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { Bookmark, BookmarkFolder } from "@/types";

interface Props {
  initialUrl?: string;
  initialTitle?: string;
  editingBookmark?: Bookmark | null;
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  onSubmit: (data: {
    title: string;
    url: string;
    description?: string;
    folderId?: number | null;
    existingBookmarkId?: number;
  }) => Promise<void>;
  onClose: () => void;
}

const BookmarkFormModal: React.FC<Props> = ({
  initialUrl = "",
  initialTitle = "",
  editingBookmark,
  bookmarks,
  folders,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(editingBookmark?.title ?? initialTitle);
  const [url, setUrl] = useState(editingBookmark?.url ?? initialUrl);
  const [description, setDescription] = useState(
    editingBookmark?.description ?? "",
  );
  const [folderId, setFolderId] = useState<number | null>(
    editingBookmark?.folderId ?? null,
  );
  const [overwriteId, setOverwriteId] = useState<number | undefined>(
    editingBookmark ? editingBookmark.id : undefined,
  );
  const [mode, setMode] = useState<"new" | "overwrite">(
    editingBookmark ? "overwrite" : "new",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // When mode switches to 'overwrite', pre-select first bookmark
  useEffect(() => {
    if (mode === "overwrite" && !overwriteId && bookmarks.length > 0) {
      setOverwriteId(bookmarks[0].id);
      if (!editingBookmark) setTitle(bookmarks[0].title);
    }
  }, [mode, bookmarks, overwriteId, editingBookmark]);

  const handleSelectOverwrite = (id: number) => {
    setOverwriteId(id);
    const bm = bookmarks.find((b) => b.id === id);
    if (bm) setTitle(bm.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        folderId,
        existingBookmarkId: mode === "overwrite" ? overwriteId : undefined,
      });
      onClose();
    } catch {
      setError("Failed to save bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[380px] rounded-t-2xl border border-white/10 bg-slate-900 pb-6">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold text-white">
            {editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Mode selector (only for new bookmarks when there are existing ones) */}
        {!editingBookmark && bookmarks.length > 0 && (
          <div className="mx-4 mb-4 flex rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setMode("new")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${mode === "new" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              New Bookmark
            </button>
            <button
              onClick={() => setMode("overwrite")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${mode === "overwrite" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Update Existing
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 px-4">
          {/* Overwrite picker */}
          {mode === "overwrite" && !editingBookmark && (
            <div className="relative">
              <select
                value={overwriteId ?? ""}
                onChange={(e) => handleSelectOverwrite(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-white outline-none focus:border-indigo-500"
              >
                {bookmarks.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900">
                    {b.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

          {/* URL */}
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={description as string}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

          {/* Folder */}
          {folders.length > 0 && (
            <div className="relative">
              <select
                value={folderId ?? ""}
                onChange={(e) =>
                  setFolderId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="" className="bg-slate-900">
                  No folder
                </option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900">
                    {f.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Saving…" : "Save Bookmark"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookmarkFormModal;
