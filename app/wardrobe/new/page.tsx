"use client";

import {
  useState
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  supabase
} from "@/lib/supabase";

import Alert from "@/components/Alert";



export default function AddItemPage(){


  const router=useRouter();




  const [name,setName]=useState("");

  const [category,setCategory]=useState("");

  const [color,setColor]=useState("");

  const [shopUrl,setShopUrl]=useState("");

  const [notes,setNotes]=useState("");

  const [image,setImage]=useState<File|null>(null);



  const [loading,setLoading]=useState(false);



  const [alert,setAlert]=useState<{

    message:string;

    type:"success"|"error"|"info";

  }|null>(null);









  const handleSubmit=async(

    e:React.FormEvent

  )=>{


    e.preventDefault();




    try{


      setLoading(true);







      const {

        data:{
          user
        }

      }=await supabase.auth.getUser();






      if(!user){



        setAlert({

          message:"User belum login",

          type:"error"

        });



        return;

      }







      if(!image){



        setAlert({

          message:"Silahkan pilih foto item terlebih dahulu",

          type:"error"

        });



        return;

      }








      const fileExt=

      image.name

      .split(".")

      .pop();








      const fileName=

      `${user.id}/${Date.now()}.${fileExt}`;








      const {

        error:uploadError

      }=await supabase.storage

        .from(
          "wardrobe-images"
        )

        .upload(

          fileName,

          image

        );








      if(uploadError)

        throw uploadError;









      const {

        error:insertError

      }=await supabase

        .from("items")

        .insert({


          id_user:user.id,


          name,


          category,


          color,


          shop_url:shopUrl,


          image_url:fileName,


          notes


        });








      if(insertError)

        throw insertError;








      setAlert({

        message:"Item berhasil ditambahkan",

        type:"success"

      });








      setTimeout(()=>{


        router.push(
          "/wardrobe"
        );


      },1000);








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


              Add Item 👕


            </h1>









            <form

              onSubmit={handleSubmit}

              className="
                space-y-4
                mt-5
              "

            >








              <input


                type="text"


                placeholder="Nama Item"


                value={name}


                onChange={(e)=>

                  setName(
                    e.target.value
                  )

                }


                className="
                  input
                  input-bordered
                  w-full
                "


                required


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


                required


              >



                <option value="">

                  Pilih Kategori

                </option>



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


                type="text"


                placeholder="Warna"


                value={color}


                onChange={(e)=>

                  setColor(
                    e.target.value
                  )

                }


                className="
                  input
                  input-bordered
                  w-full
                "


              />









              <input


                type="url"


                placeholder="Link Store"


                value={shopUrl}


                onChange={(e)=>

                  setShopUrl(
                    e.target.value
                  )

                }


                className="
                  input
                  input-bordered
                  w-full
                "


              />









              <textarea


                placeholder="Catatan"


                value={notes}


                onChange={(e)=>

                  setNotes(
                    e.target.value
                  )

                }


                className="
                  textarea
                  textarea-bordered
                  w-full
                "


                rows={4}


              />









              <input


                type="file"


                accept="image/*"


                onChange={(e)=>


                  setImage(

                    e.target.files?.[0] || null

                  )


                }


                className="
                  file-input
                  file-input-bordered
                  w-full
                "


              />









              <button


                type="submit"


                disabled={loading}


                className="
                  btn
                  btn-primary
                  w-full
                "


              >



                {

                  loading

                  ?

                  "Uploading..."

                  :

                  "Save Item"


                }



              </button>








            </form>






          </div>




        </div>




      </div>





    </main>



  );


}