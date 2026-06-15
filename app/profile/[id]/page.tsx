"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

type Item = {
  name: string;
  category: string;
  image_url: string;
};

type OutfitItem = {
  items: Item | null;
};

type UserProfile = {
  id_user: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
};

type OtherUserOutfit = {
  id_outfit: string;
  id_user: string;
  name: string;
  notes: string | null;
  created_at: string;
  outfit_items: OutfitItem[];
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [outfits, setOutfits] = useState<OtherUserOutfit[]>([]);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id_user, username, full_name, avatar_url, bio")
        .eq("id_user", userId)
        .single();

      if (userError) throw userError;

      setProfile(userData || null);

      const { data, error } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          id_user,
          name,
          notes,
          created_at,
          outfit_items (
            items (
              name,
              category,
              image_url
            )
          )
        `)
        .eq("id_user", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        id_outfit: item.id_outfit,
        id_user: item.id_user,
        name: item.name,
        notes: item.notes,
        created_at: item.created_at,
        outfit_items: item.outfit_items || [],
      }));

      setOutfits(formatted);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setAlert({ message: "Gagal memuat profil pengguna.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getItemImageUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const { data } = supabase.storage.from("wardrobe-images").getPublicUrl(cleanPath);
    return data.publicUrl;
  };

  /**
   * Fungsi Helper untuk memotong string di bagian tengah
   * @param str Teks asli yang ingin dipotong
   * @param maxLength Batas maksimal karakter sebelum pemotongan dilakukan
   */
  const truncateMiddle = (str: string, maxLength: number = 18): string => {
    if (!str || str.length <= maxLength) return str;
    
    const separator = "...";
    const charsToShow = maxLength - separator.length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    
    return str.substring(0, frontChars) + separator + str.substring(str.length - backChars);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Memuat profil... ⚡
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-black font-black text-lg p-6">
        <div className="space-y-4 text-center">
          <div>Profil tidak ditemukan.</div>
          <div>
            <Link href="/explore" className="underline font-bold">Back to Explore Page</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2 mb-4">
          <Link href="/explore" className="bg-white text-black font-black border-4 border-black px-4 py-2 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase">⬅️ Explore</Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 border-4 border-black overflow-hidden bg-white">
              {profile.avatar_url ? (
                <Image src={getItemImageUrl(profile.avatar_url)} alt={profile.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              )}
            </div>
            <div>
              {/* Jika nama profil juga berpotensi terlalu panjang, bisa dibungkus dengan truncateMiddle */}
              <div className="text-2xl font-black uppercase" title={profile.full_name || profile.username}>
                {truncateMiddle(profile.full_name || profile.username, 18)}
              </div>
              <div className="text-sm font-bold text-gray-600" title={`@${profile.username}`}>@{truncateMiddle(profile.username, 18)}</div>
            </div>
          </div>
        </div>

        <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-black uppercase mb-2">About</h2>
          <p className="text-sm font-bold text-gray-700">{profile.bio || "No bio provided."}</p>
        </section>

        <section>
          <h3 className="text-xl font-black uppercase mb-3">Public Outfits</h3>
          {outfits.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-black p-8 text-center">No public outfits yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {outfits.map((o) => {
                const mainCover = o.outfit_items?.[0]?.items?.image_url || "";
                return (
                  <div key={o.id_outfit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="relative h-48">
                      {mainCover ? (
                        <Image src={getItemImageUrl(mainCover)} alt={o.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🔒 No Image</div>
                      )}
                    </div>
                    <div className="p-4">
                      {/* Menggunakan kustomisasi pemotongan tengah dengan batas maksimal 18 karakter */}
                      <div className="font-black uppercase" title={o.name}>
                        {truncateMiddle(o.name, 18)}
                      </div>
                      <div className="text-xs text-gray-600">{new Date(o.created_at).toLocaleDateString()}</div>
                      <div className="mt-3">
                        <Link href={`/outfit/${o.id_outfit}/from-profile/${profile.id_user}`} className="inline-block bg-[#D5E04D] text-black font-black px-3 py-2 border-2 border-black text-xs uppercase">View Outfit</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}