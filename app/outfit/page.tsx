"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

// Struktur data outfit yang akan ditampilkan di halaman daftar
type Outfit = {
  id_outfit: string;
  name: string;
  notes: string;
  is_public: boolean;
  items: any[];
};

export default function OutfitPage() {
  // State utama untuk menyimpan daftar outfit, status loading, modal hapus, alert, dan pencarian
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Saat halaman dibuka, ambil semua outfit milik user yang sedang login
  useEffect(() => {
    getOutfits();
  }, []);

  // Ambil data outfit dari database beserta item-item yang terkait
  const getOutfits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          name,
          notes,
          is_public,
          outfit_items(
            items(
              id_item,
              image_url
            )
          )
        `)
        .eq("id_user", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map((outfit: any) => ({
        id_outfit: outfit.id_outfit,
        name: outfit.name,
        notes: outfit.notes,
        is_public: outfit.is_public,
        items: outfit.outfit_items?.map((item: any) => item.items).filter(Boolean) || []
      }));

      setOutfits(formatted);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Hapus outfit beserta relasi item di tabel outfit_items
  const deleteOutfit = async () => {
    if (!deleteId) return;

    try {
      const { error: itemsError } = await supabase
        .from("outfit_items")
        .delete()
        .eq("id_outfit", deleteId);

      if (itemsError) throw itemsError;

      const { error: outfitError } = await supabase
        .from("outfits")
        .delete()
        .eq("id_outfit", deleteId);

      if (outfitError) throw outfitError;

      setOutfits(outfits.filter(outfit => outfit.id_outfit !== deleteId));
      setAlert({
        message: "Outfit berhasil dihapus",
        type: "success"
      });
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: error.message,
        type: "error"
      });
    } finally {
      setDeleteId(null);
    }
  };

  // Helper untuk mengambil URL gambar item dari storage Supabase
  const getImageUrl = (path: string) => {
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  // Filter outfit berdasarkan kata kunci pencarian nama atau notes
  const filteredOutfits = outfits.filter((outfit) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      outfit.name.toLowerCase().includes(query) ||
      outfit.notes?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-[#52D1F6] text-black font-black text-2xl tracking-widest uppercase animate-pulse">
        ⚡ Syncing Style Archive... ⚡
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#D5E04D] selection:text-black">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP COMPONENT / ACTION HEADER */}
        <header className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              My <span className="text-[#52D1F6] [text-shadow:2px_2px_0px_#000]">Outfits</span> ✨
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mt-1">
              Organize and View Your Saved Outfits
            </p>
          </div>
          
          {/* BUTTON GROUP AREA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* TOMBOL KEMBALI KE DASHBOARD */}
            <Link
              href="/dashboard"
              className="bg-white text-black font-black border-4 border-black px-5 py-3 text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all block w-full sm:w-auto text-center"
            >
              ⬅️ Dashboard
            </Link>

            <Link
              href="/outfit/new"
              className="bg-[#F652A0] text-white font-black border-4 border-black px-5 py-3 text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all block w-full sm:w-auto text-center"
            >
              Create Outfit +
            </Link>
          </div>
        </header>

        {/* SEARCH BAR */}
        {outfits.length > 0 && (
          <section className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 w-full md:max-w-xl bg-[#F7F7F7] border-2 border-black px-4 py-2">
              <span className="text-xl">🔎</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search outfits by name or notes..."
                className="w-full bg-transparent outline-none text-sm font-black uppercase tracking-wide text-black placeholder:text-gray-400"
              />
            </div>
          </section>
        )}


        {/* OUTFITS MATRIX GRID */}
        {outfits.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <span className="text-5xl block">🥋</span>
            <h2 className="text-xl font-black uppercase">No Configurations Saved</h2>
            <p className="text-xs font-bold text-gray-400 uppercase max-w-sm mx-auto leading-relaxed">
              You haven't paired any wardrobe items into style arrangements yet. Let's build your blueprint!
            </p>
            <Link
              href="/outfit/new"
              className="mt-2 inline-block bg-[#D5E04D] text-black font-black border-2 border-black px-4 py-2 text-xs uppercase tracking-wider"
            >
              Assemble First Look 🚀
            </Link>
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <span className="text-5xl block">🔍</span>
            <h2 className="text-xl font-black uppercase">No matching outfits</h2>
            <p className="text-xs font-bold text-gray-400 uppercase max-w-sm mx-auto leading-relaxed">
              Adjust your search or category filter to find a saved outfit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOutfits.map((outfit) => (
              <article
                key={outfit.id_outfit}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-transform"
              >
                {/* PREVIEW CONTAINER (SHOWS UP TO 3 IMAGE SLICES) */}
                <div className="grid grid-cols-3 gap-0 bg-gray-200 h-44 border-b-4 border-black relative">
                  {outfit.items.length === 0 ? (
                    <div className="col-span-3 flex items-center justify-center text-xs font-bold uppercase text-gray-400 tracking-wider">
                      No Items In Mix
                    </div>
                  ) : (
                    <div className="contents">
                      {outfit.items.slice(0, 3).map((item: any) => (
                        <figure
                          key={`grid-pic-${item.id_item}`}
                          className="relative h-full w-full border-r-2 border-black last:border-r-0 bg-white overflow-hidden"
                        >
                          <Image
                            src={getImageUrl(item.image_url)}
                            alt="Outfit element segment"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* ADDITIONAL ITEMS COUNTER OVERLAY */}
                  {outfit.items.length > 3 && (
                    <div className="absolute bottom-2 right-2 bg-black text-white border-2 border-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-tighter">
                      +{outfit.items.length - 3} More
                    </div>
                  )}
                </div>

                {/* TEXTUAL BLOCK METADATA */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-black uppercase tracking-tight line-clamp-1" title={outfit.name}>
                      {outfit.name}
                    </h2>
                    <p className="text-xs font-medium text-gray-600 line-clamp-2 h-8 italic">
                      {outfit.notes ? `"${outfit.notes}"` : "No combination notes recorded."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t-2 border-dashed border-gray-200">
                    {outfit.is_public ? (
                      <span className="bg-[#D5E04D] border-2 border-black text-[9px] font-black px-2.5 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                        Public arrangement 🌎
                      </span>
                    ) : (
                      <span className="bg-black text-white border-2 border-black text-[9px] font-black px-2.5 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                        Private Vault 🔒
                      </span>
                    )}

                    {/* PIECES TOTAL COUNT */}
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      {outfit.items.length} Elements Linked
                    </span>
                  </div>
                </div>

                {/* HARDWARE INTERACTION FOOTER */}
                <div className="grid grid-cols-3 border-t-4 border-black bg-black gap-0.5">
                  <Link
                    href={`/outfit/${outfit.id_outfit}`}
                    className="bg-white text-black font-black text-center py-2.5 text-xs uppercase tracking-tight hover:bg-[#52D1F6] transition-colors"
                  >
                    View 👁️
                  </Link>
                  <Link
                    href={`/outfit/${outfit.id_outfit}/edit`}
                    className="bg-white text-black font-black text-center py-2.5 text-xs uppercase tracking-tight hover:bg-[#D5E04D] transition-colors"
                  >
                    Edit ⚙️
                  </Link>
                  <button
                    onClick={() => setDeleteId(outfit.id_outfit)}
                    className="bg-white text-red-600 font-black text-center py-2.5 text-xs uppercase tracking-tight hover:bg-red-500 hover:text-white transition-all"
                  >
                    Delete ❌
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        
      </div>

      {/* CONFIRMATION WARNING MODAL DIALOG */}
      {deleteId && (
        <dialog className="modal modal-open fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center gap-2 border-b-4 border-black pb-2 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-black text-lg uppercase tracking-tight">
                Destructive Action
              </h3>
            </div>
            
            <p className="font-bold text-xs text-gray-600 uppercase leading-relaxed">
              Apakah kamu yakin ingin menghapus susunan outfit ini secara permanen dari database sistem?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="bg-white text-black border-2 border-black font-black py-2 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteOutfit}
                className="bg-red-500 text-white border-2 border-black font-black py-2 text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
       <Footer />
    </main>
  );
}