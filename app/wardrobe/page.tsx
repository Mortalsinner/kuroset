"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

type Item = {
  id_item: string;
  name: string;
  category: string;
  color: string | null;
  shop_url: string | null;
  image_url: string;
  notes: string | null;
};

export default function WardrobePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemData, setDeleteItemData] = useState<Item | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk Filter Kategori 👕🎒
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const categories = ["All", "TOPS", "BOTTOMS", "OUTERS", "SHOES", "ACCESSORIES"];

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteItemData) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("wardrobe-images")
        .remove([deleteItemData.image_url]);

      if (storageError) throw storageError;

      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id_item", deleteItemData.id_item);

      if (error) throw error;

      setItems(items.filter((item) => item.id_item !== deleteItemData.id_item));
      setAlert({
        message: "Item successfully removed from closet.",
        type: "success",
      });
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setDeleteItemData(null);
    }
  };

  const getImageUrl = (path: string) => {
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  // Memproses data pakaian berdasarkan kategori dan pencarian
  const filteredItems = items
    .filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    })
    .filter((item) => {
      if (selectedCategory === "All") return true;
      return item.category?.toLowerCase() === selectedCategory.toLowerCase();
    });

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Opening your digital closet... ⚡
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION WITH NAVIGATION BUTTONS */}
        <header className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              My <span className="text-[#52D1F6] [text-shadow:2px_2px_0px_#000]">Wardrobe</span> 👕
            </h1>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-tight mt-1">
              Manage and organize your personal digital clothing collection
            </p>
          </div>

          {/* ACTION BUTTON GROUP */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/dashboard"
              className="bg-white text-black font-black border-4 border-black px-5 py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider block w-full sm:w-auto text-center"
            >
              ⬅️ Dashboard
            </Link>

            <Link
              href="/wardrobe/new"
              className="bg-[#D5E04D] text-black font-black border-4 border-black px-5 py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider block w-full sm:w-auto text-center"
            >
              Add New Item ➕
            </Link>
          </div>
        </header>

        {/* UI SEARCH BAR - HANYA MUNCUL JIKA USER PUNYA ITEM */}
        {items.length > 0 && (
          <section className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 w-full md:max-w-xl bg-[#F7F7F7] border-2 border-black px-4 py-2">
              <span className="text-xl">🔎</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wardrobe by name, category, or notes..."
                className="w-full bg-transparent outline-none text-sm font-black uppercase tracking-wide text-black placeholder:text-gray-400"
              />
            </div>
          </section>
        )}

        {/* UI FILTER KATEGORI - HANYA MUNCUL JIKA USER PUNYA ITEM */}
        {items.length > 0 && (
          <section className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black text-xs uppercase tracking-wider text-gray-500 mr-2 block w-full sm:w-auto">
                Filter Category:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all
                        ${isActive 
                          ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]" 
                          : "bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#D5E04D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* WARDROBE CONTENT */}
        {items.length === 0 ? (
          /* KONDISI LEMARI BENAR-BENAR KOSONG */
          <div className="bg-white border-4 border-dashed border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-black uppercase">Wardrobe is empty</h2>
            <p className="font-bold text-gray-600 mt-2">
              You haven't added any clothes yet. Let's start building your digital closet!
            </p>
            <Link
              href="/wardrobe/new"
              className="mt-6 inline-block bg-[#52D1F6] text-black font-black border-4 border-black px-6 py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
            >
              Upload Your First Item 🚀
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          /* KONDISI ITEM ADA, TAPI TIDAK ADA YANG SESUAI KATEGORI YANG DIPILIH */
          <div className="bg-white border-4 border-dashed border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-black uppercase">No items found</h2>
            <p className="font-bold text-gray-600 mt-2">
              You don't have any items registered under the <span className="text-[#F652A0] uppercase font-black">"{selectedCategory}"</span> category yet.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-6 bg-black text-white font-black border-4 border-black px-5 py-2.5 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
            >
              Clear Filter 🔄
            </button>
          </div>
        ) : (
          /* RENDER ITEM YANG SUDAH TERFILTER */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id_item}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group transform hover:-translate-y-1 transition-all"
              >
                <div>
                  {/* ITEM IMAGE */}
                  <figure className="relative h-64 bg-gray-100 border-b-4 border-black overflow-hidden">
                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </figure>

                  {/* ITEM DETAILS */}
                  <div className="p-5 space-y-3">
                    <div className="bg-[#52D1F6] border-2 border-black text-xs font-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase inline-block">
                      {item.category}
                    </div>

                    <h2 className="font-black text-xl tracking-tight uppercase truncate" title={item.name}>
                      {item.name}
                    </h2>

                    {item.color && (
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-gray-700">
                        <span>🎨 Color:</span>
                        <span className="bg-gray-100 border border-black px-1.5 py-0.5 text-[10px] font-black">
                          {item.color}
                        </span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs font-bold text-gray-500 line-clamp-2 min-h-[2rem]">
                        {item.notes}
                      </p>
                    )}

                    {item.shop_url && (
                      <a
                        href={item.shop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-black text-xs uppercase tracking-wider text-black underline decoration-2 decoration-[#F652A0] hover:text-[#F652A0] transition-colors pt-1"
                      >
                        Buy Link 🔗
                      </a>
                    )}
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                  <Link
                    href={`/wardrobe/edit/${item.id_item}`}
                    className="text-center bg-white hover:bg-black hover:text-white text-black font-black py-2 text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
                  >
                    Edit ✏️
                  </Link>
                  <button
                    onClick={() => setDeleteItemData(item)}
                    className="text-center bg-[#F652A0] text-black font-black py-2 text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOM NEO-BRUTALIST MODAL CONFIRMATION */}
      {deleteItemData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-black text-2xl uppercase tracking-tight text-[#F652A0]">
              Delete Item? ⚠️
            </h3>
            <p className="font-bold text-sm text-gray-800">
              Are you sure you want to permanently throw away: <br />
              <span className="bg-gray-100 border border-black px-1.5 py-0.5 inline-block font-black text-black my-2 uppercase tracking-wide">
                {deleteItemData.name}
              </span>
              <br />
              This action cannot be undone from your wardrobe.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteItemData(null)}
                className="bg-white text-black font-black border-2 border-black px-4 py-2 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="bg-black text-white font-black border-2 border-black px-4 py-2 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}