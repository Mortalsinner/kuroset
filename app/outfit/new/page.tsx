"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

// Struktur data item yang akan ditampilkan dan dipilih untuk outfit
type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};

export default function CreateOutfitPage() {
  const router = useRouter();

  // State utama untuk menyimpan item, item yang dipilih, form outfit, dan status loading
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  // Saat halaman dibuka, ambil daftar item milik user dari database
  useEffect(() => {
    getItems();
  }, []);

  // Ambil item dari tabel items berdasarkan user yang sedang login
  const getItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id_user", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setItems(data || []);
  };

  // Tambah atau hapus item dari daftar item yang dipilih untuk outfit
  const toggleItem = (item: Item) => {
    const exists = selectedItems.some((selected) => selected.id_item === item.id_item);

    if (exists) {
      setSelectedItems(selectedItems.filter((selected) => selected.id_item !== item.id_item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Simpan outfit baru beserta relasi item ke tabel outfit_items
  const saveOutfit = async () => {
    if (!name) {
      alert("Nama outfit wajib diisi");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Pilih minimal satu pakaian");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          id_user: user.id,
          name,
          notes,
          is_public: isPublic
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      const outfitItems = selectedItems.map((item) => ({
        id_outfit: outfit.id_outfit,
        id_item: item.id_item
      }));

      const { error: itemError } = await supabase
        .from("outfit_items")
        .insert(outfitItems);

      if (itemError) throw itemError;

      alert("Outfit berhasil dibuat");
      router.push("/outfit");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mengambil URL gambar item dari storage Supabase
  const getImageUrl = (path: string) => {
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Create <span className="text-[#F652A0] [text-shadow:2px_2px_0px_#000]">Outfit</span> ✨
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mt-1">
              Mix and match items to blueprint a brand new look
            </p>
          </div>

          {/* ACTION BUTTONS GROUP */}
          <div className="w-full md:w-auto">
            <Link
              href="/outfit"
              className="bg-white text-black font-black border-4 border-black px-5 py-3 text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all block w-full md:inline-block text-center"
            >
              ⬅️ Back to Outfits
            </Link>
          </div>
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* FORM INFORMATION COMPONENT */}
          <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2 flex items-center gap-2">
              <span>📝</span> Outfit Details
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide">Outfit Name</label>
              <input
                type="text"
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#52D1F6] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
                placeholder="e.g., Cozy Sunday Minimalist"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wide">Description</label>
              <textarea
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#52D1F6] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-28 resize-none transition-colors"
                placeholder="Add style context, guidelines, or seasonal remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* CUSTOM NEO-BRUTALIST VISIBILITY SELECTOR */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wide">Visibility</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div 
                  onClick={() => setIsPublic(false)}
                  className={`border-4 border-black p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    !isPublic 
                      ? 'bg-[#52D1F6] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">🔒</span>
                  <div>
                    <p className="font-black text-sm uppercase">Private</p>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight mt-0.5">Only you can access this look layout</p>
                  </div>
                </div>

                <div 
                  onClick={() => setIsPublic(true)}
                  className={`border-4 border-black p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    isPublic 
                      ? 'bg-[#D5E04D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">🌎</span>
                  <div>
                    <p className="font-black text-sm uppercase">Public</p>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight mt-0.5">Visible to the whole community timeline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION DISPATCHER BUTTON */}
            <button
              onClick={saveOutfit}
              disabled={loading}
              className="w-full bg-black text-white disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(246,82,160,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(246,82,160,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
            >
              {loading ? "⚙️ Locking Formula..." : "Complete Outfit Setup 🚀"}
            </button>
          </section>

          {/* OUTFIT ASSEMBLY PREVIEW PANEL */}
          <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-2 min-h-[420px] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight border-b-4 border-black pb-2 flex items-center gap-2">
                <span>🖼️</span> Outfit Canvas ({selectedItems.length})
              </h2>

              {selectedItems.length === 0 ? (
                <div className="py-24 text-center border-4 border-dashed border-gray-300 mt-6 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-2">👕</span>
                  <p className="font-black text-sm text-gray-400 uppercase tracking-wider">Canvas Empty</p>
                  <p className="text-xs font-bold text-gray-400 max-w-xs mt-1">Select items from your closet catalog below to append them into this look combination.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  {selectedItems.map((item) => (
                    <div
                      key={`preview-${item.id_item}`}
                      className="relative h-40 bg-gray-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden group"
                    >
                      <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-[#F652A0] text-white text-[9px] font-black border-2 border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                        {item.category}
                      </div>
                      <button
                        onClick={() => toggleItem(item)}
                        className="absolute bottom-2 right-2 bg-black text-white font-black text-[10px] border-2 border-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 uppercase tracking-tighter"
                      >
                        Remove ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* CLOSET SELECTION CATALOGUE */}
        <section className="space-y-4 pt-4">
          <div className="border-b-4 border-black pb-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              🗄️ Select Wardrobe Pieces
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">
              Click individual items to select or deselect them from your active workspace.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-black p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-lg uppercase">Your closet is bone dry!</p>
              <p className="text-sm font-bold text-gray-500 mt-1">Upload items into your personal wardrobe page first before mixing blueprints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {items.map((item) => {
                const selected = selectedItems.some((s) => s.id_item === item.id_item);

                return (
                  <button
                    key={item.id_item}
                    onClick={() => toggleItem(item)}
                    className={`bg-white border-4 border-black text-left flex flex-col justify-between overflow-hidden transition-all text-black ${
                      selected
                        ? "bg-[#D5E04D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                        : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                    }`}
                  >
                    <div className="w-full">
                      {/* PICTURE SEGMENT */}
                      <figure className="relative h-44 bg-gray-100 border-b-2 border-black w-full">
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {selected && (
                          <div className="absolute top-2 right-2 bg-[#F652A0] text-white border-2 border-black text-[9px] font-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                            IN PACK ✔️
                          </div>
                        )}
                      </figure>

                      {/* TEXT CONTENT SEGMENT */}
                      <div className="p-4 space-y-1.5">
                        <span className="bg-[#52D1F6] border-2 border-black text-[9px] font-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] uppercase inline-block">
                          {item.category}
                        </span>
                        <h3 className="font-black text-sm uppercase tracking-tight line-clamp-1" title={item.name}>
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

      </div>
       <Footer />
    </main>
  );
}