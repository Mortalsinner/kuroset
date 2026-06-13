"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";


type Item={
  id_item:string;
  name:string;
  category:string;
  image_url:string;
};



export default function DashboardPage(){

  const router=useRouter();

  const [username,setUsername]=useState("User");
  const [items,setItems]=useState<Item[]>([]);
  const [outfitCount,setOutfitCount]=useState(0);

  const [loading,setLoading]=useState(true);


  const [alert,setAlert]=useState<{
    message:string;
    type:"success"|"error"|"info";
  }|null>(null);




  useEffect(()=>{

    loadDashboard();

  },[]);





  const loadDashboard=async()=>{

    try{


      const {
        data:{
          user
        }

      }=await supabase.auth.getUser();



      if(!user){

        router.push("/login");

        return;

      }





      const {
        data:profile

      }=await supabase

        .from("profiles")

        .select("username")

        .eq(
          "id_user",
          user.id
        )

        .single();




      setUsername(
        profile?.username || "User"
      );






      const {
        data:itemData

      }=await supabase

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
        )

        .limit(6);





      setItems(
        itemData || []
      );






      const {
        count

      }=await supabase

        .from("outfits")

        .select(
          "*",
          {
            count:"exact",
            head:true
          }
        )

        .eq(
          "id_user",
          user.id
        );





      setOutfitCount(
        count || 0
      );




    }catch(error){

      console.error(error);


      setAlert({

        message:"Gagal memuat dashboard",

        type:"error"

      });


    }finally{

      setLoading(false);

    }


  };






  const handleLogout=async()=>{


    const {
      error

    }=await supabase.auth.signOut();




    if(error){

      setAlert({

        message:error.message,

        type:"error"

      });


      return;

    }




    setAlert({

      message:"Logout berhasil",

      type:"success"

    });





    setTimeout(()=>{

      router.push("/login");

    },1000);



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

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
      ">

        Loading...

      </div>

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
        max-w-7xl
        mx-auto
      ">





        <section className="
          hero
          rounded-3xl
          bg-gradient-to-r
          from-neutral
          to-neutral-focus
          text-white
          mb-8
        ">


          <div className="
            hero-content
            w-full
            justify-between
            flex-col
            md:flex-row
            py-10
          ">



            <div>


              <div className="
                badge
                badge-outline
                mb-4
              ">

                Fashion Studio

              </div>




              <h1 className="
                text-4xl
                font-bold
              ">

                Welcome back,

                <br />

                {username} ✨

              </h1>



              <p className="
                mt-3
                text-gray-300
              ">

                Create your style,
                organize your wardrobe,
                and discover new looks.

              </p>


            </div>





            <div className="
              flex
              gap-3
            ">



              <Link

                href="/outfit/new"

                className="
                  btn
                  btn-primary
                "

              >

                Create Outfit

              </Link>





              <button

                onClick={handleLogout}

                className="
                  btn
                  btn-error
                "

              >

                Logout

              </button>



            </div>



          </div>


        </section>








        <section className="
          grid
          md:grid-cols-2
          gap-5
          mb-8
        ">



          <div className="
            card
            bg-base-100
            shadow
          ">


            <div className="card-body">


              <div className="stat">

                <div className="stat-title">

                  Wardrobe Items

                </div>


                <div className="stat-value">

                  {items.length}

                </div>


                <div className="stat-desc">

                  Clothes collected

                </div>


              </div>


            </div>


          </div>







          <div className="
            card
            bg-base-100
            shadow
          ">


            <div className="card-body">


              <div className="stat">


                <div className="stat-title">

                  Created Outfits

                </div>


                <div className="stat-value">

                  {outfitCount}

                </div>


                <div className="stat-desc">

                  Your fashion combinations

                </div>


              </div>


            </div>


          </div>



        </section>








        <section className="
          grid
          md:grid-cols-3
          gap-5
          mb-10
        ">


          <Link

            href="/wardrobe"

            className="
              card
              bg-base-100
              shadow
              hover:scale-[1.02]
              transition
            "

          >

            <div className="card-body">

              <h2 className="card-title">

                👕 Wardrobe

              </h2>


              <p>

                Manage your clothing items

              </p>


            </div>


          </Link>





          <Link

            href="/outfit"

            className="
              card
              bg-base-100
              shadow
              hover:scale-[1.02]
              transition
            "

          >

            <div className="card-body">

              <h2 className="card-title">

                ✨ Mix & Match

              </h2>


              <p>

                Create your outfit style

              </p>


            </div>


          </Link>





          <Link

            href="/outfit"

            className="
              card
              bg-base-100
              shadow
              hover:scale-[1.02]
              transition
            "

          >

            <div className="card-body">


              <h2 className="card-title">

                🌎 Explore

              </h2>


              <p>

                Discover other outfits

              </p>


            </div>


          </Link>


        </section>








        <section>


          <div className="
            flex
            justify-between
            mb-5
          ">


            <h2 className="
              text-2xl
              font-bold
            ">

              Latest Wardrobe

            </h2>




            <Link

              href="/wardrobe"

              className="
                btn
                btn-sm
              "

            >

              View All

            </Link>


          </div>





          <div className="
            grid
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-6
            gap-5
          ">


            {
              items.map(item=>(


                <div

                  key={item.id_item}

                  className="
                    card
                    bg-base-100
                    shadow
                    overflow-hidden
                  "

                >


                  <figure className="
                    relative
                    h-40
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


                  </figure>



                  <div className="card-body p-4">


                    <h3 className="
                      font-bold
                      truncate
                    ">

                      {item.name}

                    </h3>


                    <div className="badge">

                      {item.category}

                    </div>


                  </div>


                </div>


              ))
            }



          </div>


        </section>




      </div>


    </main>


  );

}