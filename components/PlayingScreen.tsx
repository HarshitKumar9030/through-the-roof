import { useState, useEffect, useRef } from "react";
import { RoomInfo } from "../types/game";

type DeviceMotionPermissionState = "granted" | "denied";
type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<DeviceMotionPermissionState>;
};

export default function PlayingScreen({ onScore, room, onForceFinish }: { onScore: (score: number) => void, room: RoomInfo, onForceFinish: () => void }) {
  const [throwHeight, setThrowHeight] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const isMeasuring = permissionGranted && throwHeight === null;
   
  const freefallStartRef = useRef<number>(0);
  const freefallEndRef = useRef<number>(0);
  const hasSentScoreRef = useRef<boolean>(false);

  const requestPermission = async () => {
    const deviceMotion = DeviceMotionEvent as DeviceMotionEventWithPermission;

    if (typeof deviceMotion.requestPermission === "function") {
      try {
        const state = await deviceMotion.requestPermission();
        setPermissionGranted(state === "granted");
      } catch {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!isMeasuring) return;
    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      if (x === null || y === null || z === null) return;
      
      const accel = Math.sqrt(x * x + y * y + z * z);
      
      if (accel < 3.0 && freefallStartRef.current === 0) {
        freefallStartRef.current = Date.now();
      } else if (accel > 8.0 && freefallStartRef.current > 0) {
        freefallEndRef.current = Date.now();
        const fallTime = freefallEndRef.current - freefallStartRef.current;
        
        if (fallTime > 150) {
          const height = (0.5 * 9.81 * Math.pow((fallTime / 1000) / 2, 2));
          if (!hasSentScoreRef.current) {
            setThrowHeight(height);
            onScore(height);
            hasSentScoreRef.current = true;
          }
        } else {
          freefallStartRef.current = 0;
        }
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isMeasuring, onScore]);

  const players = Object.entries(room.players);
  const thrownCount = players.filter(([, player]) => player.score !== null).length;

  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-[#C7CEEA] p-10 rounded-[2rem] w-full max-w-sm text-center shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9] z-10">
      <h2 className="text-6xl font-black uppercase tracking-widest drop-shadow-sm">TOSS IT!</h2>
      
      {!permissionGranted && (
        <button onClick={requestPermission} 
                className="bg-[#FFDFD3] p-5 w-full rounded-2xl text-2xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-none shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
          GRANT SENSORS
        </button>
      )}

      {permissionGranted && throwHeight === null && (
        <div className="animate-bounce mt-4 w-full">
          <p className="text-3xl font-bold bg-white p-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(109,40,217)]">Ready to throw!</p>
          <p className="text-xl font-bold opacity-70 mt-6">(Catch it carefully)</p>
        </div>
      )}

      {throwHeight !== null && (
        <div className="flex flex-col items-center w-full">
          <div className="bg-white p-6 rounded-[2rem] shadow-[5px_5px_0px_0px_rgba(109,40,217)] w-full mb-6 transform -rotate-1">
             <p className="text-2xl font-black mb-2 opacity-50">SCORE</p>
             <p className="text-6xl font-black">{throwHeight.toFixed(2)}m</p>
          </div>
        </div>
      )}
      
      <div className="bg-white/50 w-full p-6 rounded-[2rem] flex flex-col gap-4 mt-2">
        <h3 className="text-xl font-bold uppercase tracking-wider">Waiting ({thrownCount}/{players.length})</h3>
        <ul className="flex flex-col gap-2 max-h-32 overflow-y-auto">
          {players.map(([name, p]) => (
            <li key={name} className="flex justify-between items-center text-lg font-bold bg-white p-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(109,40,217)]">
              <span className="truncate">{name}</span>
              <span>{p.score !== null ? '✅' : '⏳'}</span>
            </li>
          ))}
        </ul>
        <button onClick={onForceFinish} className="mt-2 text-sm font-bold opacity-60 hover:opacity-100 uppercase underline transition-opacity">
          Force End Round
        </button>
      </div>
    </div>
  );
}
