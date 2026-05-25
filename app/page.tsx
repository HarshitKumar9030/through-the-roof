"use client";

import { useCallback, useEffect, useState } from "react";
import { GameState, RoomInfo } from "../types/game";
import LandingScreen from "../components/LandingScreen";
import LobbyScreen from "../components/LobbyScreen";
import PlayingScreen from "../components/PlayingScreen";
import FinishedScreen from "../components/FinishedScreen";

function roomsAreEqual(a: RoomInfo | null, b: RoomInfo | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.status !== b.status) return false;

  const playerNamesA = Object.keys(a.players);
  const playerNamesB = Object.keys(b.players);
  if (playerNamesA.length !== playerNamesB.length) return false;

  for (const playerName of playerNamesA) {
    const playerA = a.players[playerName];
    const playerB = b.players[playerName];
    if (!playerB) return false;
    if (playerA.score !== playerB.score || playerA.ready !== playerB.ready) {
      return false;
    }
  }

  return true;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("landing");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [error, setError] = useState("");

  const fetchRoom = useCallback(async () => {
    if (!roomCode) return;
    try {
      const res = await fetch(`/api/room?roomCode=${roomCode}`);
      if (res.ok) {
        const data = await res.json();
        setRoom((previousRoom) => (roomsAreEqual(previousRoom, data.room) ? previousRoom : data.room));
        if (data.room.status) {
          setGameState((previousState) => (previousState === data.room.status ? previousState : data.room.status));
        }
      }
    } catch {}
  }, [roomCode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (gameState !== "landing") {
      interval = setInterval(fetchRoom, 1000);
    }
    return () => clearInterval(interval);
  }, [fetchRoom, gameState]);

  const handleJoin = async (code: string, name: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    if (!normalizedName || !normalizedCode) {
      setError("Name and code required");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/room", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", roomCode: normalizedCode, playerName: normalizedName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRoomCode(normalizedCode);
      setPlayerName(normalizedName);
      setRoom(data.room);
      setGameState("lobby");
    } catch {
      setError("Failed to join");
    }
  };

  const handleStart = async () => {
    const res = await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", roomCode, playerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to start game");
      return;
    }
    setError("");
    setRoom(data.room);
    if (data.room.status) {
      setGameState(data.room.status);
    }
  };

  const handleScore = async (score: number) => {
    const res = await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "score", roomCode, playerName, score }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to submit score");
      return;
    }
    setError("");
    setRoom(data.room);
    if (data.room.status) {
      setGameState(data.room.status);
    }
  };

  const handleRestart = async () => {
    const res = await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", roomCode, playerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to restart game");
      return;
    }
    setError("");
    setRoom(data.room);
    if (data.room.status) {
      setGameState(data.room.status);
    }
  };

  const handleForceFinish = async () => {
    const res = await fetch("/api/room", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "finish", roomCode, playerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to finish round");
      return;
    }
    setError("");
    setRoom(data.room);
    if (data.room.status) {
      setGameState(data.room.status);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-6 bg-[#FCF8F3] text-[#6D28D9] overflow-hidden">
      {gameState === "landing" && <LandingScreen onJoin={handleJoin} error={error} />}
      {gameState === "lobby" && room && <LobbyScreen roomCode={roomCode} room={room} playerName={playerName} onStart={handleStart} />}
      {gameState === "playing" && room && <PlayingScreen onScore={handleScore} room={room} onForceFinish={handleForceFinish} />}
      {gameState === "finished" && room && <FinishedScreen room={room} onRestart={handleRestart} />}
    </div>
  );
}
