"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};

export default function CreateOutfitPage() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

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

  const toggleItem = (item: Item) => {
    const exists = selectedItems.some(
      (selected) => selected.id_item === item.id_item
    );

    if (exists) {
      setSelectedItems(
        selectedItems.filter(
          (selected) => selected.id_item !== item.id_item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        item
      ]);
    }
  };

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

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const {
        data: outfit,
        error: outfitError
      } = await supabase
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

      const {
        error: itemError
      } = await supabase
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

  const getImageUrl = (path: string) => {
    return supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(path)
      .data.publicUrl;
  };

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Create Outfit ✨
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="card bg-base-100 shadow">
            <div className="card-body">

              <h2 className="card-title">
                Outfit Information
              </h2>

              <input
                className="input input-bordered w-full"
                placeholder="Outfit name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="mt-4">

                <h3 className="font-semibold mb-3">
                  Visibility
                </h3>

                <label className="flex items-center gap-3 mb-3 cursor-pointer">

                  <input
                    type="radio"
                    name="visibility"
                    className="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                  />

                  <div>
                    <p className="font-medium">
                      Private 🔒
                    </p>

                    <p className="text-sm text-gray-500">
                      Only you can see this outfit
                    </p>
                  </div>

                </label>


                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="radio"
                    name="visibility"
                    className="radio radio-primary"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                  />

                  <div>
                    <p className="font-medium">
                      Public 🌎
                    </p>

                    <p className="text-sm text-gray-500">
                      Other users can see this outfit
                    </p>
                  </div>

                </label>

              </div>


              <button
                onClick={saveOutfit}
                disabled={loading}
                className="btn btn-primary mt-5"
              >
                {loading ? "Saving..." : "Save Outfit"}
              </button>

            </div>
          </div>


          <div className="lg:col-span-2">

            <div className="card bg-base-100 shadow mb-6">

              <div className="card-body">

                <h2 className="card-title">
                  Outfit Preview
                </h2>

                <div className="grid grid-cols-3 gap-4 mt-4">

                  {selectedItems.length === 0 && (
                    <p className="text-gray-400 col-span-3">
                      Select clothes below
                    </p>
                  )}

                  {selectedItems.map((item) => (

                    <div
                      key={item.id_item}
                      className="relative h-40 rounded-xl overflow-hidden"
                    >

                      <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />

                    </div>

                  ))}

                </div>

              </div>

            </div>


          </div>

        </div>


        <h2 className="text-2xl font-bold mt-10 mb-5">
          Choose Clothes
        </h2>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {items.map((item) => {

            const selected = selectedItems.some(
              (selected) => selected.id_item === item.id_item
            );

            return (

              <button
                key={item.id_item}
                onClick={() => toggleItem(item)}
                className={`
                  card
                  bg-base-100
                  shadow
                  overflow-hidden
                  ${
                    selected
                    ? "ring-4 ring-primary"
                    : ""
                  }
                `}
              >

                <div className="relative h-48">

                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />

                </div>


                <div className="p-4 text-left">

                  <h3 className="font-bold">
                    {item.name}
                  </h3>

                  <div className="badge mt-2">
                    {item.category}
                  </div>

                </div>

              </button>

            );

          })}

        </div>

      </div>
    </main>
  );
}