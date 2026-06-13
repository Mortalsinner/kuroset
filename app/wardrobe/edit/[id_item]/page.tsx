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

import Alert from "@/components/Alert";



export default function EditItemPage(){


  const router=useRouter();

  const params=useParams();


  const id_item=params.id_item as string;



  const [loading,setLoading]=useState(true);

  const [saving,setSaving]=useState(false);



  const [name,setName]=useState("");

  const [category,setCategory]=useState("");

  const [color,setColor]=useState("");

  const [shopUrl,setShopUrl]=useState("");

  const [notes,setNotes]=useState("");



  const [oldImage,setOldImage]=useState("");

  const [imageFile,setImageFile]=useState<File|null>(null);

  const [preview,setPreview]=useState("");




  const [alert,setAlert]=useState<{

    message:string;

    type:"success"|"error"|"info";

  }|null>(null);








  useEffect(()=>{


    if(id_item){

      fetchItem();

    }


  },[id_item]);









  const fetchItem=async()=>{


    try{



      const {
        data,
        error

      }=await supabase

        .from("items")

        .select("*")

        .eq(
          "id_item",
          id_item
        )

        .single();






      if(error)
        throw error;






      setName(
        data.name
      );


      setCategory(
        data.category
      );


      setColor(
        data.color || ""
      );


      setShopUrl(
        data.shop_url || ""
      );


      setNotes(
        data.notes || ""
      );




      setOldImage(
        data.image_url
      );







      const imageUrl=

      supabase.storage

        .from(
          "wardrobe-images"
        )

        .getPublicUrl(
          data.image_url
        )

        .data.publicUrl;






      setPreview(
        imageUrl
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









  const handleImageChange=(

    e:React.ChangeEvent<HTMLInputElement>

  )=>{


    const file=e.target.files?.[0];



    if(!file)
      return;





    setImageFile(
      file
    );



    setPreview(

      URL.createObjectURL(
        file
      )

    );



  };









  const handleUpdate=async(

    e:React.FormEvent

  )=>{


    e.preventDefault();





    try{



      setSaving(true);




      let imageUrl=oldImage;







      if(imageFile){



        const {

          data:{
            user
          }

        }=await supabase.auth.getUser();





        if(!user)

          throw new Error(
            "User tidak ditemukan"
          );







        const ext=

        imageFile.name

        .split(".")

        .pop();





        const fileName=

        `${user.id}/${Date.now()}.${ext}`;







        const {

          error:uploadError

        }=await supabase.storage

          .from(
            "wardrobe-images"
          )

          .upload(

            fileName,

            imageFile

          );






        if(uploadError)

          throw uploadError;







        if(oldImage){


          await supabase.storage

            .from(
              "wardrobe-images"
            )

            .remove([

              oldImage

            ]);

        }







        imageUrl=fileName;



      }










      const {

        error

      }=await supabase

        .from("items")

        .update({


          name,

          category,

          color,

          shop_url:shopUrl,

          notes,

          image_url:imageUrl


        })

        .eq(

          "id_item",

          id_item

        );








      if(error)

        throw error;







      setAlert({

        message:"Item berhasil diperbarui",

        type:"success"

      });








      setTimeout(()=>{


        router.push(
          "/wardrobe"
        );


      },1000);








    }catch(error:any){



      setAlert({

        message:error.message,

        type:"error"

      });



    }finally{


      setSaving(false);


    }


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
        max-w-xl
        mx-auto
      ">



        <div className="
          card
          bg-base-100
          shadow-xl
        ">



          <div className="
            card-body
          ">





            <h1 className="
              text-3xl
              font-bold
            ">


              Edit Item


            </h1>









            <div className="
              relative
              h-72
              mt-5
            ">


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
                file-input
                file-input-bordered
                w-full
                mt-5
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
                input
                input-bordered
                w-full
              "


            />










            <select


              value={category}


              onChange={(e)=>

                setCategory(
                  e.target.value
                )

              }


              className="
                select
                select-bordered
                w-full
              "


            >


              <option>
                Atasan
              </option>


              <option>
                Bawahan
              </option>


              <option>
                Outer
              </option>


              <option>
                Alas Kaki
              </option>


              <option>
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
                input
                input-bordered
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
                input
                input-bordered
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
                textarea
                textarea-bordered
                w-full
              "


            />









            <button


              disabled={saving}


              onClick={handleUpdate}


              className="
                btn
                btn-primary
                w-full
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






          </div>




        </div>




      </div>




    </main>



  );


}