"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

export default function LoginPage(){

  const router=useRouter();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [alert,setAlert]=useState<{
    message:string;
    type:"success"|"error"|"info";
  }|null>(null);


  useEffect(()=>{

    const checkSession=async()=>{

      const {
        data:{
          session
        }

      }=await supabase.auth.getSession();



      if(session){

        router.push("/dashboard");

      }

    };


    checkSession();


  },[router]);





  const handleLogin=async()=>{


    const {
      error

    }=await supabase.auth.signInWithPassword({

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

      message:"Login berhasil!",

      type:"success"

    });



    setTimeout(()=>{

      router.push("/dashboard");

    },1000);



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
        w-full
        max-w-sm
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
            text-center
          ">

            Login

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

            onClick={handleLogin}

            className="
              btn
              btn-primary
              w-full
              mt-5
            "

          >

            Login

          </button>




        </div>


      </div>


    </div>

  );


}