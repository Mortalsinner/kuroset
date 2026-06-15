"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAlert({
          message: error.message,
          type: "error",
        });
        return;
      }

      setAlert({
        message: "We're taking you to your dashboard.",
        type: "success",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: "Terjadi kesalahan sistem.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-black font-sans selection:bg-[#52D1F6] selection:text-black">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        
        {/* HEADER BRANDING AREA */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Welcome <span className="text-[#D5E04D] [text-shadow:2px_2px_0px_#000]">Back</span> ⚡
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Unlock your curated style archive
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* INPUT DATA BLOCK: EMAIL */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#52D1F6] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* INPUT DATA BLOCK: PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wide block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#52D1F6] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ACTION BUTTON TRIGGER */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#52D1F6] text-black disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
            >
              {loading ? "⚙️ Authenticating..." : "Sign In 🚀"}
            </button>
          </div>

        </form>

        {/* NAVIGATION LINK TO REGISTER PAGE */}
        <div className="text-center pt-3 border-t-2 border-dashed border-black">
          <p className="text-xs font-bold uppercase text-gray-500">
            New to Kurosette?{" "}
            <Link 
              href="/register" 
              className="text-black underline font-black hover:text-[#F652A0] transition-colors ml-1"
            >
              Create An Account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}