import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto mt-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand / Logo Section */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black tracking-tighter uppercase">
            KURO<span className="text-[#F652A0]">SETTE</span> ✨
          </h2>
          <p className="font-bold text-sm mt-1 text-gray-700">
            Organize your wardrobe, create your look.
          </p>
        </div>
        
      
       

        {/* Copyright Badge */}
        <div className="text-xs md:text-sm font-black bg-[#D5E04D] border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-center">
          © {new Date().getFullYear()} KUROSETTE. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}