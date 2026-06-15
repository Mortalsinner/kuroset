"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
  shop_url?: string | null;
};

type Outfit = {
  id_outfit: string;
  name: string;
  notes: string | null;
  is_public: boolean;
  items: Item[];
};

export default function OutfitFromProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const userId = params.userId as string;

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (id) getOutfit();
  }, [id]);

  const getOutfit = async () => {
    try {
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
              name,
              category,
              image_url,
              shop_url
            )
          )
        `)
        .eq("id_outfit", id)
        .single();

      if (error) throw error;
      if (!data) {
        setAlert({ message: "Outfit not found", type: "error" });
        return;
      }

      const formatted: Outfit = {
        id_outfit: data.id_outfit,
        name: data.name,
        notes: data.notes,
        is_public: data.is_public,
        items: data.outfit_items?.map((item: any) => item.items).filter(Boolean) || [],
      };

      setOutfit(formatted);
    } catch (error: any) {
      console.error(error);
      setAlert({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("wardrobe-images").getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F652A0] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Inspecting outfit blueprint... ⚡
      </main>
    );
  }

  if (!outfit) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-black font-sans">
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        <div className="bg-white border-4 border-black p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-5xl block mb-4">🕵️‍♂️</span>
          <h1 className="text-2xl font-black uppercase tracking-tight">Outfit Not Found</h1>
          <p className="font-bold text-gray-500 mt-2 uppercase text-xs">The stylistic formula you are looking for doesn't exist.</p>
          <Link href={`/explore`} className="mt-6 inline-block bg-[#52D1F6] text-black font-black border-4 border-black px-5 py-2.5 text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Back to Explore ↩️</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#52D1F6] selection:text-black">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* TOP NAVIGATION BAR */}
        <div className="flex justify-between items-center gap-4">
          <Link 
            href={`/explore`} 
            className="bg-white text-black font-black border-2 border-black px-4 py-2 text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
          >
            ⬅️ Back to Explore
          </Link>

          {outfit.is_public ? (
            <div className="bg-[#D5E04D] text-black border-4 border-black text-xs font-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest">Public 🌎</div>
          ) : (
            <div className="bg-black text-white border-4 border-black text-xs font-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest">Private Vault 🔒</div>
          )}
        </div>

        {/* OUTFIT HEADER CARD */}
        <header className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-8xl font-black text-gray-100 select-none pointer-events-none uppercase">FIT</div>
          <div className="relative z-10 space-y-4">
            <span className="bg-[#F652A0] text-white border-2 border-black text-[10px] font-black px-2.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest">
              Style Combination
            </span>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              {outfit.name}
            </h1>
            
            <p className="font-bold text-sm text-gray-7xl border-l-4 border-black pl-4 max-w-2xl py-1 italic">
              "{outfit.notes || "This compilation has no custom layout notes or instructions attached."}"
            </p>

            {/* DEDICATED VIEW CREATOR PROFILE BUTTON */}
            <div className="pt-2">
              <Link 
                href={`/profile/${userId}`}
                className="inline-block bg-[#D5E04D] hover:bg-black hover:text-white text-black font-black border-4 border-black px-5 py-2.5 text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                View Creator Profile 👤
              </Link>
            </div>
          </div>
        </header>

        {/* GRID SILHOUETTE PREVIEW */}
        <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-black text-lg uppercase tracking-tight mb-4 flex items-center gap-2"><span>✨</span> Grid Silhouette Preview</h2>
          {outfit.items.length === 0 ? (
            <div className="border-4 border-dashed border-gray-300 p-8 text-center text-sm font-bold text-gray-400 uppercase">No items linked to this configuration</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {outfit.items.map((item) => (
                <figure key={`preview-${item.id_item}`} className="relative h-60 bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
                  <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-2 left-2 bg-black text-white text-[9px] font-black px-2 py-0.5 border border-white uppercase">{item.category}</div>
                </figure>
              ))}
            </div>
          )}
        </section>

        {/* INSIDE THE ENSEMBLE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black [text-shadow:1px_1px_0px_#fff]">⚙️ Inside The Ensemble ({outfit.items.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {outfit.items.map((item) => (
              <div key={`detail-${item.id_item}`} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <figure className="relative h-44 bg-gray-100 border-b-2 border-black overflow-hidden">
                    <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover" />
                  </figure>
                  <div className="p-4 space-y-2">
                    <span className="bg-[#52D1F6] border border-black text-[9px] font-black px-2 py-0.5 uppercase tracking-wide inline-block">{item.category}</span>
                    <h3 className="font-black text-sm uppercase tracking-tight text-black line-clamp-1" title={item.name}>{item.name}</h3>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3 w-full">
                  {item.shop_url ? (
                    <a href={item.shop_url} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-[#D5E04D] hover:bg-black hover:text-white text-black font-black py-2 text-xs border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider">Buy Item 🛒</a>
                  ) : (
                    <button disabled className="w-full block text-center bg-gray-100 text-gray-400 font-bold py-2 text-xs border-2 border-gray-300 uppercase cursor-not-allowed">No Store Link 🚫</button>
                  )}

                  <Link href={`/wardrobe?search=${encodeURIComponent(item.name)}`} className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black transition-colors underline decoration-2 decoration-[#F652A0] block text-center">View in Wardrobe 🔍</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
       <Footer />
    </main>
  );
}