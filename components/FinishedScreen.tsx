import { RoomInfo } from "../types/game";

export default function FinishedScreen({ room, onRestart }: { room: RoomInfo, onRestart: () => void }) {
  const players = Object.entries(room.players).sort(([, a], [, b]) => (b.score || 0) - (a.score || 0));
  
  return (
    <div className="flex flex-col gap-8 bg-[#FEC8D8] p-10 rounded-[2rem] w-full max-w-sm shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
      <h2 className="text-5xl font-black text-center uppercase tracking-wide">RESULTS</h2>
      
      <div className="flex flex-col gap-4">
        {players.map(([p, data], i) => (
          <div key={p} className="flex justify-between items-center bg-white p-5 rounded-2xl font-black text-2xl shadow-[5px_5px_0px_0px_rgba(109,40,217)] hover:-translate-y-1 transition-transform">
            <span className="flex items-center gap-3">
              {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐"} 
              <span className="truncate max-w-[120px]">{p}</span>
            </span>
            <span className="text-[#FF9AA2]">{data.score !== null ? data.score.toFixed(2) + "m" : "0.00m"}</span>
          </div>
        ))}
      </div>
      
      <button onClick={onRestart} 
              className="mt-6 bg-[#D291BC] text-white p-5 rounded-2xl text-2xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-[0px_0px_0px_0px_rgba(109,40,217)] shadow-[5px_5px_0px_0px_rgba(109,40,217)]">
        PLAY AGAIN
      </button>
    </div>
  );
}