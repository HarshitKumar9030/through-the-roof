"use client";

import { useState, useEffect } from "react";
import { GameState, RoomInfo } from "../types/game";
import LandingScreen from "../components/LandingScreen";
import LobbyScreen from "../components/LobbyScreen";
import PlayingScreen from "../components/PlayingScreen";
import FinishedScreen from "../components/FinishedScreen";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("landing");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [error, setError] = useState("");

  const fetchRoom = async () => {
    if (!roomCode) return;
    try {
      const res = await fetch(`/api/room?roomCode=${roomCode}`);
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        if (data.room.status && data.room.status !== gameState) {
           setGameState(data.room.status);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState !== "landing") interval = setInterval(fetchRoom, 1000);
    return () => clearInterval(interval);
  }, [gameState, roomCode]);

  const handleJoin = async (code: string, name: string) => {
    if (!name || !code) { setError("Name and code required"); return; }
    setError("");
    try {
      const res = await fetch("/api/room", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", roomCode: code, playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRoomCode(code);
      setPlayerName(name);
      setRoom(data.room);
      setGameState("lobby");
    } catch { setError("Failed to join"); }
  };

  const handleStart = async () => {
    await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", roomCode, playerName }),
    });
  };

  const handleScore = async (score: number) => {
    await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "score", roomCode, playerName, score }),
    });
  };

  const handleRestart = async () => {
    await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", roomCode, playerName }),
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-6 bg-[#FCF8F3] text-[#6D28D9] overflow-hidden">
      {gameState === "landing" && <LandingScreen onJoin={handleJoin} error={error} />}
      {gameState === "lobby" && room && <LobbyScreen roomCode={roomCode} room={room} playerName={playerName} onStart={handleStart} />}
      {gameState === "playing" && <PlayingScreen onScore={handleScore} />}
      {gameState === "finished" && room && <FinishedScreen room={room} onRestart={handleRestart} />}
    </div>
  );
}
