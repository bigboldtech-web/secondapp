"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCollection, deleteCollection } from "./actions";

interface CollectionPreview {
  title: string;
  thumbnail: string | null;
}

interface CollectionData {
  id: string;
  name: string;
  isPublic: boolean;
  itemCount: number;
  previews: CollectionPreview[];
}

export default function CollectionsClient({ collections }: { collections: CollectionData[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createCollection(newName.trim());
    setNewName("");
    setShowCreate(false);
    setCreating(false);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? The items will still be in your Saved Items.`)) return;
    await deleteCollection(id);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
              Second <span className="text-coral">App</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <span className="text-[12px] font-medium text-text-muted">My collections</span>
          </div>
          <div className="flex gap-2">
            <Link href="/saved" className="text-[12px] text-text-muted no-underline">Saved items</Link>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 rounded-md bg-coral text-white text-[12px] font-semibold border-none cursor-pointer"
            >
              + New collection
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-4 sm:px-6 py-5">
        {showCreate && (
          <div className="bg-card border border-border rounded-[10px] px-4 py-3 mb-4 flex gap-2 items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              maxLength={50}
              className="flex-1 px-3 py-2 text-[13px] border border-border rounded-md bg-white text-text-primary outline-none"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-3 py-2 rounded-md bg-coral text-white text-[12px] font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {creating ? "…" : "Create"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(""); }}
              className="text-[12px] text-text-muted border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-text-secondary mb-1">No collections yet</p>
            <p className="text-xs text-text-muted mb-3">Create a collection to organize your saved items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <div key={col.id} className="bg-card border border-border rounded-[10px] overflow-hidden">
                {/* Preview grid */}
                <div className="grid grid-cols-2 gap-px bg-border aspect-[2/1]">
                  {[0, 1, 2, 3].map((i) => {
                    const preview = col.previews[i];
                    return (
                      <div key={i} className="bg-input flex items-center justify-center">
                        {preview?.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-input" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary">{col.name}</p>
                    <p className="text-[11px] text-text-muted">
                      {col.itemCount} item{col.itemCount !== 1 ? "s" : ""}
                      {col.isPublic && " · Public"}
                    </p>
                  </div>
                  {col.name !== "Saved Items" && (
                    <button
                      onClick={() => handleDelete(col.id, col.name)}
                      className="text-[10px] text-text-muted border-none bg-transparent cursor-pointer hover:text-condition-rough-text"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
