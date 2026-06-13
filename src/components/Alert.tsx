"use client";

type Props={
  message:string;
  type:"success"|"error"|"info";
  onClose:()=>void;
};


export default function Alert({
  message,
  type,
  onClose
}:Props){

  return(

    <div className={`
      alert
      ${
        type==="success"
        ?
        "alert-success"
        :
        type==="error"
        ?
        "alert-error"
        :
        "alert-info"
      }
      fixed
      top-5
      right-5
      w-auto
      z-50
      shadow-lg
    `}>

      <span>
        {message}
      </span>

      <button
        onClick={onClose}
        className="btn btn-sm btn-ghost"
      >
        ✕
      </button>

    </div>

  );

}