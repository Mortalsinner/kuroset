"use client";

import { useEffect,useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";


type Outfit={

  id_outfit:string;

  name:string;

  notes:string;

  is_public:boolean;

  items:any[];

};





export default function OutfitPage(){



  const [outfits,setOutfits]=useState<Outfit[]>([]);

  const [loading,setLoading]=useState(true);



  const [deleteId,setDeleteId]=useState<string|null>(null);



  const [alert,setAlert]=useState<{
    message:string;
    type:"success"|"error"|"info";
  }|null>(null);






  useEffect(()=>{

    getOutfits();

  },[]);









  const getOutfits=async()=>{


    try{



      const {
        data:{
          user
        }

      }=await supabase.auth.getUser();





      if(!user)
        return;







      const {
        data,
        error

      }=await supabase

        .from("outfits")

        .select(`

          id_outfit,
          name,
          notes,
          is_public,

          outfit_items(

            items(

              id_item,

              image_url

            )

          )

        `)

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






      if(error)
        throw error;







      const formatted=data.map(

        (outfit:any)=>({


          id_outfit:outfit.id_outfit,


          name:outfit.name,


          notes:outfit.notes,


          is_public:outfit.is_public,



          items:

          outfit.outfit_items?.map(

            (item:any)=>
            item.items

          ) || []


        })

      );





      setOutfits(
        formatted
      );






    }catch(error:any){


      console.error(error);



      setAlert({

        message:error.message,

        type:"error"

      });



    }finally{


      setLoading(false);


    }


  };









  const deleteOutfit=async()=>{


    if(!deleteId)
      return;





    try{





      const {
        error:itemsError

      }=await supabase

        .from("outfit_items")

        .delete()

        .eq(
          "id_outfit",
          deleteId
        );






      if(itemsError)
        throw itemsError;








      const {
        error:outfitError

      }=await supabase

        .from("outfits")

        .delete()

        .eq(
          "id_outfit",
          deleteId
        );







      if(outfitError)
        throw outfitError;







      setOutfits(

        outfits.filter(

          outfit=>

          outfit.id_outfit!==deleteId

        )

      );






      setAlert({

        message:"Outfit berhasil dihapus",

        type:"success"

      });







    }catch(error:any){



      console.error(error);



      setAlert({

        message:error.message,

        type:"error"

      });




    }finally{


      setDeleteId(null);


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
        justify-center
        items-center
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



      {
        alert && (

          <Alert

            message={alert.message}

            type={alert.type}

            onClose={()=>setAlert(null)}

          />

        )
      }







      <div className="
        max-w-6xl
        mx-auto
      ">







        <div className="
          flex
          justify-between
          items-center
          mb-8
        ">



          <h1 className="
            text-4xl
            font-bold
          ">

            My Outfit ✨


          </h1>






          <Link

            href="/outfit/new"

            className="
              btn
              btn-primary
            "

          >

            Create Outfit


          </Link>





        </div>








        <div className="
          grid
          md:grid-cols-3
          gap-6
        ">






          {


            outfits.map(outfit=>(




              <div


                key={
                  outfit.id_outfit
                }


                className="
                  card
                  bg-base-100
                  shadow-xl
                "


              >





                <div className="
                  grid
                  grid-cols-3
                  gap-1
                  h-48
                ">




                  {


                    outfit.items

                    .slice(0,3)

                    .map((item:any)=>(



                      <div


                        key={
                          item.id_item
                        }


                        className="
                          relative
                        "


                      >




                        <Image


                          src={

                            getImageUrl(

                              item.image_url

                            )

                          }


                          alt="item"


                          fill


                          className="
                            object-cover
                          "


                        />





                      </div>



                    ))



                  }




                </div>









                <div className="
                  card-body
                ">




                  <h2 className="
                    card-title
                  ">


                    {outfit.name}


                  </h2>





                  <p className="
                    text-gray-500
                  ">


                    {outfit.notes}


                  </p>







                  {

                    outfit.is_public


                    ?


                    <div className="
                      badge
                      badge-success
                    ">


                      Public


                    </div>



                    :


                    <div className="
                      badge
                    ">


                      Private


                    </div>


                  }








                  <div className="
                    card-actions
                    justify-end
                    mt-4
                    gap-2
                  ">






                    <Link


                      href={
                        `/outfit/${outfit.id_outfit}`
                      }


                      className="
                        btn
                        btn-outline
                      "


                    >


                      View


                    </Link>








                    <Link


                      href={

                        `/outfit/${outfit.id_outfit}/edit`

                      }


                      className="
                        btn
                        btn-primary
                      "


                    >


                      Edit


                    </Link>








                    <button


                      onClick={()=>setDeleteId(
                        outfit.id_outfit
                      )}


                      className="
                        btn
                        btn-error
                      "


                    >


                      Delete


                    </button>






                  </div>






                </div>






              </div>



            ))



          }





        </div>





      </div>









      {
        deleteId && (



          <dialog className="
            modal
            modal-open
          ">



            <div className="
              modal-box
            ">




              <h3 className="
                font-bold
                text-lg
              ">


                Delete Outfit?


              </h3>





              <p className="
                py-4
              ">


                Apakah kamu yakin ingin menghapus outfit ini?


              </p>







              <div className="
                modal-action
              ">



                <button


                  onClick={()=>setDeleteId(null)}


                  className="
                    btn
                  "


                >


                  Cancel


                </button>







                <button


                  onClick={deleteOutfit}


                  className="
                    btn
                    btn-error
                  "


                >


                  Delete


                </button>




              </div>





            </div>





          </dialog>



        )
      }





    </main>


  );


}