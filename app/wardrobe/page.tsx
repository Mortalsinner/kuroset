"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Item = {
  id_item: string;
  id_user: string;
  name: string;
  category: string;
  color: string | null;
  shop_url: string | null;
  image_url: string;
  notes: string | null;
  created_at: string;
};

export default function WardrobePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setItems(data || []);
    } catch (error) {
      console.error("Fetch items error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          My Wardrobe
        </h1>

        <p>Loading...</p>
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
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold">
            Belum ada item
          </h2>

          <p className="text-gray-500 mt-2">
            Tambahkan item pakaian pertama Anda.
          </p>

          <Link
            href="/wardrobe/new"
            className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-lg"
          >
            Add Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const imageUrl = supabase.storage
              .from("wardrobe-images")
              .getPublicUrl(item.image_url)
              .data.publicUrl;

            return (
              <div
                key={item.id_item}
                className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h2 className="font-semibold text-lg">
                    {item.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {item.category}
                  </p>

                  {item.color && (
                    <p className="text-sm mt-2">
                      🎨 {item.color}
                    </p>
                  )}

                  {item.shop_url && (
                    <a
                      href={item.shop_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-sm text-blue-500 hover:underline"
                    >
                      View Store
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}