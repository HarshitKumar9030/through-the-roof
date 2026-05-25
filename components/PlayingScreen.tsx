import { useState, useEffect, useRef } from "react";

export default function PlayingScreen({ onScore }: { onScore: (score: number) => void }) {
  const [throwHeight, setThrowHeight] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const isMeasuring = permissionGranted && throwHeight === null;
   
  const freefallStartRef = useRef<number>(0);
  const freefallEndRef = useRef<number>(0);
  const hasSentScoreRef = useRef<boolean>(false);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      try {
        const state = await (DeviceMotionEvent as any).requestPermission();
        setPermissionGranted(state === "granted");
      } catch (e) {
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

  return (
    <div className="flex flex-col items-center justify-center gap-10 bg-[#C7CEEA] p-12 rounded-[2rem] w-full max-w-sm text-center shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
      <h2 className="text-5xl font-black uppercase tracking-wider">TOSS IT!</h2>
      
      {!permissionGranted && (
        <button onClick={requestPermission} 
                className="bg-[#FFDFD3] p-5 rounded-2xl text-2xl font-black transition-all active:translate-y-[5px] active:translate-x-[5px] active:shadow-[0px_0px_0px_0px_rgba(109,40,217)] shadow-[5px_5px_0px_0px_rgba(109,40,217)] text-[#6D28D9]">
          GRANT SENSORS
        </button>
      )}

      {permissionGranted && throwHeight === null && (
        <div className="animate-bounce mt-6">
          <p className="text-3xl font-bold bg-white p-4 rounded-xl shadow-[5px_5px_0px_0px_rgba(109,40,217)]">Ready to throw!</p>
          <p className="text-xl opacity-70 mt-6">(Don't smash the ceiling)</p>
        </div>
      )}

      {throwHeight !== null && (
        <div className="flex flex-col items-center mt-6">
          <p className="text-3xl font-bold mb-6">Nice Height!</p>
          <div className="bg-white p-8 rounded-[2rem] shadow-[5px_5px_0px_0px_rgba(109,40,217)] mb-8 transform -rotate-2">
            <p className="text-6xl font-black">{throwHeight.toFixed(2)}m</p>
          </div>
          <p className="text-xl font-bold animate-pulse text-[#6D28D9]">Waiting for others...</p>
        </div>
      )}
    </div>
  );
}
