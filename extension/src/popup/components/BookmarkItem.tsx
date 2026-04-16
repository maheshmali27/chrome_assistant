import React, { useState } from "react";
import {
  ExternalLink,
  History,
  Star,
  StarOff,
  Trash2,
  Edit,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Bookmark, BookmarkFolder } from "@/types";

interface Props {
  bookmark: Bookmark;
  folders: BookmarkFolder[];
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number, current: boolean) => void;
  onShowHistory: (bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onMoveToFolder: (id: number, folderId: number | null) => void;
  onUpdateToCurrentTab: (id: number) => void | Promise<void>;
  onReorder: (id: number, dir: "up" | "down") => void;
  showReorder: boolean;
}

const BookmarkItem: React.FC<Props> = ({
  bookmark,
  folders,
  onDelete,
  onToggleFavorite,
  onShowHistory,
  onEdit,
  onMoveToFolder,
  onUpdateToCurrentTab,
  onReorder,
  showReorder,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const openUrl = () => {
    chrome.tabs.create({ url: bookmark.url });
  };

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname;
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <div className="group relative flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-3 transition hover:border-white/15 hover:bg-white/7">
      {/* Favicon */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt=""
          className="h-4 w-4"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <button
          onClick={openUrl}
          className="flex w-full min-w-0 items-center gap-1 text-left font-medium text-white transition-colors hover:text-indigo-300"
        >
          <span className="min-w-0 flex-1 truncate text-sm">
            {bookmark.title}
          </span>
          <ExternalLink
            size={11}
            className="shrink-0 opacity-0 group-hover:opacity-60"
          />
        </button>
        <p className="truncate text-xs text-slate-500">{domain}</p>
        {bookmark.description && (
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {bookmark.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-black/80 px-2 py-1 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        {showReorder && (
          <>
            <button
              onClick={() => onReorder(bookmark.id, "up")}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
              title="Move up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              onClick={() => onReorder(bookmark.id, "down")}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
              title="Move down"
            >
              <ChevronDown size={13} />
            </button>
          </>
        )}

        <button
          onClick={() => onToggleFavorite(bookmark.id, bookmark.isFavorite)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-yellow-400 transition"
          title={bookmark.isFavorite ? "Unfavorite" : "Favorite"}
        >
          {bookmark.isFavorite ? (
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff size={13} />
          )}
        </button>

        <button
          onClick={() => onShowHistory(bookmark)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition"
          title="History"
        >
          <History size={13} />
        </button>

        <button
          onClick={() => onUpdateToCurrentTab(bookmark.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-cyan-400 transition"
          title="Use current tab URL"
        >
          <RefreshCw size={13} />
        </button>

        <button
          onClick={() => onEdit(bookmark)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition"
          title="Edit"
        >
          <Edit size={13} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoveMenu((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white transition"
            title="Move to folder"
          >
            <FolderOpen size={13} />
          </button>
          {showMoveMenu && (
            <div className="absolute right-0 top-7 z-10 min-w-[140px] rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl">
              <button
                className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10"
                onClick={() => {
                  onMoveToFolder(bookmark.id, null);
                  setShowMoveMenu(false);
                }}
              >
                No folder
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10"
                  onClick={() => {
                    onMoveToFolder(bookmark.id, f.id);
                    setShowMoveMenu(false);
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(bookmark.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default BookmarkItem;
