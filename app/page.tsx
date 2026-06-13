"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

type Item = {
  name: string;
  category: string;
  image_url: string;
};

type OutfitItem = {
  items: Item;
};

// 1. Tipe data disesuaikan dengan kolom tabel outfits Anda (notes & is_public)
type PublicOutfit = {
  id_outfit: string;
  name: string;
  notes?: string; 
  is_public: boolean;
  users?: {
    username: string;
  };
  outfit_items?: OutfitItem[];
};

export default function PublicExplorePage() {
  const router = useRouter();

  const [outfits, setOutfits] = useState<PublicOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUserAndLoadOutfits();
  }, []);

  const checkUserAndLoadOutfits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // 2. Query disesuaikan: memanggil 'notes', 'is_public', dan menyaring hanya yang bernilai TRUE
      const { data, error } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          name,
          notes,
          is_public,
          users ( username ),
          outfit_items (
            items (
              name,
              category,
              image_url
            )
          )
        `)
        .eq("is_public", true) // Memastikan hanya mengambil outfit yang publik
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      
      const formattedData = (data || []).map((item: any) => ({
        id_outfit: item.id_outfit,
        name: item.name,
        notes: item.notes,
        is_public: item.is_public,
        users: Array.isArray(item.users) ? item.users[0] : item.users,
        outfit_items: item.outfit_items || [],
      }));

      setOutfits(formattedData);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: "Failed to load outfit inspiration.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProtectedAction = (actionName: string) => {
    if (isLoggedIn) {
      router.push("/outfit"); 
    } else {
      setAlert({
        message: `You must log in first to ${actionName}!`,
        type: "info",
      });
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  // Fungsi untuk mengambil URL gambar dari storage baju (wardrobe)
  const getItemImageUrl = (path: string) => {
    if (!path) return "";
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-bold text-2xl">
        Loading community looks...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D5E04D] p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HERO SECTION / HEADER */}
        <section className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="bg-[#52D1F6] text-black border-2 border-black px-4 py-1 inline-block mb-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm uppercase tracking-widest">
                Public Community
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase">
                Explore <br />
                <span className="text-[#F652A0] [text-shadow:2px_2px_0px_#000]">Community Looks</span> ✨
              </h1>
              <p className="mt-4 font-medium text-lg border-l-4 border-black pl-4 max-w-2xl">
                View the best clothing combinations from the digital wardrobes of fashion creators worldwide.
              </p>
            </div>

            <div className="w-full md:w-auto">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="block bg-[#F652A0] text-black text-center border-4 border-black font-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  GO TO DASHBOARD
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block bg-black text-white text-center border-4 border-black font-black px-8 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
                >
                  Join / Login Club 🚀
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* CTA BANNER TO ADD OUTFIT */}
        <section className="bg-[#F652A0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white [text-shadow:2px_2px_0px_#000]">Got your own cool style?</h2>
            <p className="font-bold text-black mt-1">Save your clothing collection and create limitless digital outfit combinations.</p>
          </div>
          <button
            onClick={() => handleProtectedAction("add a new outfit")}
            className="w-full md:w-auto bg-white text-black font-black border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap uppercase"
          >
            ➕ Add Your Outfit
          </button>
        </section>

        {/* OUTFIT GRID SECTION */}
        <section className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase">Trending Styles (Limited Preview)</h2>
            <p className="font-medium text-gray-6xl text-sm mt-1">Displaying a few sample outfits submitted by the community.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            
            {/* Render Limited Outfits */}
            {outfits.map((outfit) => {
              // 3. Mengambil gambar item pertama sebagai foto utama cover kartu outfit
              const coverItemImage = outfit.outfit_items?.[0]?.items?.image_url || "";

              return (
                <div
                  key={outfit.id_outfit}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group flex flex-col justify-between"
                >
                  <div>
                    <figure className="relative h-56 border-b-4 border-black bg-gray-100">
                      {coverItemImage ? (
                        <Image
                          src={getItemImageUrl(coverItemImage)}
                          alt={outfit.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                          No Image
                        </div>
                      )}
                    </figure>
                    <div className="p-4">
                      <div className="bg-[#D5E04D] border-2 border-black text-xs font-black px-2 py-0.5 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2 uppercase">
                        @{outfit.users?.username || "anonymous"}
                      </div>
                      <h3 className="font-black truncate uppercase text-base" title={outfit.name}>
                        {outfit.name}
                      </h3>
                      {/* Menggunakan outfit.notes sesuai dengan nama kolom database */}
                      <p className="text-xs font-medium text-gray-7xl mt-1 line-clamp-2">
                        {outfit.notes || "No description provided."}
                      </p>

                      {/* Menampilkan daftar semua baju kecil di bawahnya */}
                      {outfit.outfit_items && outfit.outfit_items.length > 0 && (
                        <div className="mt-4 pt-3 border-t-2 border-black flex flex-wrap gap-2">
                          {outfit.outfit_items.map((oi, idx) => oi.items && (
                            <div 
                              key={idx} 
                              className="w-8 h-8 rounded-full border-2 border-black overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title={`${oi.items.name} - ${oi.items.category}`}
                            >
                              <Image 
                                src={getItemImageUrl(oi.items.image_url)} 
                                alt={oi.items.name} 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                
                </div>
              );
            })}

            {/* CARD LOCK (LIMITER GIMMICK) */}
            <div className="bg-dashed bg-gray-50 border-4 border-dashed border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-center items-center text-center min-h-[300px]">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-black text-lg uppercase tracking-tight">Out of Style?</h3>
              <p className="text-xs font-bold text-gray-6xl mt-2 mb-4 px-2">
                There are 50+ more amazing outfit inspirations from the community hidden away!
              </p>
              <button
                onClick={() => handleProtectedAction("view the entire catalog")}
                className="bg-[#52D1F6] text-black text-xs font-black border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
              >
                View All Looks
              </button>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}