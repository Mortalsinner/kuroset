"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id_user", user.id)
        .single();

      if (error) throw error;

      setEmail(data.email || "");
      setFullName(data.full_name || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");

      if (data.avatar_url) {
        const image = supabase.storage
          .from("profile-images")
          .getPublicUrl(data.avatar_url).data.publicUrl;

        setPreview(image);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setAlert(null);

      let newAvatar = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const fileName = `${userId}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, avatarFile, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        newAvatar = fileName;
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          username,
          bio,
          avatar_url: newAvatar,
        })
        .eq("id_user", userId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "Gagal menyimpan! Pastikan RLS (Row Level Security) mengizinkan UPDATE."
        );
      }

      setAlert({ message: "Profile berhasil diperbarui ✨", type: "success" });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setAlert({ message: error.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#D5E04D] text-black font-black text-2xl tracking-wider uppercase animate-pulse">
        ⚡ Accessing your profile... ⚡
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black font-sans selection:bg-[#F652A0] selection:text-white relative">
      
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* BUTTON NAVIGATION BACK TO DASHBOARD */}
        <div className="flex justify-start">
          <Link
            href="/dashboard"
            className="bg-white text-black font-black border-4 border-black px-4 py-2 text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider inline-block text-center"
          >
            ⬅️ Dashboard
          </Link>
        </div>

        {/* PROFILE FORM CONTAINER */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Edit <span className="text-[#52D1F6] [text-shadow:2px_2px_0px_#000]">Profile</span> ✨
            </h1>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-tight mt-1">
              Update your digital identity and showcase your style
            </p>
          </div>

          {/* AVATAR PREVIEW & UPLOAD */}
          <div className="flex flex-col items-center justify-center gap-4 bg-gray-50 p-4 border-2 border-dashed border-black">
            {preview ? (
              <div className="relative w-32 h-32 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <Image
                  src={preview}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-4 border-black bg-gray-200 flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                👤
              </div>
            )}
            
            <label className="w-full text-center">
              <span className="block text-xs font-black uppercase tracking-wider mb-2">Change Avatar Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-black file:uppercase file:bg-[#52D1F6] file:text-black hover:file:bg-white cursor-pointer"
              />
            </label>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-4">
            {/* EMAIL (DISABLED) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">Email Address</label>
              <input
                value={email}
                disabled
                className="w-full bg-gray-100 border-2 border-black p-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="YOUR FULL NAME"
                className="w-full bg-white border-2 border-black p-3 text-sm font-bold placeholder-gray-400 outline-none focus:bg-gray-50"
              />
            </div>

            {/* USERNAME */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME"
                className="w-full bg-white border-2 border-black p-3 text-sm font-bold placeholder-gray-400 outline-none focus:bg-gray-50"
              />
            </div>

            {/* BIO */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">Bio / Style Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="TELL US ABOUT YOUR STYLE INSPO..."
                rows={3}
                className="w-full bg-white border-2 border-black p-3 text-sm font-bold placeholder-gray-400 outline-none focus:bg-gray-50 resize-none"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#D5E04D] text-black font-black border-4 border-black py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none transition-all uppercase tracking-wider"
          >
            {saving ? "Saving Changes... ⚡" : "Save Profile 💾"}
          </button>

        </div>
      </div>
    </main>
  );
}