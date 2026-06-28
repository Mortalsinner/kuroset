"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

// Struktur data item yang akan ditampilkan dan dipilih untuk outfit
type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};

export default function EditOutfitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // State utama untuk menyimpan data outfit, item yang tersedia, item yang dipilih, dan status UI
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Saat halaman dibuka, ambil data outfit yang sedang diedit berdasarkan id di URL
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // Ambil detail outfit beserta relasi item yang sudah terhubung, lalu isi form dengan data lama
  const loadData = async () => {
    try {
      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          name,
          notes,
          is_public,
          outfit_items(
            items(
              id_item,
              name,
              category,
              image_url
            )
          )
        `)
        .eq("id_outfit", id)
        .single();

      if (outfitError) throw outfitError;
      if (!outfit) return;

      setName(outfit.name || "");
      setNotes(outfit.notes || "");
      setIsPublic(outfit.is_public || false);
      setSelectedItems(
        outfit.outfit_items?.map((item: any) => item.items) || []
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", user.id)
        .order("created_at", { ascending: false });

      if (itemError) throw itemError;
      setItems(itemData || []);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tambah atau hapus item dari daftar yang dipilih saat user mengklik kartu item
  const toggleItem = (item: Item) => {
    const exists = selectedItems.some(
      (selected) => selected.id_item === item.id_item
    );

    if (exists) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.id_item !== item.id_item)
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Simpan perubahan outfit ke database dan perbarui relasi item yang terhubung
  const updateOutfit = async () => {
    try {
      setSaving(true);

      const { error: updateError } = await supabase
        .from("outfits")
        .update({
          name,
          notes,
          is_public: isPublic,
        })
        .eq("id_outfit", id);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from("outfit_items")
        .delete()
        .eq("id_outfit", id);

      if (deleteError) throw deleteError;

      const newItems = selectedItems.map((item) => ({
        id_outfit: id,
        id_item: item.id_item,
      }));

      const { error: insertError } = await supabase
        .from("outfit_items")
        .insert(newItems);

      if (insertError) throw insertError;

      setAlert({
        message: "Outfit berhasil diupdate",
        type: "success",
      });

      setTimeout(() => {
        router.push(`/outfit/${id}`);
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Ubah path gambar item menjadi URL publik agar bisa ditampilkan di halaman
  const getImageUrl = (path: string) => {
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-black uppercase tracking-wider">
        ⚙️ Loading Metadata...
      </main>
    );
  }

  return (
    // Tampilan halaman edit outfit dengan form dan daftar item yang bisa dipilih
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#D5E04D]">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOMBOL BACK & HEADER SEKSYEN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-5">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Edit <span className="text-[#F652A0] [text-shadow:1.5px_1.5px_0px_#000]">Outfit</span> ✨
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Modify configuration matrix and items for Outfit ID: {id}
            </p>
          </div>
          
          {/* TOMBOL KEMBALI (BACK TO OUTFIT PAGE) */}
          <Link
            href={`/outfit/${id}`}
            className="inline-flex items-center justify-center bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all sm:self-center self-start"
          >
            ⬅️ Back to Outfit
          </Link>
        </div>

        {/* FORM KONFIGURASI UTAMA */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Outfit Designation</label>
            <input
              type="text"
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Outfit name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Contextual Notes</label>
            <textarea
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes regarding seasonality, style, etc."
              rows={3}
            />
          </div>

          {/* TOGGLE PUBLIC CONFIG */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="text-xs font-black uppercase block">Public Visibility</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Toggle to expose outfit on discover network</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-white border-4 border-black peer-checked:bg-[#52D1F6] transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-black after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-2">
            <button
              onClick={updateOutfit}
              disabled={saving}
              className="w-full bg-[#D5E04D] text-black disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
            >
              {saving ? "⚙️ Saving Matrix Alterations..." : "Commit Changes to Database ⚡"}
            </button>
          </div>
        </div>

        {/* SEKSYEN PEMILIHAN ITEM */}
        <div className="space-y-4">
          <div className="border-b-4 border-black pb-2">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Choose Items ({selectedItems.length} Selected)
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => {
              const selected = selectedItems.some(
                (selected) => selected.id_item === item.id_item
              );

              return (
                <button
                  key={item.id_item}
                  onClick={() => toggleItem(item)}
                  className={`border-4 border-black text-left flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    selected 
                      ? "bg-[#FFF2B2] translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="relative h-48 w-full border-b-4 border-black bg-gray-100">
                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {selected && (
                      <div className="absolute top-2 right-2 bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Active
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <h3 className="font-black text-sm uppercase tracking-tight line-clamp-2">
                      {item.name}
                    </h3>
                    <div>
                      <span className="inline-block bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 border border-black">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
       <Footer />
    </main>
  );
}