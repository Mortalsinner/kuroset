"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// PERUBAHAN 1: Import komponen Alert milik Anda
import Alert from "@/components/Alert";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // PERUBAHAN 2: Menyesuaikan type alert agar cocok dengan komponen Anda ("info" ditambahkan)
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
      setAlert(null); // Reset alert setiap mulai menyimpan

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
      
      // Beri jeda agar user bisa melihat pesan sukses dari komponen Alert
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
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-6 relative">
      
      {/* PERUBAHAN 3: Memanggil komponen Alert milik Anda */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-xl mx-auto card bg-base-100 shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Profile ✨</h1>

        <div className="flex justify-center mb-6">
          {preview && (
            <div className="relative w-32 h-32">
              <Image
                src={preview}
                alt="avatar"
                fill
                className="rounded-full object-cover border"
              />
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="file-input file-input-bordered w-full mb-4"
        />

        <input
          value={email}
          disabled
          className="input input-bordered w-full mb-4 bg-base-200 cursor-not-allowed"
        />

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="input input-bordered w-full mb-4"
        />

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input input-bordered w-full mb-4"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="textarea textarea-bordered w-full mb-4"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </main>
  );
}