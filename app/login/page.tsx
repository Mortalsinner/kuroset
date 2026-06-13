"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({
        message: "Please fill in all fields.",
        type: "error",
      });
      return;
    }

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
      message: "Login successful! Welcome back.",
      type: "success",
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#D5E04D] p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white">
      
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
        
        {/* HEADER / BRAND BADGE */}
        <div className="text-center space-y-2">
          <div className="bg-[#F652A0] text-black border-2 border-black px-3 py-1 inline-block font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs uppercase tracking-widest">
            Fashion Studio Club
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none uppercase">
            Welcome <br />
            <span className="text-[#52D1F6] [text-shadow:2px_2px_0px_#000]">Back</span> ⚡
          </h1>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-tight pt-1">
            Enter your credentials to access your digital wardrobe
          </p>
        </div>

        {/* FORM INPUTS */}
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-xs tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-white border-4 border-black p-3 font-bold placeholder-gray-400 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-black uppercase text-xs tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white border-4 border-black p-3 font-bold placeholder-gray-400 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white text-center border-4 border-black font-black py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider text-sm mt-2"
        >
          Let's Go 🚀
        </button>

      </div>
    </div>
  );
}