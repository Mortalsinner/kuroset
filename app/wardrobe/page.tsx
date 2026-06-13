"use client";

import {
  useEffect,
  useState
} from "react";

import Image from "next/image";

import Link from "next/link";

import {
  supabase
} from "@/lib/supabase";

import Alert from "@/components/Alert";



type Item={

  id_item:string;

  name:string;

  category:string;

  color:string|null;

  shop_url:string|null;

  image_url:string;

  notes:string|null;

};





export default function WardrobePage(){


  const [items,setItems]=useState<Item[]>([]);


  const [loading,setLoading]=useState(true);



  const [deleteItemData,setDeleteItemData]=useState<Item|null>(null);



  const [alert,setAlert]=useState<{

    message:string;

    type:"success"|"error"|"info";

  }|null>(null);








  useEffect(()=>{


    getItems();


  },[]);









  const getItems=async()=>{


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






      if(error)

        throw error;







      setItems(

        data || []

      );





    }catch(error:any){



      setAlert({

        message:error.message,

        type:"error"

      });



    }finally{


      setLoading(false);


    }


  };









  const deleteItem=async()=>{


    if(!deleteItemData)

      return;






    try{





      const {

        error:storageError

      }=await supabase.storage

        .from(
          "wardrobe-images"
        )

        .remove([

          deleteItemData.image_url

        ]);






      if(storageError)

        throw storageError;









      const {

        error

      }=await supabase

        .from("items")

        .delete()

        .eq(

          "id_item",

          deleteItemData.id_item

        );







      if(error)

        throw error;







      setItems(

        items.filter(

          item=>

          item.id_item !== deleteItemData.id_item

        )

      );







      setAlert({

        message:"Item berhasil dihapus",

        type:"success"

      });







    }catch(error:any){



      setAlert({

        message:error.message,

        type:"error"

      });



    }finally{


      setDeleteItemData(null);


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

        Loading wardrobe...

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

            message={
              alert.message
            }

            type={
              alert.type
            }

            onClose={()=>setAlert(null)}

          />


        )

      }







      <div className="
        max-w-7xl
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


            My Wardrobe 👕


          </h1>







          <Link

            href="/wardrobe/new"

            className="
              btn
              btn-primary
            "


          >


            Add Item


          </Link>







        </div>









        {

          items.length===0


          ?



          <div className="
            card
            bg-base-100
            shadow
          ">


            <div className="
              card-body
              text-center
            ">



              <h2 className="
                text-xl
                font-bold
              ">


                Wardrobe masih kosong


              </h2>






              <p>


                Tambahkan item pakaian pertama kamu


              </p>





            </div>



          </div>





          :





          <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            lg:grid-cols-4
            gap-6
          ">






            {


              items.map(item=>(




                <div

                  key={
                    item.id_item
                  }


                  className="
                    card
                    bg-base-100
                    shadow-xl
                    overflow-hidden
                  "


                >






                  <figure className="
                    relative
                    h-64
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








                  <div className="
                    card-body
                  ">




                    <h2 className="
                      card-title
                    ">


                      {item.name}


                    </h2>








                    <div className="
                      badge
                    ">


                      {item.category}


                    </div>









                    {

                      item.color && (


                        <p className="
                          text-sm
                        ">


                          🎨 {item.color}


                        </p>


                      )


                    }









                    {

                      item.shop_url && (



                        <a

                          href={
                            item.shop_url
                          }


                          target="_blank"


                          rel="noopener noreferrer"


                          className="
                            link
                            link-primary
                            text-sm
                          "


                        >


                          View Store


                        </a>



                      )


                    }









                    <div className="
                      card-actions
                      mt-4
                      justify-end
                    ">





                      <Link


                        href={

                          `/wardrobe/edit/${item.id_item}`

                        }


                        className="
                          btn
                          btn-sm
                          btn-outline
                        "


                      >


                        Edit


                      </Link>








                      <button


                        onClick={()=>setDeleteItemData(item)}


                        className="
                          btn
                          btn-sm
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



        }







      </div>









      {

        deleteItemData && (



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


                Delete Item?


              </h3>






              <p className="
                py-4
              ">


                Apakah kamu yakin ingin menghapus:


                <br/>


                <b>

                  {deleteItemData.name}

                </b>


                ?


              </p>








              <div className="
                modal-action
              ">



                <button


                  onClick={()=>setDeleteItemData(null)}


                  className="
                    btn
                  "


                >


                  Cancel


                </button>







                <button


                  onClick={deleteItem}


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