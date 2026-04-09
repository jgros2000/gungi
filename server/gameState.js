// gameState.js — authoritative game state, lives on the server
const { getValidMoves } = require("./pieces");

const GRID_SIZE = 9;

const PIECE_LIMITS = { K: 1, Q: 1, R: 2, B: 2, N: 2, P: 8 };

const PLACEMENT_ROWS = {
  1: [6, 7, 8],
  2: [0, 1, 2],
};

function emptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function countPieces(board, player) {
  const counts = { K: 0, Q: 0, R: 0, B: 0, N: 0, P: 0 };
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.player === player) counts[cell.type]++;
    }
  }
  return counts;
}

function createGame() {
  return {
    board: emptyBoard(),
    phase: "placement",
    placementTurn: 1,     // whose turn it is to place during setup
    ready: { 1: false, 2: false },
    currentTurn: 1,
    winner: null,
  };
}

function placePiece(game, player, row, col, type) {
  if (game.phase !== "placement")    return { ok: false, reason: "Game already started" };
  if (game.ready[player])            return { ok: false, reason: "You already pressed ready" };
  if (game.placementTurn !== player) return { ok: false, reason: "It's not your turn to place" };

  if (!PLACEMENT_ROWS[player].includes(row)) {
    return { ok: false, reason: "You can only place in your first 3 rows" };
  }

  const existing = game.board[row][col];
  if (existing && existing.player !== player) {
    return { ok: false, reason: "Cell occupied by opponent" };
  }

  const counts = countPieces(game.board, player);
  const replacingOwn       = existing && existing.player === player && existing.type === type;
  const replacingDifferent = existing && existing.player === player && existing.type !== type;

  if (replacingDifferent) counts[existing.type]--;

  if (!replacingOwn && counts[type] >= PIECE_LIMITS[type]) {
    return { ok: false, reason: `Limit reached: ${PIECE_LIMITS[type]} ${type}(s) max` };
  }

  game.board[row][col] = { type, player };

  // Hand placement turn to the other player (skip if they already pressed ready)
  const other = player === 1 ? 2 : 1;
  game.placementTurn = game.ready[other] ? player : other;

  return { ok: true };
}

function removePiece(game, player, row, col) {
  if (game.phase !== "placement")    return { ok: false, reason: "Game already started" };
  if (game.ready[player])            return { ok: false, reason: "You already pressed ready" };
  if (game.placementTurn !== player) return { ok: false, reason: "It's not your turn to place" };

  const cell = game.board[row][col];
  if (!cell || cell.player !== player) return { ok: false, reason: "Not your piece" };

  game.board[row][col] = null;

  // Removing counts as using your turn — pass to the other player
  const other = player === 1 ? 2 : 1;
  game.placementTurn = game.ready[other] ? player : other;

  return { ok: true };
}

function setReady(game, player) {
  if (game.phase !== "placement") return { ok: false, reason: "Already started" };
  game.ready[player] = true;
  if (game.ready[1] && game.ready[2]) {
    game.phase = "playing";
  } else {
    // Give the other player the placement turn if they're still going
    const other = player === 1 ? 2 : 1;
    if (!game.ready[other]) game.placementTurn = other;
  }
  return { ok: true };
}

function movePiece(game, player, fromRow, fromCol, toRow, toCol) {
  if (game.phase !== "playing")    return { ok: false, reason: "Game not started yet" };
  if (game.currentTurn !== player) return { ok: false, reason: "Not your turn" };

  const piece = game.board[fromRow][fromCol];
  if (!piece)                      return { ok: false, reason: "No piece there" };
  if (piece.player !== player)     return { ok: false, reason: "Not your piece" };

  const validMoves = getValidMoves(game.board, fromRow, fromCol);
  const isValid = validMoves.some(([r, c]) => r === toRow && c === toCol);
  if (!isValid) return { ok: false, reason: "Invalid move" };

  const target = game.board[toRow][toCol];
  if (target && target.type === "K") {
    game.winner = player;
    game.phase = "ended";
  }

  game.board[toRow][toCol] = piece;
  game.board[fromRow][fromCol] = null;
  game.currentTurn = player === 1 ? 2 : 1;

  return { ok: true, winner: game.winner };
}

module.exports = { createGame, placePiece, removePiece, setReady, movePiece, PIECE_LIMITS };