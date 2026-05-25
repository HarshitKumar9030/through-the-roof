import { RoomInfo } from "../types/game";

export default function LobbyScreen({ roomCode, room, playerName, onStart }: { roomCode: string, room: RoomInfo, playerName: string, onStart: () => void }) {
  const players = Object.keys(room.players);
  
  return (
    <div className="flex flex-col gap-6 bg-[#E0BBE4] p-10 rounded-[2rem] w-full max-w-sm shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9] z-10">
      <div className="text-center">
        <h2 className="text-lg font-bold opacity-70 tracking-widest uppercase">Room Code</h2>
        <p className="text-6xl font-black tracking-widest mt-1">{roomCode}</p>
      </div>
      
      <div className="bg-[#957DAD] p-4 rounded-2xl shadow-[5px_5px_0px_0px_rgba(109,40,217)]">
         <h3 className="text-2xl font-bold text-white text-center">Players ({players.length}/8)</h3>
      </div>
      
      <ul className="flex flex-col gap-3">
        {players.map((p) => (
          <li key={p} className="bg-white p-4 rounded-2xl font-bold text-xl flex justify-between items-center shadow-[5px_5px_0px_0px_rgba(109,40,217)]">
            <span className="truncate">{p}</span>
            <span>{p === playerName ? "⭐" : "🕹️"}</span>
          </li>
        ))}
      </ul>
      
      <button onClick={onStart} 
              className="mt-4 bg-[#FFDFD3] p-5 rounded-2xl text-3xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-none shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
        START GAME
      </button>
    </div>
  );
}
