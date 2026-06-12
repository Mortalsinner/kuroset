"use client";
import {
  useEffect,
  useState
} from "react";
import {
  useParams,
  useRouter
} from "next/navigation";
import Image from "next/image";
import {
  supabase
} from "@/lib/supabase";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id_item =
    params.id_item as string;
  const [loading,setLoading] =
    useState(true);
  const [saving,setSaving] =
    useState(false);
  const [name,setName] =
    useState("");
  const [category,setCategory] =
    useState("");
  const [color,setColor] =
    useState("");
  const [shopUrl,setShopUrl] =
    useState("");
  const [notes,setNotes] =
    useState("");
  const [oldImage,setOldImage] =
    useState("");
  const [imageFile,setImageFile] =
    useState<File | null>(null);
  const [preview,setPreview] =
    useState("");
  useEffect(()=>{
    fetchItem();
  },[]);


  // =====================
  // GET ITEM
  // =====================
  const fetchItem = async()=>{
    const {
      data,
      error
    } = await supabase
      .from("items")
      .select("*")
      .eq(
        "id_item",
        id_item
      )
      .single();
    if(error){
      console.error(error);
      return;
    }

    setName(data.name);
    setCategory(data.category);
    setColor(data.color || "");
    setShopUrl(data.shop_url || "");
    setNotes(data.notes || "");
    setOldImage(
      data.image_url
    );
    const imageUrl =
      supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(
        data.image_url
      )
      .data
      .publicUrl;
    setPreview(imageUrl);
    setLoading(false);
  };



  // =====================
  // HANDLE IMAGE CHANGE
  // =====================
  const handleImageChange = (
    e:React.ChangeEvent<HTMLInputElement>
  )=>{
    const file =
      e.target.files?.[0];
    if(!file){
      return;
    }
    setImageFile(file);
    setPreview(
      URL.createObjectURL(file)
    );
  };


  // =====================
  // UPDATE ITEM
  // =====================
  const handleUpdate = async(
    e:React.FormEvent
  )=>{
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl =
        oldImage;


      // =====================
      // UPLOAD NEW IMAGE
      // =====================
      if(imageFile){
        const {
          data:{
            user
          }
        } = await supabase.auth.getUser();
        if(!user){
          throw new Error(
            "User tidak ditemukan"
          );
        }

        const fileExt =
          imageFile.name
          .split(".")
          .pop();

        const fileName =
          `${user.id}/${Date.now()}.${fileExt}`;
        const {
          error:uploadError
        } = await supabase.storage
          .from(
            "wardrobe-images"
          )
          .upload(
            fileName,
            imageFile
          );
        if(uploadError){
          throw uploadError;
        }

        // hapus gambar lama
        if(oldImage){
          await supabase.storage
          .from(
            "wardrobe-images"
          )
          .remove([
            oldImage
          ]);
        }
        imageUrl =
          fileName;
      }


      // =====================
      // UPDATE DATABASE
      // =====================
      const {
        error
      } = await supabase
      .from("items")
      .update({
        name,
        category,
        color,
        shop_url:
          shopUrl,
        notes,
        image_url:
          imageUrl
      })
      .eq(
        "id_item",
        id_item
      );
      if(error){
        throw error;
      }
      alert(
        "Item berhasil diperbarui"
      );
      router.push(
        "/wardrobe"
      );
    }
    catch(error:any){
      console.error(error);
      alert(
        error.message
      );
    }
    finally{
      setSaving(false);
    }
  };
  if(loading){
    return(
      <main className="p-6">
        Loading...
      </main>
    );
  }


  return(
    <main className="
      max-w-xl
      mx-auto
      p-6
    ">
      <h1 className="
        text-3xl
        font-bold
        mb-6
      ">
        Edit Item
      </h1>

      <form
      onSubmit={handleUpdate}
      className="space-y-4"
      >
      {/* Preview Image */}
      <div className="relative h-72">
        {
          preview && (
          <Image
          src={preview}
          alt="preview"
          fill
          className="
            object-cover
            rounded-xl
          "
          />
          )
        }
      </div>

      <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="
      border
      p-2
      rounded
      w-full
      "
      />

      <input
      value={name}
      onChange={(e)=>
        setName(
          e.target.value
        )
      }

      placeholder="Nama Item"
      className="
      border
      p-3
      rounded
      w-full
      "/>

      <select
      value={category}
      onChange={(e)=>
        setCategory(
          e.target.value
        )
      }
      className="
      border
      p-3
      rounded
      w-full
      "
      >

      <option value="Atasan">
        Atasan
      </option>

      <option value="Bawahan">
        Bawahan
      </option>

      <option value="Outer">
        Outer
      </option>

      <option value="Alas Kaki">
        Alas Kaki
      </option>

      <option value="Aksesoris">
        Aksesoris
      </option>

      </select>


      <input
      value={color}
      onChange={(e)=>
        setColor(
          e.target.value
        )
      }
      placeholder="Warna"
      className="
      border
      p-3
      rounded
      w-full
      "
      />

      <input
      value={shopUrl}
      onChange={(e)=>
        setShopUrl(
          e.target.value
        )
      }
      placeholder="Link Store"
      className="
      border
      p-3
      rounded
      w-full
      "
      />

      <textarea
      value={notes}
      onChange={(e)=>
        setNotes(
          e.target.value
        )
      }
      placeholder="Catatan"
      className="
      border
      p-3
      rounded
      w-full
      "
      />
      
      <button
      disabled={saving}
      className="
      bg-black
      text-white
      px-5
      py-3
      rounded-lg
      "
      >
      {
        saving
        ?
        "Saving..."
        :
        "Update Item"
      }
      </button>
      </form>
    </main>
  );
}