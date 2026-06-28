"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

// Struktur data item yang ada di wardrobe user
type Item = {
  id_item: string;
  name: string;
  category: string;
  color: string | null;
  shop_url: string | null;
  image_url: string;
  notes: string | null;
};

// Struktur relasi outfit dengan item yang terhubung
type OutfitItem = {
  items: { name: string; category: string; image_url: string } | null;
};

// Helper untuk memotong nama yang terlalu panjang agar tampil lebih rapi
const truncateMiddle = (str: string, maxLength: number = 18): string => {
    if (!str || str.length <= maxLength) return str;
    
    const separator = "...";
    const charsToShow = maxLength - separator.length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    
    return str.substring(0, frontChars) + separator + str.substring(str.length - backChars);
  };

// Struktur data outfit yang akan ditampilkan di halaman profil
type Outfit = {
  id_outfit: string;
  name: string;
  created_at: string;
  outfit_items: OutfitItem[];
};

export default function ViewProfilePage() {
  const router = useRouter();

  // State utama untuk status loading, alert notifikasi, dan data profil user
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // State untuk menyimpan data profil pengguna, daftar item wardrobe, dan daftar outfit
  const [profile, setProfile] = useState<any | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  // Jalankan loadAll sekali ketika halaman pertama kali dirender
  useEffect(() => {
    loadAll();
  }, []);

  // Load semua data profil, wardrobe item, dan outfit user dari Supabase
  const loadAll = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const userId = user.id;

      // Ambil data profil user dari tabel users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id_user, username, full_name, avatar_url, bio, email")
        .eq("id_user", userId)
        .single();

      if (userError) throw userError;
      setProfile(userData || null);

      // Ambil semua item wardrobe user
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", userId)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          name,
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
        .order("created_at", { ascending: false });

      if (outfitsError) throw outfitsError;

      const formatted = (outfitsData || []).map((it: any) => ({
        id_outfit: it.id_outfit,
        name: it.name,
        created_at: it.created_at,
        outfit_items: it.outfit_items || [],
      }));

      setOutfits(formatted);
    } catch (error: any) {
      console.error(error);
      setAlert({ message: error.message || "Failed to load profile.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mengambil URL gambar item wardrobe dari storage Supabase
  const getImageUrl = (path: string) => {
    return supabase.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;
  };

  // Helper untuk mengambil URL avatar profil dari storage Supabase atau menggunakan URL eksternal jika sudah diberikan
  const getAvatarUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return supabase.storage.from("profile-images").getPublicUrl(cleanPath).data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Loading your profile... ⚡
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-7xl mx-auto space-y-8">
         <div className="flex gap-2">
         <Link href="/dashboard" className="bg-white text-black font-black border-4 border-black px-4 py-2 text-xs uppercase">⬅️ Dashboard</Link>
          <Link href="/profile/edit" className="bg-[#D5E04D] text-black font-black border-4 border-black px-4 py-2 text-xs uppercase">Edit Profile</Link>
         </div>
        <header className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 border-4 border-black overflow-hidden bg-white">
              {profile?.avatar_url ? (
                <Image src={getAvatarUrl(profile.avatar_url)} alt={profile.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              )}
            </div>
            <div>
              <div className="text-3xl font-black uppercase">{truncateMiddle(profile?.full_name || profile?.username, 18)}</div>
              <div className="text-sm font-bold text-gray-600">@{profile?.username}</div>
            </div>
          </div>
        </header>

        <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-black uppercase mb-2">About</h2>
          <p className="text-sm font-bold text-gray-700">{profile?.bio || "No bio provided."}</p>
        </section>

        <section>
          <h3 className="text-xl font-black uppercase mb-3">My Outfits</h3>
          {outfits.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-black p-8 text-center">You have no outfits yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {outfits.map((o) => {
                const mainCover = o.outfit_items?.[0]?.items?.image_url || "";
                return (
                  <div key={o.id_outfit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="relative h-48">
                      {mainCover ? (
                        <Image src={getImageUrl(mainCover)} alt={o.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🔒 No Image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-black uppercase truncate">{o.name}</div>
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

        <section>
          <h3 className="text-xl font-black uppercase mb-3">My Wardrobe</h3>
          {items.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-black p-8 text-center">Your wardrobe is empty.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {items.map((item) => (
                <div key={item.id_item} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group">
                  <div>
                    <figure className="relative h-64 bg-gray-100 border-b-4 border-black overflow-hidden">
                      <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover" />
                    </figure>
                    <div className="p-5 space-y-3">
                      <div className="bg-[#52D1F6] border-2 border-black text-xs font-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase inline-block">
                        {item.category}
                      </div>
                      <h2 className="font-black text-xl tracking-tight uppercase truncate" title={item.name}>{item.name}</h2>
                    </div>
                  </div>
                  {/* <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                    <Link href={`/wardrobe/edit/${item.id_item}`} className="text-center bg-white hover:bg-black hover:text-white text-black font-black py-2 text-xs border-2 border-black uppercase tracking-wider">Edit</Link>
                    <Link href={`/wardrobe/${item.id_item}`} className="text-center bg-[#F652A0] text-black font-black py-2 text-xs border-2 border-black uppercase tracking-wider">Details</Link>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
       <Footer />
    </main>
  );
}