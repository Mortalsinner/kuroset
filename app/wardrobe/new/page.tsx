"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User belum login");
        return;
      }

      if (!image) {
        alert("Pilih foto terlebih dahulu");
        return;
      }

      // generate nama file unik
      const fileExt = image.name.split(".").pop();

      const fileName =
        `${user.id}/${Date.now()}.${fileExt}`;

      // upload ke storage
      const { error: uploadError } =
        await supabase.storage
          .from("wardrobe-images")
          .upload(fileName, image);

      if (uploadError) {
        throw uploadError;
      }
      
console.log({
  id_user: user.id,
  name,
  category,
});
      // simpan path file ke database
      const { error: insertError } =
        await supabase
          .from("items")
          .insert({
            id_user: user.id,
            name,
            category,
            color,
            shop_url: shopUrl,
            image_url: fileName,
            notes,
          });

      if (insertError) {
        throw insertError;
      }

      alert("Item berhasil ditambahkan");

      router.push("/wardrobe");
    } catch (error: any) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Add Item
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Nama Item"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border rounded p-3"
          required
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="w-full border rounded p-3"
          required
        >
          <option value="">
            Pilih Kategori
          </option>

          <option value="Atasan">
            Atasan
          </option>

          <option value="Bawahan">
            Bawahan
          </option>

          <option value="Outer">
            Outer
          </option>

          <option value="Alas Kaki">
            Alas Kaki
          </option>

          <option value="Aksesoris">
            Aksesoris
          </option>
        </select>

        <input
          type="text"
          placeholder="Warna"
          value={color}
          onChange={(e) =>
            setColor(e.target.value)
          }
          className="w-full border rounded p-3"
        />

        <input
          type="url"
          placeholder="Link Toko"
          value={shopUrl}
          onChange={(e) =>
            setShopUrl(e.target.value)
          }
          className="w-full border rounded p-3"
        />

        <textarea
          placeholder="Catatan"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          className="w-full border rounded p-3"
          rows={4}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(
              e.target.files?.[0] || null
            )
          }
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading
            ? "Uploading..."
            : "Save Item"}
        </button>
      </form>
    </main>
  );
}