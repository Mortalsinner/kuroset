"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();

  // State untuk input email, password, status loading saat request, dan pesan alert
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Fungsi untuk mendaftarkan akun baru ke Supabase Auth
  const handleRegister = async () => {
    try {
      setLoading(true);

      // Kirim permintaan registrasi email/password ke Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setAlert({
          message: error.message,
          type: "error"
        });
        return;
      }

      // Tampilkan notifikasi sukses dan arahkan ke halaman login
      setAlert({
        message: "Registrasi berhasil! Silahkan login.",
        type: "success"
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setAlert({
        message: "Terjadi kesalahan sistem.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* REGISTRATION CARD COMPONENT */}
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 relative">
        
        {/* HEADER BRANDING AREA */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Join The <span className="text-[#52D1F6] [text-shadow:2px_2px_0px_#000]">Collective</span> ⚡
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Create an account
          </p>
        </div>

        {/* INPUT DATA BLOCK: EMAIL */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wide block">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* INPUT DATA BLOCK: PASSWORD */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wide block">Secure Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none focus:bg-[#D5E04D] placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ACTION BUTTON TRIGGER */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#F652A0] text-white disabled:bg-gray-400 font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
        >
          {loading ? "⚙️ Processing Vault..." : "Register Profile 🚀"}
        </button>

        {/* NAVIGATION BACK TO LOGIN */}
        <div className="text-center pt-3 border-t-2 border-dashed border-black">
          <p className="text-xs font-bold uppercase text-gray-500">
            Already registered?{" "}
            <Link 
              href="/login" 
              className="text-black underline font-black hover:text-[#F652A0] transition-colors ml-1"
            >
              Log In Here
            </Link>
          </p>
        </div>

      </div>
      
    </main>
  );
}