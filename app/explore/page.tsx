"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

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

type LikeRelation = {
  id_user: string;
};

type OtherUserOutfit = {
  id_outfit: string;
  id_user: string;
  name: string;
  notes: string | null;
  created_at: string;
  users: UserProfile | null;
  outfit_items: OutfitItem[];
  outfit_likes: LikeRelation[]; // Menampung relasi user yang me-like outfit ini
};

export default function ExplorePage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<OtherUserOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // State Filter & Sorting (Ditambahkan opsi "most_liked")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_liked">("newest");
  const [timeRange, setTimeRange] = useState<"all" | "today" | "week" | "month">("all");

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const sortLabels = { 
    newest: "Newest First ✨", 
    oldest: "Oldest First ⏳", 
    most_liked: "Most Liked 🔥" 
  };
  const timeLabels = { all: "All Time 🌍", today: "Today ⏰", week: "This Week 📅", month: "This Month 🌙" };

  useEffect(() => {
    // Ambil session user aktif dan muat koleksi komunitas
    const initializeExplore = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
      await loadExploreOutfits();
    };

    initializeExplore();
  }, []);

  const loadExploreOutfits = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          id_user,
          name,
          notes,
          is_public,
          created_at,
          users (
            id_user,
            username,
            full_name,
            avatar_url,
            bio
          ),
          outfit_items (
            items (
              name,
              category,
              image_url
            )
          ),
          outfit_likes (
            id_user
          )
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        id_outfit: item.id_outfit,
        id_user: item.id_user,
        name: item.name,
        notes: item.notes,
        created_at: item.created_at,
        users: Array.isArray(item.users) ? item.users[0] : item.users,
        outfit_items: item.outfit_items || [],
        outfit_likes: item.outfit_likes || [], // Pemetaan array likes
      }));

      setOutfits(formattedData);
    } catch (error: any) {
      console.error("Error loading explore items:", error);
      setAlert({
        message: "Failed to fetch community outfits. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (outfitId: string, isLikedCurrently: boolean) => {
    if (!currentUserId) {
      setAlert({ message: "You must be logged in to like an outfit!", type: "info" });
      return;
    }

    // --- OPTIMISTIC UI UPDATE ---
    // Secara instan merubah angka & warna di browser tanpa menunggu respons lambat server
    setOutfits((prevOutfits) =>
      prevOutfits.map((o) => {
        if (o.id_outfit === outfitId) {
          const updatedLikes = isLikedCurrently
            ? o.outfit_likes.filter((like) => like.id_user !== currentUserId)
            : [...o.outfit_likes, { id_user: currentUserId }];
          return { ...o, outfit_likes: updatedLikes };
        }
        return o;
      })
    );

    try {
      if (isLikedCurrently) {
        const { error } = await supabase
          .from("outfit_likes")
          .delete()
          .eq("id_outfit", outfitId)
          .eq("id_user", currentUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("outfit_likes")
          .insert({ id_outfit: outfitId, id_user: currentUserId });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback data jika request backend mengalami kegagalan
      loadExploreOutfits();
      setAlert({ message: "Action failed. Reverting status.", type: "error" });
    }
  };

  const getItemImageUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const { data } = supabase.storage.from("wardrobe-images").getPublicUrl(cleanPath);
    return data.publicUrl;
  };

  const processedOutfits = outfits
    .filter((outfit) => {
      const matchName = outfit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUsername = outfit.users?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchName || matchUsername;
    })
    .filter((outfit) => {
      if (timeRange === "all") return true;
      const outfitTime = new Date(outfit.created_at).getTime();
      const now = Date.now();
      const diffInMs = now - outfitTime;
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      if (timeRange === "today") return diffInMs <= ONE_DAY_MS;
      if (timeRange === "week") return diffInMs <= ONE_DAY_MS * 7;
      if (timeRange === "month") return diffInMs <= ONE_DAY_MS * 30;
      return true;
    })
    .sort((a, b) => {
      // Menangani Pengurutan Berdasarkan Most Liked
      if (sortBy === "most_liked") {
        const countA = a.outfit_likes?.length || 0;
        const countB = b.outfit_likes?.length || 0;
        if (countB !== countA) return countB - countA;
        // Jika total like sama, kembalikan ke sorting terbaru
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#52D1F6] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Scanning community closets... ⚡
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#52D1F6] p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 text-9xl text-gray-100 font-black select-none z-0">
            STYLE
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="bg-[#D5E04D] text-black border-2 border-black px-3 py-1 inline-block mb-3 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs uppercase tracking-widest">
                Global Discovery
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
                Other Creators' <br />
                <span className="text-[#F652A0] [text-shadow:2px_2px_0px_#000]">Inspirations</span> 🌐
              </h1>
              <p className="mt-4 font-bold text-base max-w-xl border-l-4 border-black pl-3">
                Browse, inspect, and get inspired by fashion combinations compiled by other stylistic minds in the club.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-black text-white font-black border-4 border-black px-6 py-3 text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider"
            >
              Back to Dashboard 🏠
            </button>
          </div>
        </header>

        {/* CONTROLS (Search, Sort, Time) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full relative z-[35]">
          <div className="md:col-span-6 bg-white border-4 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 h-[56px]">
            <span className="text-xl">🔍</span>
            <input
              type="text"
              placeholder="Search outfits by name or creator..."
              className="w-full font-bold bg-transparent placeholder-gray-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 relative">
            <button
              onClick={() => { setIsSortDropdownOpen(!isSortDropdownOpen); setIsTimeDropdownOpen(false); }}
              className="w-full bg-white border-4 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between font-black text-sm uppercase h-[56px]"
            >
              <div className="flex items-center gap-1.5"><span className="text-gray-500 font-bold text-xs">Sort:</span><span>{sortLabels[sortBy]}</span></div>
              <span className={`transform transition-transform text-xs ${isSortDropdownOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-[58px] left-0 w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col z-50">
                <button onClick={() => { setSortBy("newest"); setIsSortDropdownOpen(false); }} className="text-left p-3 font-black text-xs uppercase border-b-2 border-black hover:bg-[#F652A0] hover:text-white">Newest First ✨</button>
                <button onClick={() => { setSortBy("oldest"); setIsSortDropdownOpen(false); }} className="text-left p-3 font-black text-xs uppercase border-b-2 border-black hover:bg-[#F652A0] hover:text-white">Oldest First ⏳</button>
                <button onClick={() => { setSortBy("most_liked"); setIsSortDropdownOpen(false); }} className="text-left p-3 font-black text-xs uppercase hover:bg-[#F652A0] hover:text-white">Most Liked 🔥</button>
              </div>
            )}
          </div>

          {/* Time Dropdown */}
          <div className="md:col-span-3 relative">
            <button
              onClick={() => { setIsTimeDropdownOpen(!isTimeDropdownOpen); setIsSortDropdownOpen(false); }}
              className="w-full bg-white border-4 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between font-black text-sm uppercase h-[56px]"
            >
              <div className="flex items-center gap-1.5"><span className="text-gray-500 font-bold text-xs">Time:</span><span>{timeLabels[timeRange]}</span></div>
              <span className={`transform transition-transform text-xs ${isTimeDropdownOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {isTimeDropdownOpen && (
              <div className="absolute top-[58px] left-0 w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col z-50">
                {(Object.keys(timeLabels) as Array<keyof typeof timeLabels>).map((key) => (
                  <button key={key} onClick={() => { setTimeRange(key); setIsTimeDropdownOpen(false); }} className="text-left p-3 font-black text-xs uppercase border-b-2 border-black hover:bg-[#F652A0] hover:text-white">{timeLabels[key]}</button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MAIN EXPLORE GRID */}
        {processedOutfits.length === 0 ? (
          <section className="bg-white border-4 border-dashed border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
            <div className="text-5xl mb-4">🕶️</div>
            <h3 className="text-2xl font-black uppercase">No outfits found</h3>
            <p className="font-bold text-gray-600 mt-2">Try adjusting your keywords or time range selection!</p>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
            {processedOutfits.map((outfit) => {
              const mainCoverPath = outfit.outfit_items?.[0]?.items?.image_url || "";
              const totalLikes = outfit.outfit_likes?.length || 0;
              const isLikedByMe = outfit.outfit_likes?.some((like) => like.id_user === currentUserId) || false;

              return (
                <div 
                  key={outfit.id_outfit} 
                  onClick={() => router.push(`/outfit/${outfit.id_outfit}/from-profile/${outfit.id_user}`)}
                  className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group transform hover:-translate-y-1 transition-all cursor-pointer select-none"
                >
                  <div>
                    {/* COVER PREVIEW */}
                    <figure className="relative h-64 bg-gray-100 border-b-4 border-black overflow-hidden">
                      {mainCoverPath ? (
                        <Image
                          src={getItemImageUrl(mainCoverPath)}
                          alt={outfit.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center font-black text-xs text-gray-400 bg-gray-50 uppercase p-4 text-center">
                          <span>No Image Access</span>
                          <span className="text-lg mt-1">🔒</span>
                        </div>
                      )}
                    </figure>

                    {/* CONTENT CARD */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div 
                          className="bg-[#D5E04D] border-2 border-black text-xs font-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
                          title={outfit.users?.username ? `@${outfit.users.username}` : "stranger"}
                        >
                          @{outfit.users?.username 
                            ? outfit.users.username.length > 12 
                              ? `${outfit.users.username.substring(0, 12)}...` 
                              : outfit.users.username 
                            : "stranger"}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                          {new Date(outfit.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <h3 className="font-black text-xl tracking-tight uppercase truncate" title={outfit.name}>
                        {outfit.name}
                      </h3>

                      <p className="text-xs font-bold text-gray-600 line-clamp-2 min-h-[2rem]">
                        {outfit.notes || "This creator left no notes for this combination."}
                      </p>

                      {/* Mini Items Breakdown */}
                      {outfit.outfit_items.length > 0 && (
                        <div className="pt-3 border-t-2 border-black">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                            Items Included ({outfit.outfit_items.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {outfit.outfit_items.map((oi, idx) => oi.items && oi.items.image_url ? (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-black overflow-hidden relative bg-gray-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                title={`${oi.items.name} [${oi.items.category}]`}
                              >
                                <Image
                                  src={getItemImageUrl(oi.items.image_url)}
                                  alt={oi.items.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD ACTIONS - DUAL ACTIONS ROW */}
                  <div className="p-5 pt-0 flex gap-3">
                    {/* Neo-Brutalist Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah bentrok click dengan parent card div
                        toggleLike(outfit.id_outfit, isLikedByMe);
                      }}
                      className={`px-3 py-2.5 font-black text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                        isLikedByMe 
                          ? "bg-[#F652A0] text-black" 
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <span>{isLikedByMe ? "❤️" : "🤍"}</span>
                      <span>{totalLikes}</span>
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/outfit/${outfit.id_outfit}/from-profile/${outfit.id_user}`);
                      }}
                      className="flex-1 text-center bg-white text-black font-black py-2.5 text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all uppercase tracking-wider"
                    >
                      View Details ⚡
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
        <Footer />
      </div>
    </main>
  );
}