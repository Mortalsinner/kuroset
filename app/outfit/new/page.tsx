"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";


type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};



export default function NewOutfitPage() {

  const router = useRouter();


  const [items, setItems] = useState<Item[]>([]);

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const [outfitName, setOutfitName] = useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);




  useEffect(() => {

    getItems();

  }, []);




  const getItems = async () => {

    try {

      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();


      if (!user) return;



      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq(
          "id_user",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) throw error;


      setItems(data || []);


    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };





  const toggleItem = (item: Item) => {


    const exists = selectedItems.find(
      selected =>
        selected.id_item === item.id_item
    );



    if (exists) {


      setSelectedItems(
        selectedItems.filter(
          selected =>
            selected.id_item !== item.id_item
        )
      );


    } else {


      setSelectedItems([
        ...selectedItems,
        item
      ]);

    }

  };








  const saveOutfit = async () => {


    if (!outfitName) {

      alert(
        "Nama outfit wajib diisi"
      );

      return;

    }



    if (selectedItems.length === 0) {

      alert(
        "Pilih minimal satu item"
      );

      return;

    }



    try {


      setSaving(true);



      const {
        data: {
          user
        }

      } = await supabase.auth.getUser();



      if (!user) return;







      // Insert Outfit

      const {
        data: outfit,
        error: outfitError

      } = await supabase
        .from("outfits")
        .insert({

          id_user: user.id,

          name: outfitName,

          notes,

          is_public: false

        })

        .select()

        .single();




      if (outfitError) {

        throw outfitError;

      }







      // Insert Outfit Items


      const outfitItems = selectedItems.map(
        item => ({

          id_outfit:
            outfit.id_outfit,

          id_item:
            item.id_item

        })
      );




      const {
        error: itemError

      } = await supabase
        .from("outfit_items")
        .insert(
          outfitItems
        );




      if (itemError) {

        throw itemError;

      }





      alert(
        "Outfit berhasil dibuat"
      );



      router.push(
        "/dashboard"
      );



    } catch (error: any) {


      console.error(error);


      alert(
        error.message
      );


    } finally {

      setSaving(false);

    }


  };







  const getImageUrl = (
    path: string
  ) => {


    return supabase.storage

      .from(
        "wardrobe-images"
      )

      .getPublicUrl(path)

      .data.publicUrl;

  };






  if (loading) {

    return (

      <main className="p-6">

        Loading...

      </main>

    );

  }







  return (

    <main className="
      min-h-screen
      bg-gray-50
      p-6
    ">


      <div className="
        max-w-5xl
        mx-auto
      ">



        <h1 className="
          text-3xl
          font-bold
          mb-6
        ">

          Create Outfit ✨

        </h1>





        <div className="
          bg-white
          rounded-2xl
          p-6
          mb-8
        ">


          <input

            value={outfitName}

            onChange={(e)=>
              setOutfitName(
                e.target.value
              )
            }

            placeholder="Outfit name"

            className="
              w-full
              border
              rounded-lg
              p-3
              mb-4
            "

          />



          <textarea

            value={notes}

            onChange={(e)=>
              setNotes(
                e.target.value
              )
            }

            placeholder="Notes"

            className="
              w-full
              border
              rounded-lg
              p-3
            "

          />


        </div>









        <h2 className="
          text-xl
          font-bold
          mb-4
        ">

          Choose Items

        </h2>





        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-5
        ">


          {
            items.map(item => {


              const selected =
                selectedItems.some(
                  selected =>
                    selected.id_item === item.id_item
                );



              return (


                <button

                  key={item.id_item}

                  onClick={() =>
                    toggleItem(item)
                  }

                  className={`
                    bg-white
                    rounded-xl
                    overflow-hidden
                    border-2
                    ${
                      selected
                      ?
                      "border-black"
                      :
                      "border-transparent"
                    }
                  `}

                >


                  <div className="
                    relative
                    h-48
                  ">


                    <Image

                      src={
                        getImageUrl(
                          item.image_url
                        )
                      }

                      alt={item.name}

                      fill

                      className="
                        object-cover
                      "

                    />


                  </div>




                  <div className="p-3">


                    <h3 className="
                      font-semibold
                    ">

                      {item.name}

                    </h3>


                    <p className="
                      text-sm
                      text-gray-500
                    ">

                      {item.category}

                    </p>


                  </div>


                </button>


              );

            })
          }


        </div>








        <div className="
          bg-white
          rounded-2xl
          p-6
          mt-8
        ">


          <h2 className="
            font-bold
            mb-4
          ">

            Selected Outfit

          </h2>



          <div className="
            flex
            gap-4
            flex-wrap
          ">


            {
              selectedItems.map(item => (

                <div
                  key={item.id_item}
                  className="w-24"
                >

                  <div className="
                    relative
                    h-24
                  ">

                    <Image

                      src={
                        getImageUrl(
                          item.image_url
                        )
                      }

                      alt={item.name}

                      fill

                      className="
                        object-cover
                        rounded-lg
                      "

                    />


                  </div>


                </div>


              ))
            }


          </div>



        </div>








        <button

          onClick={saveOutfit}

          disabled={saving}

          className="
            mt-6
            bg-black
            text-white
            px-6
            py-3
            rounded-xl
          "
        >
          {
            saving
            ?
            "Saving..."
            :
            "Save Outfit"
          }
        </button>
      </div>
    </main>
  );

}