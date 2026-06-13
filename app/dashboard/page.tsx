"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";


type Item = {
  id_item: string;
  name: string;
  category: string;
  image_url: string;
};



export default function DashboardPage() {

  const [username, setUsername] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    getDashboardData();

  }, []);





  const getDashboardData = async () => {

    try {


      const {
        data:{
          user
        }
      } = await supabase.auth.getUser();



      if(!user) return;



      const {
        data:profile
      } = await supabase
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
        )
        .limit(4);



      setItems(
        itemData || []
      );



    } catch(error){

      console.error(error);

    } finally {

      setLoading(false);

    }

  };






  const getImageUrl = (
    path:string
  ) => {


    return supabase.storage

      .from(
        "wardrobe-images"
      )

      .getPublicUrl(path)

      .data.publicUrl;


  };







  if(loading){

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
        max-w-6xl
        mx-auto
      ">



        {/* Welcome */}

        <section className="
          bg-black
          text-white
          rounded-3xl
          p-8
          mb-8
        ">


          <h1 className="
            text-3xl
            font-bold
          ">

            Welcome back, {username} 👋

          </h1>


          <p className="
            text-gray-300
            mt-3
          ">

            Organize your wardrobe and create your style.

          </p>


        </section>








        {/* Navigation */}

        <section className="
          grid
          md:grid-cols-3
          gap-5
          mb-10
        ">



          <Link

            href="/wardrobe"

            className="
              bg-white
              p-6
              rounded-2xl
              shadow-sm
              hover:shadow-md
              transition
            "

          >


            <h2 className="
              text-xl
              font-bold
            ">

              👕 My Wardrobe

            </h2>


            <p className="
              text-gray-500
              mt-2
            ">

              Manage your clothing items

            </p>


          </Link>







          <Link

            href="/outfit/new"

            className="
              bg-white
              p-6
              rounded-2xl
              shadow-sm
              hover:shadow-md
              transition
            "

          >


            <h2 className="
              text-xl
              font-bold
            ">

              ✨ Create Outfit

            </h2>


            <p className="
              text-gray-500
              mt-2
            ">

              Mix and match your clothes

            </p>


          </Link>







          <Link

            href="/outfit"

            className="
              bg-white
              p-6
              rounded-2xl
              shadow-sm
              hover:shadow-md
              transition
            "

          >


            <h2 className="
              text-xl
              font-bold
            ">

              🌎 Explore Outfit

            </h2>


            <p className="
              text-gray-500
              mt-2
            ">

              Discover other styles

            </p>


          </Link>



        </section>









        {/* Recent Wardrobe */}


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

              Recent Items

            </h2>



            <Link

              href="/wardrobe"

              className="
                text-sm
                text-gray-500
              "

            >

              View All

            </Link>


          </div>








          <div className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-5
          ">


            {
              items.map(item=>(


                <div

                  key={item.id_item}

                  className="
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    shadow-sm
                  "

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





                  <div className="p-4">


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


                </div>


              ))
            }


          </div>



        </section>




      </div>


    </main>

  );

}