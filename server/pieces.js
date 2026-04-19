// pieces.js
// Rules:
//  - Max stack height: 3
//  - Same-player stacking: allowed if result stays <= 3
//  - Attacking opponent: only if attacker height >= defender height
//  - Capturing takes ALL pieces in the defender's stack

const GRID_SIZE  = 9;
const MAX_HEIGHT = 3;

const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

function top(stack) {
  if (!stack || stack.length === 0) return null;
  return stack[stack.length - 1];
}

// Can the moving stack (at fromRow,fromCol) legally land on (r,c)?
function canLand(board, fromRow, fromCol, r, c) {
  const attacker = board[fromRow][fromCol];
  const target   = board[r][c];
  const attackerPlayer = top(attacker)?.player;

  if (!target || target.length === 0) return true;  // empty cell always ok

  const targetPlayer = top(target).player;

  if (targetPlayer === attackerPlayer) {
    // Friendly stack — can only land if combined height <= MAX_HEIGHT
    return 1 + target.length <= MAX_HEIGHT;
  } else {
    // Enemy stack — can only attack if attacker height >= defender height
    return attacker.length >= target.length;
  }
}

function slide(board, row, col, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c)) {
      const t = top(board[r][c]);
      if (!t) {
        moves.push([r, c]);
      } else {
        // Whether friendly or enemy, stop sliding after this cell
        if (canLand(board, row, col, r, c)) moves.push([r, c]);
        break;
      }
      r += dr; c += dc;
    }
  }
  return moves;
}

function stepFiltered(board, row, col, directions) {
  return directions
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => inBounds(r, c) && canLand(board, row, col, r, c));
}

function getPawnMoves(board, row, col, player) {
  const moves   = [];
  const dir      = player === 1 ? -1 : 1;
  const startRow = player === 1 ? GRID_SIZE - 2 : 1;
  const attacker = board[row][col];

  // Forward — friendly stack or empty
  if (inBounds(row + dir, col)) {
    const target = board[row + dir][col];
    const t      = top(target);
    if (!t) {
      moves.push([row + dir, col]);
      if (row === startRow && !top(board[row + 2 * dir]?.[col]))
        moves.push([row + 2 * dir, col]);
    } else if (t.player === player && attacker.length + target.length <= MAX_HEIGHT) {
      moves.push([row + dir, col]);
    }
  }
  // Diagonal — only captures enemy stacks of equal or lower height
  for (const dc of [-1, 1]) {
    const r = row + dir, c = col + dc;
    if (inBounds(r, c)) {
      const target = board[r][c];
      const t      = top(target);
      if (t && t.player !== player && attacker.length >= target.length) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function getValidMoves(board, row, col) {
  const piece = top(board[row][col]);
  if (!piece) return [];
  const { type, player } = piece;

  switch (type) {
    case "P": return getPawnMoves(board, row, col, player);
    case "N": return stepFiltered(board, row, col, [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
    case "B": return slide(board, row, col, [[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "R": return slide(board, row, col, [[-1,0],[1,0],[0,-1],[0,1]]);
    case "Q": return slide(board, row, col, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    case "K": return stepFiltered(board, row, col, [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
    default:  return [];
  }
}

module.exports = { getValidMoves, top, MAX_HEIGHT };