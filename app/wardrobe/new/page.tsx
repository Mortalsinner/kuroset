"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Link from "next/link";

export default function AddItemPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAlert({
          message: "User belum login",
          type: "error"
        });
        return;
      }

      if (!image) {
        setAlert({
          message: "Silahkan pilih foto item terlebih dahulu",
          type: "error"
        });
        return;
      }

      const fileExt = image.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("wardrobe-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("items")
        .insert({
          id_user: user.id,
          name,
          category,
          color,
          shop_url: shopUrl,
          image_url: fileName,
          notes
        });

      if (insertError) throw insertError;

      setAlert({
        message: "Item berhasil ditambahkan",
        type: "success"
      });

      setTimeout(() => {
        router.push("/wardrobe");
      }, 1000);
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

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#D5E04D] selection:text-black">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-xl mx-auto">
        <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          
          {/* HEADER SEKSYEN */}
          <div className="border-b-4 border-black pb-4 mb-6">
            <Link 
              href="/wardrobe" 
              className="inline-block mb-4 bg-black text-white px-4 py-2 font-black text-[10px] uppercase hover:bg-[#F652A0] transition-all border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              ← Back to List
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Add New <span className="text-[#52D1F6] [text-shadow:1.5px_1.5px_0px_#000]">Item</span> 👕
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
              Add new piece to your wardrobe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* PRATINJAU GAMBAR */}
            {image && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wide block">Selected Asset Preview</label>
                <div className="relative h-64 w-full bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Garment staging preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* INPUT FILE MEDIA */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Upload Item </label>
              <div className="relative border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full text-xs font-mono font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-[#F652A0] file:text-white file:font-black file:uppercase file:text-[10px] file:cursor-pointer hover:file:bg-black transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* INPUT NAMA ITEM */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Item Name</label>
              <input
                type="text"
                placeholder="e.g., Heavyweight Oversized Hoodie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
                required
              />
            </div>

            {/* INPUT KATEGORI */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Item Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black appearance-none focus:outline-none focus:bg-[#52D1F6] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm cursor-pointer"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="TOPS">Top</option>
                  <option value="BOTTOMS">Bottom</option>
                  <option value="OUTERS">Outer</option>
                  <option value="SHOES">Shoes</option>
                  <option value="ACCESSORIES">Accessories</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 font-black border-l-4 border-black bg-black text-white">
                  ▼
                </div>
              </div>
            </div>

            {/* GRID DUA KOLOM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wide block">Colorway Tone</label>
                <input
                  type="text"
                  placeholder="e.g., Earthy Olive"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wide block">Store  URL</label>
                <input
                  type="url"
                  placeholder="https://marketplace.com/..."
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
                />
              </div>
            </div>

            {/* INPUT CATATAN */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Description</label>
              <textarea
                placeholder="Write washing rules, material specifications, or defect logs..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm resize-none"
                rows={4}
              />
            </div>

            {/* TOMBOL PENGIRIMAN DATA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D5E04D] text-black disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
              >
                {loading ? "⚙️ Executing Data Pipelines..." : "Add Piece to Wardrobe ⚡"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}