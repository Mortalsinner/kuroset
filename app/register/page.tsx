"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";


export default function RegisterPage(){


  const router=useRouter();



  const [email,setEmail]=useState("");

  const [password,setPassword]=useState("");



  const [alert,setAlert]=useState<{
    message:string;
    type:"success"|"error"|"info";
  }|null>(null);







  const handleRegister=async()=>{


    const {
      error

    }=await supabase.auth.signUp({


      email,

      password


    });







    if(error){



      setAlert({


        message:error.message,


        type:"error"



      });



      return;



    }








    setAlert({


      message:"Registrasi berhasil! Silahkan login.",


      type:"success"



    });







    setTimeout(()=>{


      router.push("/login");



    },1500);





  };









  return(



    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-base-200
      p-5
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
        card
        bg-base-100
        shadow-xl
        w-full
        max-w-sm
      ">



        <div className="
          card-body
        ">





          <h1 className="
            text-3xl
            font-bold
            text-center
          ">


            Register


          </h1>








          <input


            type="email"


            placeholder="Email"


            className="
              input
              input-bordered
              w-full
              mt-5
            "



            value={email}



            onChange={(e)=>

              setEmail(
                e.target.value
              )

            }



          />








          <input


            type="password"


            placeholder="Password"



            className="
              input
              input-bordered
              w-full
              mt-3
            "



            value={password}



            onChange={(e)=>

              setPassword(
                e.target.value
              )

            }



          />









          <button



            onClick={handleRegister}



            className="
              btn
              btn-primary
              w-full
              mt-5
            "



          >



            Register



          </button>







        </div>






      </div>







    </div>



  );



}