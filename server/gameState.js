// gameState.js — authoritative game state, lives on the server
const { getValidMoves } = require("./pieces");

const GRID_SIZE = 9;

function emptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function createGame() {
  return {
    board: emptyBoard(),
    phase: "placement",   // "placement" | "playing" | "ended"
    ready: { 1: false, 2: false },
    currentTurn: 1,       // whose turn it is during playing phase
    winner: null,
  };
}

// Place a piece during setup phase
function placePiece(game, player, row, col, type) {
  if (game.phase !== "placement") return { ok: false, reason: "Game already started" };
  if (game.ready[player]) return { ok: false, reason: "You already pressed ready" };

  const existing = game.board[row][col];
  // Allow replacing your own piece, but not placing on opponent's
  if (existing && existing.player !== player) {
    return { ok: false, reason: "Cell occupied by opponent" };
  }

  game.board[row][col] = { type, player };
  return { ok: true };
}

// Remove a piece during placement phase
function removePiece(game, player, row, col) {
  if (game.phase !== "placement") return { ok: false, reason: "Game already started" };
  if (game.ready[player]) return { ok: false, reason: "You already pressed ready" };
  const cell = game.board[row][col];
  if (!cell || cell.player !== player) return { ok: false, reason: "Not your piece" };
  game.board[row][col] = null;
  return { ok: true };
}

// Mark a player as ready
function setReady(game, player) {
  if (game.phase !== "placement") return { ok: false, reason: "Already started" };
  game.ready[player] = true;
  // Start game when both are ready
  if (game.ready[1] && game.ready[2]) {
    game.phase = "playing";
  }
  return { ok: true };
}

// Move a piece during playing phase
function movePiece(game, player, fromRow, fromCol, toRow, toCol) {
  if (game.phase !== "playing") return { ok: false, reason: "Game not started yet" };
  if (game.currentTurn !== player) return { ok: false, reason: "Not your turn" };

  const piece = game.board[fromRow][fromCol];
  if (!piece) return { ok: false, reason: "No piece there" };
  if (piece.player !== player) return { ok: false, reason: "Not your piece" };

  const validMoves = getValidMoves(game.board, fromRow, fromCol);
  const isValid = validMoves.some(([r, c]) => r === toRow && c === toCol);
  if (!isValid) return { ok: false, reason: "Invalid move" };

  // Check if capturing a king
  const target = game.board[toRow][toCol];
  if (target && target.type === "K") {
    game.winner = player;
    game.phase = "ended";
  }

  // Execute move
  game.board[toRow][toCol] = piece;
  game.board[fromRow][fromCol] = null;

  // Switch turns
  game.currentTurn = player === 1 ? 2 : 1;

  return { ok: true, winner: game.winner };
}

module.exports = { createGame, placePiece, removePiece, setReady, movePiece };
