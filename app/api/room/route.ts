import { NextResponse } from 'next/server';

// Simple in-memory store for development/single-instance hosting
const globalRooms = global as unknown as { 
  rooms: Record<string, {
    players: Record<string, { score: number | null, ready: boolean }>,
    status: 'lobby' | 'playing' | 'finished',
  }> 
};

if (!globalRooms.rooms) {
  globalRooms.rooms = {};
}

export async function POST(request: Request) {
  try {
    const { action, roomCode, playerName, score } = await request.json();
    
    if (!roomCode) return NextResponse.json({ error: 'Room code required' }, { status: 400 });

    if (!globalRooms.rooms[roomCode]) {
      globalRooms.rooms[roomCode] = { players: {}, status: 'lobby' };
    }
    const room = globalRooms.rooms[roomCode];

    switch(action) {
      case 'join':
        if (Object.keys(room.players).length >= 8 && !room.players[playerName]) {
          return NextResponse.json({ error: 'Room is full (max 8)' }, { status: 400 });
        }
        if (!room.players[playerName]) {
          room.players[playerName] = { score: null, ready: false };
        }
        break;
      case 'start':
        room.status = 'playing';
        break;
      case 'score':
        if (room.players[playerName]) {
           room.players[playerName].score = score;
        }
        // Check if everyone threw
        const allThrown = Object.values(room.players).every(p => p.score !== null);
        if (allThrown) {
           room.status = 'finished';
        }
        break;
      case 'reset':
        room.status = 'lobby';
        for (const p in room.players) {
          room.players[p].score = null;
          room.players[p].ready = false;
        }
        break;
    }
    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  if (!roomCode || !globalRooms.rooms[roomCode]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ room: globalRooms.rooms[roomCode] });
}
