import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  FolderPlus,
  Folder,
  ChevronRight,
  ChevronDown,
  Trash2,
  Star,
} from "lucide-react";
import { Bookmark } from "@/types";
import { useBookmarks } from "../context/BookmarkContext";
import BookmarkItem from "../components/BookmarkItem";
import HistoryModal from "../components/HistoryModal";
import BookmarkFormModal from "../components/BookmarkFormModal";

interface Props {
  onBack: () => void;
}

const BookmarkPage: React.FC<Props> = ({ onBack }) => {
  const {
    bookmarks,
    folders,
    loading,
    refresh,
    addBookmark,
    deleteBookmark,
    toggleFavorite,
    createFolder,
    deleteFolder,
    moveBookmark,
    updateBookmarkToCurrentTab,
    reorderBookmark,
  } = useBookmarks();

  const [search, setSearch] = useState("");
  const [historyTarget, setHistoryTarget] = useState<Bookmark | null>(null);
  const [formTarget, setFormTarget] = useState<{
    open: boolean;
    editing?: Bookmark;
  }>({ open: false });
  const [currentTab, setCurrentTab] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<number, boolean>
  >({});
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showReorder, setShowReorder] = useState(false);

  const openAddForm = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    setCurrentTab({ url: tab.url ?? "", title: tab.title ?? "" });
    setFormTarget({ open: true });
  };

  const openEditForm = (bm: Bookmark) => {
    setFormTarget({ open: true, editing: bm });
  };

  const handleFormSubmit = async (data: Parameters<typeof addBookmark>[0]) => {
    await addBookmark(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const toggleFolder = (id: number) => {
    setCollapsedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter bookmarks
  const filtered = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      (b.description ?? "").toLowerCase().includes(q)
    );
  });

  const rootBookmarks = filtered
    .filter((b) => !b.folderId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const favBookmarks = filtered.filter((b) => b.isFavorite);

  const getBookmarksInFolder = (folderId: number): Bookmark[] =>
    filtered
      .filter((b) => b.folderId === folderId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderBookmark = (bm: Bookmark) => (
    <BookmarkItem
      key={bm.id}
      bookmark={bm}
      folders={folders}
      onDelete={deleteBookmark}
      onToggleFavorite={toggleFavorite}
      onShowHistory={setHistoryTarget}
      onEdit={openEditForm}
      onMoveToFolder={moveBookmark}
      onUpdateToCurrentTab={updateBookmarkToCurrentTab}
      onReorder={reorderBookmark}
      showReorder={showReorder}
    />
  );

  return (
    <div className="flex min-h-[560px] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="flex-1 font-bold text-white">Bookmarks</h2>
        <button
          onClick={() => setShowReorder((v) => !v)}
          title="Reorder mode"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${showReorder ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
        >
          <span className="text-xs font-bold">⇅</span>
        </button>
        <button
          onClick={() => setShowNewFolder(true)}
          title="New folder"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <FolderPlus size={15} />
        </button>
        <button
          onClick={refresh}
          disabled={loading}
          title="Sync"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={openAddForm}
          title="Add bookmark"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition hover:opacity-90"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mx-4 mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search bookmarks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
        />
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="mx-4 mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCreateFolder}
            className="rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName("");
            }}
            className="rounded-xl bg-white/5 px-3 text-sm text-slate-400 transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {/* Favorites section */}
        {!search && favBookmarks.length > 0 && (
          <section className="mb-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-500/80">
              <Star size={11} className="fill-yellow-500 text-yellow-500" />{" "}
              Favorites
            </div>
            <div className="space-y-1">{favBookmarks.map(renderBookmark)}</div>
          </section>
        )}

        {/* Folders */}
        {folders.map((folder) => {
          const folderBookmarks = getBookmarksInFolder(folder.id);
          if (search && folderBookmarks.length === 0) return null;
          const collapsed = collapsedFolders[folder.id];
          return (
            <section key={folder.id} className="mb-2">
              <div className="mb-1 flex items-center gap-2">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  {collapsed ? (
                    <ChevronRight size={14} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-500" />
                  )}
                  <Folder size={14} className="text-indigo-400" />
                  <span>{folder.name}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {folderBookmarks.length}
                  </span>
                </button>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {!collapsed && (
                <div className="ml-4 space-y-1">
                  {folderBookmarks.length === 0 ? (
                    <p className="py-2 text-xs text-slate-600">Empty folder</p>
                  ) : (
                    folderBookmarks.map(renderBookmark)
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* Root bookmarks */}
        {rootBookmarks.length > 0 && (
          <section>
            {folders.length > 0 && !search && (
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Unsorted
              </div>
            )}
            <div className="space-y-1">{rootBookmarks.map(renderBookmark)}</div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <Search size={20} className="text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              {search ? "No bookmarks match your search" : "No bookmarks yet"}
            </p>
            {!search && (
              <p className="mt-1 text-xs text-slate-600">
                Click + to add your first bookmark
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {historyTarget && (
        <HistoryModal
          bookmark={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {formTarget.open && (
        <BookmarkFormModal
          initialUrl={currentTab?.url}
          initialTitle={currentTab?.title}
          editingBookmark={formTarget.editing}
          bookmarks={bookmarks}
          folders={folders}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setFormTarget({ open: false });
            setCurrentTab(null);
          }}
        />
      )}
    </div>
  );
};

export default BookmarkPage;
