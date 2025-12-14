// Minimax Algoritması - AI için
export function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
  // Terminal durumu kontrolü
  if (depth === 0 || isGameOver(board)) {
    return evaluateBoard(board);
  }

  const legalMoves = getLegalMoves(board, isMaximizing ? 2 : 1);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const newBoard = makeMove(board, move, 2);
      const evaluation = minimax(newBoard, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const newBoard = makeMove(board, move, 1);
      const evaluation = minimax(newBoard, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

// En iyi hamleyi bul
export function findBestMove(board, player, depth = 5) {
  const legalMoves = getLegalMoves(board, player);
  let bestMove = legalMoves[0];
  let bestValue = player === 2 ? -Infinity : Infinity;

  for (const move of legalMoves) {
    const newBoard = makeMove(board, move, player);
    const value = minimax(newBoard, depth - 1, player === 1, -Infinity, Infinity);

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

// Tahta değerlendirmesi (heuristic)
function evaluateBoard(board) {
  // Basit değerlendirme: Hazine farkı + pozisyonel avantajlar
  const treasureDiff = board.treasure2 - board.treasure1;
  const stoneDiff = (
    board.player2.reduce((a, b) => a + b, 0) - 
    board.player1.reduce((a, b) => a + b, 0)
  ) * 0.3;

  // Pozisyonel avantaj (sağ tarafa yakın kuyular daha değerli)
  let positionalValue = 0;
  board.player2.forEach((stones, idx) => {
    positionalValue += stones * (idx + 1) * 0.1;
  });
  board.player1.forEach((stones, idx) => {
    positionalValue -= stones * (idx + 1) * 0.1;
  });

  return treasureDiff + stoneDiff + positionalValue;
}

// Yasal hamleleri al
function getLegalMoves(board, player) {
  const pits = player === 1 ? board.player1 : board.player2;
  return pits
    .map((stones, idx) => ({ index: idx, stones }))
    .filter(pit => pit.stones > 0)
    .map(pit => pit.index);
}

// Oyun bitti mi?
function isGameOver(board) {
  return (
    board.player1.every(pit => pit === 0) ||
    board.player2.every(pit => pit === 0)
  );
}

// Hamle simülasyonu (basitleştirilmiş)
function makeMove(board, pitIndex, player) {
  // Derin kopya oluştur
  const newBoard = {
    player1: [...board.player1],
    player2: [...board.player2],
    treasure1: board.treasure1,
    treasure2: board.treasure2
  };

  // Not: Tam simülasyon için App.jsx'teki makeMove mantığını burada da kullanmalısınız
  // Bu basitleştirilmiş bir versiyondur

  return newBoard;
}