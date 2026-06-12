"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error("Get items error:", error);
    } finally {
      setLoading(false);
    }
  };


  const deleteItem = async (item: Item) => {
    const confirmDelete = confirm(
      "Apakah kamu yakin ingin menghapus item ini?"
    );

    if (!confirmDelete) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("wardrobe-images")
        .remove([item.image_url]);

      if (storageError) throw storageError;


      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id_item", item.id_item);


      if (error) throw error;

      alert("Item berhasil dihapus");

      getItems();

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };


  const getImageUrl = (path: string) => {
    return supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(path)
      .data.publicUrl;
  };


  if (loading) {
    return (
      <main className="p-6">
        Loading wardrobe...
      </main>
    );
  }


  return (
    <main className="p-6">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          My Wardrobe
        </h1>


        <Link
          href="/wardrobe/new"
          className="
            bg-black 
            text-white 
            px-4 
            py-2 
            rounded-lg
          "
        >
          Add Item
        </Link>

      </div>


      {
        items.length === 0 ? (

          <div className="border rounded-xl p-8 text-center">

            <h2 className="text-xl font-semibold">
              Wardrobe masih kosong
            </h2>

            <p className="text-gray-500 mt-2">
              Tambahkan item pakaian pertama kamu
            </p>

          </div>

        ) : (

          <div className="
            grid 
            grid-cols-1 
            md:grid-cols-3 
            lg:grid-cols-4 
            gap-6
          ">

            {
              items.map((item) => (

                <div
                  key={item.id_item}
                  className="
                    border 
                    rounded-xl 
                    overflow-hidden 
                    shadow-sm
                  "
                >

                  <div className="relative h-64">

                    <Image
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />

                  </div>


                  <div className="p-4">

                    <h2 className="text-lg font-bold">
                      {item.name}
                    </h2>


                    <p className="text-gray-500">
                      {item.category}
                    </p>


                    {
                      item.color && (
                        <p className="text-sm mt-1">
                          🎨 {item.color}
                        </p>
                      )
                    }


                    {
                      item.shop_url && (
                        <a
                          href={item.shop_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            text-blue-600 
                            text-sm 
                            mt-2 
                            inline-block
                            hover:underline
                          "
                        >
                          View Store
                        </a>
                      )
                    }


                    <div className="flex gap-3 mt-4">

                      <Link
                        href={`/wardrobe/edit/${item.id_item}`}
                        className="
                          bg-gray-200 
                          text-black
                          px-3 
                          py-2 
                          rounded-lg 
                          text-sm
                        "
                      >
                        Edit
                      </Link>


                      <button
                        onClick={() => deleteItem(item)}
                        className="
                          bg-red-500 
                          text-white 
                          px-3 
                          py-2 
                          rounded-lg 
                          text-sm
                        "
                      >
                        Delete
                      </button>

                    </div>


                  </div>

                </div>

              ))
            }

          </div>

        )
      }

    </main>
  );
}