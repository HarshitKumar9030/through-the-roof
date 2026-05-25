import { RoomInfo } from "../types/game";

export default function LobbyScreen({ roomCode, room, playerName, onStart }: { roomCode: string, room: RoomInfo, playerName: string, onStart: () => void }) {
  const players = Object.keys(room.players);
  
  return (
    <div className="flex flex-col gap-6 bg-[#E0BBE4] p-10 rounded-[2rem] w-full max-w-sm shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
      <h2 className="text-4xl font-black text-center mb-2">ROOM<br/>{roomCode}</h2>
      
      <div className="bg-[#957DAD] p-4 rounded-2xl shadow-[5px_5px_0px_0px_rgba(109,40,217)] mb-4">
         <h3 className="text-2xl font-bold text-white text-center">Players ({players.length}/8)</h3>
      </div>
      
      <ul className="flex flex-col gap-4">
        {players.map((p) => (
          <li key={p} className="bg-white p-4 rounded-xl font-bold text-xl flex justify-center shadow-[5px_5px_0px_0px_rgba(109,40,217)] hover:-translate-y-1 transition-transform">
            {p} {p === playerName && " 🌻"}
          </li>
        ))}
      </ul>
      
      <button onClick={onStart} 
              className="mt-6 bg-[#FFDFD3] p-5 rounded-2xl text-3xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-[0px_0px_0px_0px_rgba(109,40,217)] shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
        START
      </button>
    </div>
  );
}
