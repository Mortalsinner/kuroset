"use client";

import { useEffect,useState } from "react";

type AlertType="success"|"error"|"warning"|"info";

type AlertProps={
  message:string;
  type?:AlertType;
  duration?:number;
  onClose:()=>void;
};


export default function Alert({
  message,
  type="info",
  duration=3000,
  onClose
}:AlertProps){


  useEffect(()=>{

    const timer=setTimeout(()=>{

      onClose();

    },duration);


    return()=>clearTimeout(timer);


  },[]);



  return(

    <div className="
      fixed
      top-5
      right-5
      z-50
      w-96
    ">


      <div className={`
        alert
        shadow-lg
        ${
          type==="success"
          &&
          "alert-success"
        }

        ${
          type==="error"
          &&
          "alert-error"
        }

        ${
          type==="warning"
          &&
          "alert-warning"
        }

        ${
          type==="info"
          &&
          "alert-info"
        }

      `}>


        <span>

          {message}

        </span>



        <button

          onClick={onClose}

          className="
            btn
            btn-sm
            btn-ghost
          "

        >

          ✕

        </button>



      </div>


    </div>


  );

}