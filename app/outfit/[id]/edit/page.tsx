"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id_item:string;
  name:string;
  category:string;
  image_url:string;
};

export default function EditOutfitPage(){

  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [items,setItems] = useState<Item[]>([]);
  const [selectedItems,setSelectedItems] = useState<Item[]>([]);

  const [name,setName] = useState("");
  const [notes,setNotes] = useState("");
  const [isPublic,setIsPublic] = useState(false);

  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);



  useEffect(()=>{

    if(id){
      loadData();
    }

  },[id]);




  const loadData = async()=>{

    try{


      const {
        data:outfit,
        error:outfitError
      } = await supabase
        .from("outfits")
        .select(`
          id_outfit,
          name,
          notes,
          is_public,
          outfit_items(
            items(
              id_item,
              name,
              category,
              image_url
            )
          )
        `)
        .eq("id_outfit",id)
        .single();



      if(outfitError)
        throw outfitError;



      if(!outfit)
        return;



      setName(
        outfit.name || ""
      );


      setNotes(
        outfit.notes || ""
      );


      setIsPublic(
        outfit.is_public || false
      );



      setSelectedItems(

        outfit.outfit_items?.map(
          (item:any)=>item.items
        ) || []

      );







      const {
        data:{
          user
        }

      } = await supabase.auth.getUser();



      if(!user)
        return;





      const {
        data:itemData,
        error:itemError

      } = await supabase

        .from("items")

        .select("*")

        .eq(
          "id_user",
          user.id
        )

        .order(
          "created_at",
          {
            ascending:false
          }
        );




      if(itemError)
        throw itemError;



      setItems(
        itemData || []
      );



    }catch(error){

      console.error(
        "Load outfit error:",
        error
      );


    }finally{

      setLoading(false);

    }

  };






  const toggleItem=(item:Item)=>{


    const exists = selectedItems.some(

      selected =>
      selected.id_item === item.id_item

    );




    if(exists){


      setSelectedItems(

        selectedItems.filter(

          selected =>
          selected.id_item !== item.id_item

        )

      );


    }else{


      setSelectedItems([

        ...selectedItems,

        item

      ]);


    }


  };









  const updateOutfit = async()=>{


    try{


      setSaving(true);




      const {
        error:updateError

      } = await supabase

        .from("outfits")

        .update({

          name,

          notes,

          is_public:isPublic

        })

        .eq(
          "id_outfit",
          id
        );





      if(updateError)
        throw updateError;






      const {
        error:deleteError

      } = await supabase

        .from("outfit_items")

        .delete()

        .eq(
          "id_outfit",
          id
        );





      if(deleteError)
        throw deleteError;







      const newItems = selectedItems.map(item=>({

        id_outfit:id,

        id_item:item.id_item

      }));







      const {
        error:insertError

      } = await supabase

        .from("outfit_items")

        .insert(
          newItems
        );





      if(insertError)
        throw insertError;





      alert(
        "Outfit berhasil diupdate"
      );



      router.push(
        `/outfit/${id}`
      );



    }catch(error:any){


      console.error(error);


      alert(
        error.message
      );


    }finally{


      setSaving(false);


    }


  };







  const getImageUrl=(path:string)=>{


    return supabase.storage

      .from(
        "wardrobe-images"
      )

      .getPublicUrl(path)

      .data.publicUrl;


  };






  if(loading){


    return(

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
      ">

        Loading...

      </main>

    );

  }







  return(


    <main className="
      min-h-screen
      bg-base-200
      p-6
    ">


      <div className="
        max-w-6xl
        mx-auto
      ">


        <h1 className="
          text-4xl
          font-bold
          mb-8
        ">

          Edit Outfit ✨

        </h1>







        <div className="
          card
          bg-base-100
          shadow
          p-6
        ">



          <input

            className="
              input
              input-bordered
              w-full
            "

            value={name}

            onChange={(e)=>
              setName(
                e.target.value
              )
            }

            placeholder="Outfit name"

          />





          <textarea

            className="
              textarea
              textarea-bordered
              w-full
              mt-4
            "

            value={notes}

            onChange={(e)=>
              setNotes(
                e.target.value
              )
            }

            placeholder="Notes"

          />






          <label className="
            label
            cursor-pointer
            mt-4
          ">



            <span className="
              label-text
            ">

              Public Outfit

            </span>





            <input

              type="checkbox"

              className="
                toggle
                toggle-primary
              "

              checked={isPublic}

              onChange={(e)=>
                setIsPublic(
                  e.target.checked
                )
              }

            />



          </label>







          <button

            onClick={updateOutfit}

            disabled={saving}

            className="
              btn
              btn-primary
              mt-5
            "

          >


            {
              saving
              ?
              "Saving..."
              :
              "Save Changes"
            }



          </button>



        </div>








        <h2 className="
          text-2xl
          font-bold
          mt-10
          mb-5
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

            items.map(item=>{


              const selected =
                selectedItems.some(

                  selected =>
                  selected.id_item === item.id_item

                );



              return(



                <button

                  key={
                    item.id_item
                  }

                  onClick={()=>
                    toggleItem(item)
                  }


                  className={`

                    card

                    bg-base-100

                    shadow

                    overflow-hidden

                    ${
                      selected
                      ?
                      "ring-4 ring-primary"
                      :
                      ""
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

                      alt={
                        item.name
                      }

                      fill

                      className="
                        object-cover
                      "

                    />


                  </div>





                  <div className="
                    p-4
                    text-left
                  ">


                    <h3 className="
                      font-bold
                    ">

                      {item.name}

                    </h3>


                    <div className="
                      badge
                      mt-2
                    ">

                      {item.category}

                    </div>


                  </div>



                </button>


              );


            })

          }



        </div>



      </div>


    </main>


  );

}