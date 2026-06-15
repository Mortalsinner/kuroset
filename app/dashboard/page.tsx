"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState("User");
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [outfitCount, setOutfitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<any>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id_user", user.id)
        .single();

      setProfile(profileData);
      setUsername(profileData?.username || "User");

      // DI SINI PERUBAHANNYA: Menghapus .limit(6) agar mengambil semua data
      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("id_user", user.id)
        .order("created_at", {
          ascending: false,
        });

      setItems(itemData || []);

      const { count } = await supabase
        .from("outfits")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("id_user", user.id);

      setOutfitCount(count || 0);
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setConfirmLogoutOpen(false);
    setAlert({
      message: "Logout berhasil",
      type: "success",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  const openLogoutConfirmation = () => {
    setConfirmLogoutOpen(true);
  };

  const closeLogoutConfirmation = () => {
    setConfirmLogoutOpen(false);
  };

  const getImageUrl = (path: string) => {
    return supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(path).data.publicUrl;
  };

  const getAvatar = () => {
    if (!profile?.avatar_url) return null;

    return supabase.storage
      .from("profile-images")
      .getPublicUrl(profile.avatar_url).data.publicUrl;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-bold text-2xl">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D5E04D] p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      <div className="max-w-7xl mx-auto space-y-10">
        {confirmLogoutOpen && (
          <div className="modal modal-open" id="logout_modal">
            <div className="modal-box bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <h3 className="font-black text-2xl uppercase">Logout</h3>
              <p className="py-4 font-bold">Are you sure you want to sign out?</p>
              <div className="modal-action">
                <a
                  href="#"
                  className="btn bg-white border-2 border-black text-black rounded-none"
                  onClick={(e) => {
                    e.preventDefault();
                    closeLogoutConfirmation();
                  }}
                >
                  Cancel
                </a>
                <button
                  onClick={logout}
                  className="btn bg-[#F652A0] border-2 border-black font-black text-white hover:bg-[#d6478a] rounded-none"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8 p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            
            <div>
              <div className="flex items-center gap-5 mb-6">
                {getAvatar() && (
                  <Image
                    src={getAvatar()!}
                    width={80}
                    height={80}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-black flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {profile?.full_name || username}
                  </h2>
                  <p className="font-bold">@{username}</p>
                </div>
              </div>

              <p className="mt-4 font-medium text-lg border-l-4 border-black pl-4">
                {profile?.bio ||
                  "create your style, organize your wardrobe, and discover new looks."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                href="/profile"
                className="bg-white text-black text-center border-4 border-black font-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                VIEW PROFILE
              </Link>
              <button 
                onClick={openLogoutConfirmation} 
                className="bg-[#F652A0] text-black font-black border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                LOGOUT
              </button>
            </div>

          </div>
        </section>

        {/* PROFILE COMPLETION PROMPT */}
        {(!profile?.username || !profile?.full_name || !profile?.avatar_url) && (
          <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black uppercase">Complete your profile!</h3>
                <p className="mt-2 font-bold text-gray-700">To get the most from Kuroset, please finish your profile:</p>
                <ul className="mt-3 text-sm font-bold space-y-1">
                  {!profile?.username && <li>• Add a <strong>username</strong></li>}
                  {!profile?.full_name && <li>• Add your <strong>full name</strong></li>}
                  {!profile?.avatar_url && <li>• Upload a <strong>profile photo</strong></li>}
                </ul>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/profile/edit"
                  className="bg-[#D5E04D] text-black font-black border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* STATS SECTION */}
        <section className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-[#F652A0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="font-black text-xl mb-2 uppercase">Wardrobe Items</h3>
            <p className="text-5xl font-black [text-shadow:3px_3px_0px_#fff]">{items.length}</p>
            <p className="font-bold mt-2">Clothes collected</p>
          </div>

          <div className="bg-[#52D1F6] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h3 className="font-black text-xl mb-2 uppercase">Created Outfits</h3>
            <p className="text-5xl font-black [text-shadow:3px_3px_0px_#fff]">{outfitCount}</p>
            <p className="font-bold mt-2">Fashion combinations</p>
          </div>
        </section>

        {/* NAVIGATION LINKS */}
        <section className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Link
            href="/wardrobe"
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <h2 className="text-2xl font-black mb-2">👕 WARDROBE</h2>
            <p className="font-medium">Manage your clothing items</p>
          </Link>

          <Link 
            href="/outfit" 
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <h2 className="text-2xl font-black mb-2">✨ MIX & MATCH</h2>
            <p className="font-medium">Create your outfit style</p>
          </Link>

          <Link 
            href="/explore" 
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <h2 className="text-2xl font-black mb-2">🌎 EXPLORE</h2>
            <p className="font-medium">Discover outfit inspiration</p>
          </Link>
        </section>

        {/* WARDROBE GRID */}
        <section className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            {/* Teks diubah dari "Latest Wardrobe" menjadi "My Wardrobe" */}
            <h2 className="text-3xl font-black tracking-tighter uppercase">My Wardrobe</h2>
            <Link 
              href="/wardrobe" 
              className="bg-[#D5E04D] border-2 border-black font-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              VIEW ALL
            </Link>
          </div>

          {/* Grid Tailwind otomatis akan bertambah barisnya ke bawah jika item lebih dari 6 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {items.map((item) => (
              <div
                key={item.id_item}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-transform"
              >
                <figure className="relative h-40 border-b-4 border-black">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </figure>
                <div className="p-3">
                  <h3 className="font-black truncate uppercase text-sm mb-2" title={item.name}>{item.name}</h3>
                  <div className="bg-[#D5E04D] border-2 border-black text-xs font-bold px-2 py-1 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {item.category}
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholder jika item kosong */}
            {items.length === 0 && (
              <div className="col-span-full py-10 text-center font-bold">
                No items yet. Start adding your collection!
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </main>
  );
}