import { NextResponse } from "next/server";

type Action = "join" | "start" | "score" | "reset" | "finish";
type RoomStatus = "lobby" | "playing" | "finished";

interface PlayerState {
  score: number | null;
  ready: boolean;
}

interface RoomState {
  players: Record<string, PlayerState>;
  status: RoomStatus;
}

interface RequestBody {
  action?: Action;
  roomCode?: string;
  playerName?: string;
  score?: number;
}

const MAX_PLAYERS = 8;
const MIN_PLAYERS_TO_START = 2;
const MAX_ROOM_CODE_LENGTH = 6;
const MAX_PLAYER_NAME_LENGTH = 12;

const globalStore = globalThis as typeof globalThis & {
  __rooms?: Record<string, RoomState>;
};

if (!globalStore.__rooms) {
  globalStore.__rooms = Object.create(null) as Record<string, RoomState>;
}

function normalizeRoomCode(roomCode: unknown): string | null {
  if (typeof roomCode !== "string") {
    return null;
  }

  const normalized = roomCode.trim().toUpperCase();
  if (!normalized || normalized.length > MAX_ROOM_CODE_LENGTH) {
    return null;
  }

  return normalized;
}

function normalizePlayerName(playerName: unknown): string | null {
  if (typeof playerName !== "string") {
    return null;
  }

  const normalized = playerName.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > MAX_PLAYER_NAME_LENGTH) {
    return null;
  }

  return normalized;
}

function isValidScore(score: unknown): score is number {
  return typeof score === "number" && Number.isFinite(score) && score >= 0;
}

function findPlayerKey(players: Record<string, PlayerState>, playerName: string): string | null {
  const normalizedCandidate = playerName.toLowerCase();
  const key = Object.keys(players).find(
    (existingName) => existingName.toLowerCase() === normalizedCandidate
  );

  return key ?? null;
}

function createRoom(): RoomState {
  return { players: Object.create(null) as Record<string, PlayerState>, status: "lobby" };
}

function resetRound(room: RoomState): void {
  for (const player of Object.values(room.players)) {
    player.score = null;
    player.ready = false;
  }
}

function snapshotRoom(room: RoomState): RoomState {
  const players = Object.fromEntries(
    Object.entries(room.players).map(([name, player]) => [name, { ...player }])
  );
  return { status: room.status, players };
}

function getRoomOrNotFound(roomCode: string): RoomState | NextResponse {
  const room = globalStore.__rooms?.[roomCode];
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return room;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestBody;
    const roomCode = normalizeRoomCode(payload.roomCode);
    if (!roomCode) {
      return NextResponse.json({ error: "Valid room code required" }, { status: 400 });
    }

    const action = payload.action;
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    if (action === "join") {
      const playerName = normalizePlayerName(payload.playerName);
      if (!playerName) {
        return NextResponse.json({ error: "Valid player name required" }, { status: 400 });
      }

      const room = globalStore.__rooms?.[roomCode] ?? createRoom();
      globalStore.__rooms![roomCode] = room;

      if (room.status !== "lobby") {
        return NextResponse.json({ error: "Game already started" }, { status: 409 });
      }

      const existingPlayerKey = findPlayerKey(room.players, playerName);
      if (!existingPlayerKey && Object.keys(room.players).length >= MAX_PLAYERS) {
        return NextResponse.json({ error: "Room is full (max 8)" }, { status: 400 });
      }

      if (!existingPlayerKey) {
        room.players[playerName] = { score: null, ready: false };
      }

      return NextResponse.json({ room: snapshotRoom(room) });
    }

    const roomResult = getRoomOrNotFound(roomCode);
    if (roomResult instanceof NextResponse) {
      return roomResult;
    }

    const room = roomResult;
    const playerName = normalizePlayerName(payload.playerName);
    if (!playerName) {
      return NextResponse.json({ error: "Valid player name required" }, { status: 400 });
    }

    const playerKey = findPlayerKey(room.players, playerName);
    if (!playerKey) {
      return NextResponse.json({ error: "Player not found in room" }, { status: 404 });
    }

    switch (action) {
      case "start": {
        if (room.status !== "lobby") {
          return NextResponse.json({ error: "Game already in progress" }, { status: 409 });
        }
        if (Object.keys(room.players).length < MIN_PLAYERS_TO_START) {
          return NextResponse.json({ error: "At least 2 players are required to start" }, { status: 400 });
        }

        resetRound(room);
        room.status = "playing";
        break;
      }

      case "score": {
        if (room.status !== "playing") {
          return NextResponse.json({ error: "Game is not currently accepting scores" }, { status: 409 });
        }
        if (!isValidScore(payload.score)) {
          return NextResponse.json({ error: "Valid score is required" }, { status: 400 });
        }

        const player = room.players[playerKey];
        if (player.ready) {
          return NextResponse.json({ error: "Score already submitted for this round" }, { status: 409 });
        }

        player.score = payload.score;
        player.ready = true;

        const allThrown =
          Object.keys(room.players).length > 0 &&
          Object.values(room.players).every((currentPlayer) => currentPlayer.ready && currentPlayer.score !== null);

        if (allThrown) {
          room.status = "finished";
        }
        break;
      }

      case "reset": {
        resetRound(room);
        room.status = "lobby";
        break;
      }

      case "finish": {
        if (room.status !== "playing") {
          return NextResponse.json({ error: "Game is not currently in progress" }, { status: 409 });
        }
        room.status = "finished";
        break;
      }
    }

    return NextResponse.json({ room: snapshotRoom(room) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomCode = normalizeRoomCode(searchParams.get("roomCode"));
  if (!roomCode) {
    return NextResponse.json({ error: "Valid room code required" }, { status: 400 });
  }

  const room = globalStore.__rooms?.[roomCode];
  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ room: snapshotRoom(room) });
}
