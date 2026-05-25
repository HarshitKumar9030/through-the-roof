import { useState } from "react";
import Image from "next/image";

export default function LandingScreen({ onJoin, error }: { onJoin: (code: string, name: string) => void, error: string }) {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  
  return (
    <>
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <Image 
          src="/hero.png" 
          alt="Background Pattern" 
          fill 
          className="object-cover md:object-contain object-center animate-[pulse_10s_ease-in-out_infinite]"
        />
      </div>

      <div className="flex flex-col items-center w-full max-w-md z-10 relative">
        <form onSubmit={(e) => { e.preventDefault(); onJoin(roomCode, playerName); }} 
              className="flex flex-col gap-6 bg-[#FFE5EC]/90 backdrop-blur-sm p-10 rounded-[2rem] w-full shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-2 tracking-tighter leading-tight drop-shadow-sm">THROUGH<br/>THE ROOF</h1>
            <p className="text-lg font-bold opacity-80 uppercase tracking-widest text-[#D92851]">Throw your phone.</p>
          </div>
          
          <div className="flex flex-col gap-4 mt-2">
            <input type="text" placeholder="ROOM CODE" maxLength={6} 
                   className="p-5 rounded-2xl text-2xl bg-white outline-none text-[#6D28D9] font-black placeholder-[#6D28D9]/30 text-center uppercase shadow-[5px_5px_0px_0px_rgba(109,40,217)] focus:translate-y-[5px] focus:translate-x-[5px] focus:shadow-none transition-all" 
                   value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
                   
            <input type="text" placeholder="YOUR NAME" maxLength={12} 
                   className="p-5 rounded-2xl text-2xl bg-white outline-none text-[#6D28D9] font-black placeholder-[#6D28D9]/30 text-center uppercase shadow-[5px_5px_0px_0px_rgba(109,40,217)] focus:translate-y-[5px] focus:translate-x-[5px] focus:shadow-none transition-all" 
                   value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </div>
                 
          {error && (
            <div className="bg-[#D92851] text-white p-3 rounded-xl shadow-[5px_5px_0px_0px_rgba(109,40,217)]">
              <p className="font-bold text-center uppercase tracking-wide">{error}</p>
            </div>
          )}
          
          <button type="submit" 
                  className="mt-6 bg-[#B5EAD7] p-5 rounded-2xl text-3xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-none shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9] hover:bg-[#a0f0d2]">
            PLAY NOW
          </button>
        </form>
      </div>
    </>
  );
}
