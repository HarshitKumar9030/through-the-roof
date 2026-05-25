export type GameState = "landing" | "lobby" | "playing" | "finished";

export interface Player {
  score: number | null;
  ready: boolean;
}

export interface RoomInfo {
  players: Record<string, Player>;
  status: GameState;
}
