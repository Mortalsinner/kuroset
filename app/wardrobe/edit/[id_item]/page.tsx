"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id_item = params.id_item as string;

  // State utama untuk status loading, proses penyimpanan, field form item, dan alert
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [oldImage, setOldImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Jalankan fetchItem ketika id_item tersedia, untuk mengisi form edit
  useEffect(() => {
    if (id_item) {
      fetchItem();
    }
  }, [id_item]);

  // Ambil detail item dari database dan siapkan nilai form serta preview gambar yang sudah tersimpan
  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id_item", id_item)
        .single();

      if (error) throw error;

      setName(data.name);
      setCategory(data.category);
      setColor(data.color || "");
      setShopUrl(data.shop_url || "");
      setNotes(data.notes || "");
      setOldImage(data.image_url);

      const imageUrl = supabase.storage
        .from("wardrobe-images")
        .getPublicUrl(data.image_url).data.publicUrl;

      setPreview(imageUrl);
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Saat user memilih gambar baru, simpan file sementara di state dan tampilkan preview lokal
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Simpan perubahan item, upload gambar baru jika diperlukan, dan update record item di Supabase
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      let imageUrl = oldImage;

      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User tidak ditemukan");

        const ext = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("wardrobe-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        if (oldImage) {
          await supabase.storage
            .from("wardrobe-images")
            .remove([oldImage]);
        }

        imageUrl = fileName;
      }

      const { error } = await supabase
        .from("items")
        .update({
          name,
          category,
          color,
          shop_url: shopUrl,
          notes,
          image_url: imageUrl
        })
        .eq("id_item", id_item);

      if (error) throw error;

      setAlert({
        message: "Item berhasil diperbarui",
        type: "success"
      });

      setTimeout(() => {
        router.push("/wardrobe");
      }, 1000);
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Tampilkan state loading saat data item sedang diambil dari database
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-black text-2xl tracking-widest uppercase animate-pulse">
        ⚡ Hydrating Closet Item Archive... ⚡
      </main>
    );
  }

  // Render form edit lengkap dengan preview gambar, input field, dan tombol simpan
  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#52D1F6] selection:text-black relative">
      {/* Tampilkan alert apabila ada pesan sukses atau error dari proses update */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* NAVIGATION BUTTON TO WARDROBE PAGE */}
        <div className="flex justify-start">
          <Link
            href="/wardrobe"
            className="bg-white text-black font-black border-4 border-black px-4 py-2 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider inline-block text-center"
          >
            ⬅️ Wardrobe
          </Link>
        </div>

        <form 
          onSubmit={handleUpdate}
          className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
        >
          {/* HEADER FORM */}
          <div className="border-b-4 border-black pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Edit <span className="text-[#F652A0] [text-shadow:1.5px_1.5px_0px_#000]">Item</span> ⚙️
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                Edit item information
              </p>
            </div>
          
          </div>

          {/* VISUAL MEDIA MEDIA PREVIEW ACCORDION */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Item preview</label>
            <div className="relative h-72 w-full bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
              {preview ? (
                <Image
                  src={preview}
                  alt="Current item specification visualization"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-xs uppercase text-gray-400">
                  No Frame Snapshot Available
                </div>
              )}
            </div>
          </div>

          {/* MEDIA UPLOADER CONTROL */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Replace item image </label>
            <div className="relative border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs font-mono font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-[#52D1F6] file:text-black file:font-black file:uppercase file:text-[10px] file:cursor-pointer hover:file:bg-white transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* TEXT FIELD INPUTS GROUP */}
          <div className="space-y-4 pt-2">
            
            {/* INPUT NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Vintage Oversized Bomber Jacket"
                required
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
              />
            </div>

            {/* INPUT CATEGORY SELECT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Item Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black appearance-none focus:outline-none focus:bg-[#52D1F6] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm cursor-pointer"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  <option value="TOPS">Tops</option>
                  <option value="BOTTOMS">Bottoms</option>
                  <option value="OUTERS">OUTERS</option>
                  <option value="SHOES">SHOES</option>
                  <option value="ACCESSORIES">ACCESSORIES</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 font-black border-l-4 border-black bg-black text-white">
                  ▼
                </div>
              </div>
            </div>

            {/* TWO COLUMN GRID FOR COLOR & SHOP URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wide block">Colorway Tone</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Midnight Black"
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wide block">Store URL</label>
                <input
                  type="url"
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  placeholder="https://store.com/item"
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm"
                />
              </div>
            </div>

            {/* INPUT NOTES TEXTAREA */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wide block">Description</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write specific material composition, cleaning conditions or storage metrics..."
                rows={3}
                className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors text-sm resize-none"
              />
            </div>

          </div>

          {/* TRANSACTIONAL MUTATION ACTION TRIGGER */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#D5E04D] text-black disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-wider text-sm"
            >
              {saving ? "⚙️ Saving System Config..." : "Update Piece 💾"}
            </button>
          </div>
        </form>
      </div>
       <Footer />
    </main>
  );
}