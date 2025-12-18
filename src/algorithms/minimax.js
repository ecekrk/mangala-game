// src/minimax.js

const cloneBoard = (b) => ({
  player1: [...b.player1],
  player2: [...b.player2],
  treasure1: b.treasure1,
  treasure2: b.treasure2,
});

const sum = (arr) => arr.reduce((a, x) => a + x, 0);

function isGameOver(board) {
  return board.player1.every((x) => x === 0) || board.player2.every((x) => x === 0);
}

function finalizeIfGameOverPure(board) {
  const p1Empty = board.player1.every((x) => x === 0);
  const p2Empty = board.player2.every((x) => x === 0);
  if (!p1Empty && !p2Empty) return board;

  const b = cloneBoard(board);
  b.treasure1 += sum(b.player1);
  b.treasure2 += sum(b.player2);
  b.player1 = [0, 0, 0, 0, 0, 0];
  b.player2 = [0, 0, 0, 0, 0, 0];
  return b;
}

function getLegalMoves(board, player) {
  const pits = player === 1 ? board.player1 : board.player2;
  const moves = [];
  for (let i = 0; i < 6; i++) if (pits[i] > 0) moves.push(i);
  return moves;
}

// Max player = 2
function evaluateBoard(board) {
  const treasureDiff = board.treasure2 - board.treasure1;

  const stoneDiff = (sum(board.player2) - sum(board.player1)) * 0.3;

  let positionalValue = 0;
  board.player2.forEach((stones, idx) => (positionalValue += stones * (idx + 1) * 0.1));
  board.player1.forEach((stones, idx) => (positionalValue -= stones * (idx + 1) * 0.1));

  return treasureDiff + stoneDiff + positionalValue;
}

// Same rules as App.jsx
function makeMove(board, pitIndex, currentPlayer) {
  const next = cloneBoard(board);
  const playerKey = currentPlayer === 1 ? "player1" : "player2";

  const stones = next[playerKey][pitIndex];
  if (stones <= 0) return { board: next, nextPlayer: currentPlayer };

  next[playerKey][pitIndex] = 0;

  let stonesInHand = stones;
  let currentPos = stones === 1 ? pitIndex : pitIndex - 1;
  let currentSide = currentPlayer;
  let lastPos = -1;
  let lastSide = -1;

  while (stonesInHand > 0) {
    currentPos++;

    if (currentSide === 1) {
      if (currentPos < 6) {
        next.player1[currentPos]++;
        lastPos = currentPos;
        lastSide = 1;
        stonesInHand--;
      } else if (currentPos === 6) {
        if (currentPlayer === 1) {
          next.treasure1++;
          lastPos = "treasure";
          lastSide = 1;
          stonesInHand--;
        }
        if (stonesInHand > 0) {
          currentSide = 2;
          currentPos = -1;
        }
      }
    } else {
      if (currentPos < 6) {
        next.player2[currentPos]++;
        lastPos = currentPos;
        lastSide = 2;
        stonesInHand--;
      } else if (currentPos === 6) {
        if (currentPlayer === 2) {
          next.treasure2++;
          lastPos = "treasure";
          lastSide = 2;
          stonesInHand--;
        }
        if (stonesInHand > 0) {
          currentSide = 1;
          currentPos = -1;
        }
      }
    }
  }

  let nextPlayer = currentPlayer === 1 ? 2 : 1;

  // 1) last stone in own treasure => extra turn
  if (lastPos === "treasure" && lastSide === currentPlayer) {
    nextPlayer = currentPlayer;
  }
  // 2) last stone on opponent side and makes even => take
  else if (typeof lastPos === "number" && lastSide !== currentPlayer) {
    const oppKey = currentPlayer === 1 ? "player2" : "player1";
    const pitCount = next[oppKey][lastPos];
    if (pitCount % 2 === 0) {
      if (currentPlayer === 1) next.treasure1 += pitCount;
      else next.treasure2 += pitCount;
      next[oppKey][lastPos] = 0;
    }
  }
  // 3) last stone on own empty pit (now 1) and opposite has stones => capture
  else if (typeof lastPos === "number" && lastSide === currentPlayer) {
    const myKey = currentPlayer === 1 ? "player1" : "player2";
    const oppKey = currentPlayer === 1 ? "player2" : "player1";
    if (next[myKey][lastPos] === 1) {
      const oppositeIndex = 5 - lastPos;
      const captured = next[oppKey][oppositeIndex];
      if (captured > 0) {
        const total = captured + 1;
        if (currentPlayer === 1) next.treasure1 += total;
        else next.treasure2 += total;
        next[myKey][lastPos] = 0;
        next[oppKey][oppositeIndex] = 0;
      }
    }
  }

  const finalBoard = finalizeIfGameOverPure(next);
  return { board: finalBoard, nextPlayer };
}

export function minimax(board, depth, currentPlayer, alpha = -Infinity, beta = Infinity) {
  if (depth === 0 || isGameOver(board)) return evaluateBoard(board);

  const legalMoves = getLegalMoves(board, currentPlayer);
  const isMax = currentPlayer === 2;

  if (isMax) {
    let best = -Infinity;
    for (const move of legalMoves) {
      const { board: nb, nextPlayer } = makeMove(board, move, 2);
      const val = minimax(nb, depth - 1, nextPlayer, alpha, beta);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of legalMoves) {
      const { board: nb, nextPlayer } = makeMove(board, move, 1);
      const val = minimax(nb, depth - 1, nextPlayer, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function findBestMove(board, player, depth = 5) {
  const legalMoves = getLegalMoves(board, player);
  if (legalMoves.length === 0) return 0;

  let bestMove = legalMoves[0];
  let bestValue = player === 2 ? -Infinity : Infinity;

  for (const move of legalMoves) {
    const { board: nb, nextPlayer } = makeMove(board, move, player);
    const value = minimax(nb, depth - 1, nextPlayer, -Infinity, Infinity);

    if (player === 2 && value > bestValue) {
      bestValue = value;
      bestMove = move;
    } else if (player === 1 && value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
}
