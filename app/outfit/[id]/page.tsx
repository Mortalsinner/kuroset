"use client";

import { useEffect,useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";


type Item={
  id_item:string;
  name:string;
  category:string;
  image_url:string;
};


type Outfit={
  id_outfit:string;
  name:string;
  notes:string|null;
  is_public:boolean;
  items:Item[];
};



export default function OutfitDetailPage(){


  const params=useParams();

  const id=params.id as string;



  const [outfit,setOutfit]=useState<Outfit|null>(null);

  const [loading,setLoading]=useState(true);



  const [alert,setAlert]=useState<{
    message:string;
    type:"success"|"error"|"info";
  }|null>(null);







  useEffect(()=>{


    if(id){

      getOutfit();

    }


  },[id]);







  const getOutfit=async()=>{


    try{


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
              name,
              category,
              image_url

            )

          )

        `)

        .eq(
          "id_outfit",
          id
        )

        .single();





      if(error)
        throw error;






      if(!data){

        setAlert({

          message:"Outfit tidak ditemukan",

          type:"error"

        });

        return;

      }







      const formatted:Outfit={

        id_outfit:data.id_outfit,

        name:data.name,

        notes:data.notes,

        is_public:data.is_public,

        items:

        data.outfit_items?.map(

          (item:any)=>
          item.items

        ) || []

      };







      setOutfit(
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

        Loading outfit...

      </main>

    );

  }








  if(!outfit){


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
          text-center
          mt-20
        ">

          Outfit tidak ditemukan


        </div>


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
          items-start
          mb-8
        ">





          <div>


            <h1 className="
              text-4xl
              font-bold
            ">

              {outfit.name}


            </h1>





            <p className="
              text-gray-500
              mt-2
            ">

              {
                outfit.notes ||
                "No description"
              }


            </p>



          </div>







          {

            outfit.is_public

            ?


            <div className="
              badge
              badge-success
            ">

              Public 🌎

            </div>



            :


            <div className="
              badge
            ">

              Private 🔒

            </div>


          }



        </div>









        <div className="
          card
          bg-base-100
          shadow-xl
          mb-8
        ">


          <div className="card-body">



            <h2 className="
              card-title
            ">

              Outfit Preview ✨

            </h2>







            <div className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-5
              mt-5
            ">



              {

                outfit.items.map(item=>(


                  <div

                    key={
                      item.id_item
                    }

                    className="
                      relative
                      h-64
                      rounded-xl
                      overflow-hidden
                    "

                  >



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


                ))

              }



            </div>





          </div>



        </div>









        <h2 className="
          text-2xl
          font-bold
          mb-5
        ">

          Items Used

        </h2>








        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-5
        ">



          {

            outfit.items.map(item=>(


              <div

                key={
                  item.id_item
                }

                className="
                  card
                  bg-base-100
                  shadow
                "

              >



                <figure className="
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


                </figure>





                <div className="
                  card-body
                  p-4
                ">



                  <h3 className="
                    font-bold
                  ">

                    {item.name}

                  </h3>





                  <div className="
                    badge
                  ">

                    {item.category}

                  </div>



                </div>




              </div>


            ))

          }




        </div>









        <Link

          href="/outfit"

          className="
            btn
            mt-8
          "

        >

          Back to Outfit


        </Link>





      </div>




    </main>


  );


}