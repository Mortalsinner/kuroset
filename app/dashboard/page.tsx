"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">
          Welcome 👋
        </h2>

        <p>{user.email}</p>
        <p>ID: {user.id}</p>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">
            Wardrobe
          </h3>

          <p>Kelola item pakaian Anda.</p>

          <button
            onClick={() => router.push("/wardrobe")}
            className="mt-3 rounded bg-black px-4 py-2 text-white"
          >
            Buka Wardrobe
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold">
            Explore Outfit
          </h3>

          <p>Lihat outfit publik pengguna lain.</p>

          <button
            onClick={() => router.push("/explore")}
            className="mt-3 rounded bg-black px-4 py-2 text-white"
          >
            Explore
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 rounded bg-red-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </main>
  );
}