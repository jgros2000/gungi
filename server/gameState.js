// gameState.js
const { getValidMoves, top, MAX_HEIGHT } = require("./pieces");

const GRID_SIZE     = 9;
const PIECE_LIMITS  = { K: 1, Q: 1, R: 2, B: 2, N: 2, P: 8 };
const PLACEMENT_ROWS = { 1: [6, 7, 8], 2: [0, 1, 2] };
const DEBUG_MODE = true;

function emptyBoard() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => [])
  );
}

function debugBoard() {
  const b = emptyBoard();
 
  const place = (row, col, type, player) => b[row][col].push({ type, player });
 
  // Player 2 (top) — row 0: back rank, row 1: extra pieces, row 2: pawns
  place(0, 0, "R", 2); place(0, 1, "N", 2); place(0, 2, "B", 2);
  place(0, 3, "Q", 2); place(0, 4, "K", 2); place(0, 5, "B", 2);
  place(0, 6, "N", 2); place(0, 7, "R", 2);
  place(1, 0, "P", 2); place(1, 1, "P", 2); // extra pieces on row 1
  for (let c = 0; c < 9; c++) place(2, c, "P", 2);
 
  // Player 1 (bottom) — row 8: back rank, row 7: extra pieces, row 6: pawns
  place(8, 0, "R", 1); place(8, 1, "N", 1); place(8, 2, "B", 1);
  place(8, 3, "Q", 1); place(8, 4, "K", 1); place(8, 5, "B", 1);
  place(8, 6, "N", 1); place(8, 7, "R", 1);
  place(7, 0, "P", 1); place(7, 1, "P", 1); // extra pieces on row 7
  for (let c = 0; c < 9; c++) place(6, c, "P", 1);
 
  return b;
}

function countPieces(board, player) {
  const counts = { K: 0, Q: 0, R: 0, B: 0, N: 0, P: 0 };
  for (const row of board)
    for (const stack of row)
      for (const piece of stack)
        if (piece.player === player) counts[piece.type]++;
  return counts;
}

function createGame() {
  if (DEBUG_MODE) {
    return {
      board: debugBoard(),
      phase: "playing",
      placementTurn: null,
      ready: { 1: true, 2: true },
      currentTurn: 1,
      winner: null,
    };
  }
  return {
    board: emptyBoard(),
    phase: "placement",
    placementTurn: 1,
    ready: { 1: false, 2: false },
    currentTurn: 1,
    winner: null,
  };
}

function placePiece(game, player, row, col, type) {
  if (game.phase !== "placement")    return { ok: false, reason: "Game already started" };
  if (game.ready[player])            return { ok: false, reason: "You already pressed ready" };
  if (game.placementTurn !== player) return { ok: false, reason: "It's not your turn to place" };
  if (!PLACEMENT_ROWS[player].includes(row))
    return { ok: false, reason: "You can only place in your first 3 rows" };

  const stack = game.board[row][col];
  const topPiece = top(stack);

  if (topPiece && topPiece.player !== player)
    return { ok: false, reason: "Can't place on opponent's piece" };
  if (stack.length >= MAX_HEIGHT)
    return { ok: false, reason: `Stack limit is ${MAX_HEIGHT}` };

  const counts = countPieces(game.board, player);
  if (counts[type] >= PIECE_LIMITS[type])
    return { ok: false, reason: `Limit reached: ${PIECE_LIMITS[type]} ${type}(s) max` };

  stack.push({ type, player });

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
    const other = player === 1 ? 2 : 1;
    if (!game.ready[other]) game.placementTurn = other;
  }
  return { ok: true };
}

function movePiece(game, player, fromRow, fromCol, toRow, toCol) {
  if (game.phase !== "playing")    return { ok: false, reason: "Game not started yet" };
  if (game.currentTurn !== player) return { ok: false, reason: "Not your turn" };

  const fromStack = game.board[fromRow][fromCol];
  const piece     = top(fromStack);
  if (!piece)                      return { ok: false, reason: "No piece there" };
  if (piece.player !== player)     return { ok: false, reason: "Not your piece" };

  const validMoves = getValidMoves(game.board, fromRow, fromCol);
  if (!validMoves.some(([r, c]) => r === toRow && c === toCol))
    return { ok: false, reason: "Invalid move" };

  const toStack    = game.board[toRow][toCol];
  const targetTop  = top(toStack);
  const isCapture  = targetTop && targetTop.player !== player;

  if (isCapture) {
    // Check for King capture — win condition
    const hadKing = toStack.some(p => p.type === "K");
    if (hadKing) {
      game.winner = player;
      game.phase  = "ended";
    }
    // Take ALL pieces from the defender's stack and add them on top of attacker's
    const captured = toStack.splice(0); // empties toStack, returns all pieces
    console.log(captured);
  } 
  // Friendly stack or empty cell — move entire attacker stack on top
  const moving = fromStack.pop();
  toStack.push(moving);

  game.currentTurn = player === 1 ? 2 : 1;
  return { ok: true, winner: game.winner };
}

module.exports = { createGame, placePiece, setReady, movePiece, PIECE_LIMITS };