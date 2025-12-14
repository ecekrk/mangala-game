import React, { useState } from 'react';
import { Crown, Trophy, RotateCcw } from 'lucide-react';

const MangalaGame = () => {
  const [board, setBoard] = useState({
    player1: [4, 4, 4, 4, 4, 4],
    player2: [4, 4, 4, 4, 4, 4],
    treasure1: 0,
    treasure2: 0
  });
  
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedPit, setSelectedPit] = useState(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState('Oyuncu 1\'in sırası - Kendi tarafınızdaki bir kuyuyu seçin');

  const checkGameOver = (newBoard) => {
    const p1Empty = newBoard.player1.every(pit => pit === 0);
    const p2Empty = newBoard.player2.every(pit => pit === 0);
    
    if (p1Empty || p2Empty) {
      const finalBoard = { ...newBoard };
      
      if (p1Empty) {
        const remainingStones = finalBoard.player2.reduce((sum, stones) => sum + stones, 0);
        finalBoard.treasure2 += remainingStones;
        finalBoard.player2 = [0, 0, 0, 0, 0, 0];
        setMessage(`Oyuncu 1'in taşları bitti. Oyuncu 2, kalan ${remainingStones} taşı aldı.`);
      } else {
        const remainingStones = finalBoard.player1.reduce((sum, stones) => sum + stones, 0);
        finalBoard.treasure1 += remainingStones;
        finalBoard.player1 = [0, 0, 0, 0, 0, 0];
        setMessage(`Oyuncu 2'nin taşları bitti. Oyuncu 1, kalan ${remainingStones} taşı aldı.`);
      }
      
      setBoard(finalBoard);
      setGameOver(true);
      
      if (finalBoard.treasure1 > finalBoard.treasure2) {
        setWinner(1);
        setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
      } else if (finalBoard.treasure2 > finalBoard.treasure1) {
        setWinner(2);
        setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
      } else {
        setWinner(0);
      }
      
      return true;
    }
    return false;
  };

  const makeMove = async (pitIndex) => {
    if (animating || gameOver) return;
    
    const playerPits = currentPlayer === 1 ? 'player1' : 'player2';
    const stones = board[playerPits][pitIndex];
    
    if (stones === 0) {
      setMessage('❌ Bu kuyuda taş yok! Başka bir kuyu seçin.');
      return;
    }
    
    setAnimating(true);
    setSelectedPit(pitIndex);
    
    const newBoard = {
      player1: [...board.player1],
      player2: [...board.player2],
      treasure1: board.treasure1,
      treasure2: board.treasure2
    };
    
    newBoard[playerPits][pitIndex] = 0;
    let stonesInHand = stones;
    let currentPos = pitIndex - 1;
    let currentSide = currentPlayer;
    let lastPos = -1;
    let lastSide = -1;
    let isFirstDrop = true;
    
    while (stonesInHand > 0) {
      currentPos++;
      
      if (currentSide === 1) {
        if (currentPos < 6) {
          newBoard.player1[currentPos]++;
          lastPos = currentPos;
          lastSide = 1;
          stonesInHand--;
          isFirstDrop = false;
        } else if (currentPos === 6) {
          if (currentPlayer === 1) {
            newBoard.treasure1++;
            lastPos = 'treasure';
            lastSide = 1;
            stonesInHand--;
          }
          
          if (stonesInHand > 0) {
            currentSide = 2;
            currentPos = -1;
          }
        }
      }
      else if (currentSide === 2) {
        if (currentPos < 6) {
          newBoard.player2[currentPos]++;
          lastPos = currentPos;
          lastSide = 2;
          stonesInHand--;
          isFirstDrop = false;
        } else if (currentPos === 6) {
          if (currentPlayer === 2) {
            newBoard.treasure2++;
            lastPos = 'treasure';
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
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let extraTurn = false;
    let captureMessage = '';
    
    if (lastPos === 'treasure' && lastSide === currentPlayer) {
      extraTurn = true;
      captureMessage = '🎯 Son taş hazineye düştü! Tekrar oynayın.';
    }
    else if (lastSide === currentPlayer && lastPos !== 'treasure' && typeof lastPos === 'number') {
      const playerPitsKey = currentPlayer === 1 ? 'player1' : 'player2';
      const opponentPitsKey = currentPlayer === 1 ? 'player2' : 'player1';
      
      if (newBoard[playerPitsKey][lastPos] === 1) {
        const oppositeIndex = 5 - lastPos;
        const capturedStones = newBoard[opponentPitsKey][oppositeIndex];
        
        if (capturedStones > 0) {
          const totalCaptured = capturedStones + 1;
          
          if (currentPlayer === 1) {
            newBoard.treasure1 += totalCaptured;
          } else {
            newBoard.treasure2 += totalCaptured;
          }
          
          newBoard[playerPitsKey][lastPos] = 0;
          newBoard[opponentPitsKey][oppositeIndex] = 0;
          captureMessage = `🎉 ${totalCaptured} taş yakalandı! (Karşı kuyu: ${capturedStones} + Son taş: 1)`;
        } else {
          if (currentPlayer === 1) {
            newBoard.treasure1 += 1;
          } else {
            newBoard.treasure2 += 1;
          }
          newBoard[playerPitsKey][lastPos] = 0;
          captureMessage = '📦 Son taş boş kuyuya düştü ve hazineye eklendi.';
        }
      }
    }
    
    setBoard(newBoard);
    
    if (!checkGameOver(newBoard)) {
      if (extraTurn) {
        setMessage(`🎯 Son taş hazineye düştü! Oyuncu ${currentPlayer} tekrar oynuyor!`);
      } else {
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer);
        const msg = captureMessage ? `${captureMessage}\n\nOyuncu ${nextPlayer}'nin sırası` : `Oyuncu ${nextPlayer}'nin sırası`;
        setMessage(msg);
      }
    }
    
    setAnimating(false);
    setSelectedPit(null);
  };

  const resetGame = () => {
    setBoard({
      player1: [4, 4, 4, 4, 4, 4],
      player2: [4, 4, 4, 4, 4, 4],
      treasure1: 0,
      treasure2: 0
    });
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
    setMessage('Oyuncu 1\'in sırası - Kendi tarafınızdaki bir kuyuyu seçin');
    setSelectedPit(null);
  };

  const Pit = ({ stones, onClick, isActive, isSelected, player }) => (
    <button
      onClick={onClick}
      disabled={!isActive || animating}
      className={`
        relative w-20 h-20 rounded-2xl transition-all duration-300 transform
        ${isActive && !animating ? 'hover:scale-110 cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-60'}
        ${isSelected ? 'ring-4 ring-yellow-400 scale-105 animate-pulse' : ''}
        ${player === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-red-400 to-red-600'}
        shadow-lg
      `}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white drop-shadow-lg">{stones}</span>
      </div>
      {stones > 0 && isActive && !animating && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
      )}
    </button>
  );

  const Treasure = ({ stones, player, isActive }) => (
    <div className={`
      relative w-24 h-48 rounded-3xl flex items-center justify-center
      ${player === 1 ? 'bg-gradient-to-b from-blue-500 to-blue-700' : 'bg-gradient-to-b from-red-500 to-red-700'}
      shadow-2xl border-4 border-yellow-400
      ${isActive ? 'ring-4 ring-green-400 ring-opacity-50' : ''}
      transition-all duration-300
    `}>
      <div className="text-center">
        <Crown className="w-10 h-10 text-yellow-300 mx-auto mb-2" />
        <div className="text-4xl font-bold text-white mb-1">{stones}</div>
        <div className="text-xs text-yellow-200 font-semibold">HAZINE</div>
      </div>
    </div>
  );

  const PitLabel = ({ index }) => (
    <div className="text-xs text-gray-600 font-semibold text-center mt-1">
      {index + 1}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-amber-900 mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-600" />
            MANGALA
            <Trophy className="w-12 h-12 text-yellow-600" />
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-4 inline-block max-w-2xl">
            <p className="text-lg font-semibold text-gray-700 whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-6">
          <div className={`rounded-xl p-4 shadow-lg transition-all ${currentPlayer === 1 && !gameOver ? 'bg-blue-200 ring-4 ring-blue-400' : 'bg-blue-100'}`}>
            <p className="text-sm text-blue-600 font-medium">🔵 Oyuncu 1</p>
            <p className="text-3xl font-bold text-blue-700">Skor: {score.player1}</p>
          </div>
          <div className={`rounded-xl p-4 shadow-lg transition-all ${currentPlayer === 2 && !gameOver ? 'bg-red-200 ring-4 ring-red-400' : 'bg-red-100'}`}>
            <p className="text-sm text-red-600 font-medium">🔴 Oyuncu 2</p>
            <p className="text-3xl font-bold text-red-700">Skor: {score.player2}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-3xl p-8 shadow-2xl border-4 border-amber-400">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Treasure stones={board.treasure2} player={2} isActive={currentPlayer === 2} />
            <div className="flex-1">
              <div className="flex gap-3 justify-center">
                {[...board.player2].reverse().map((stones, idx) => {
                  const actualIndex = 5 - idx;
                  return (
                    <div key={`p2-${actualIndex}`}>
                      <PitLabel index={actualIndex} />
                      <Pit
                        stones={stones}
                        onClick={() => makeMove(actualIndex)}
                        isActive={currentPlayer === 2 && !gameOver}
                        isSelected={selectedPit === actualIndex && currentPlayer === 2}
                        player={2}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-2 text-sm font-bold text-red-700">
                ← Oyuncu 2'nin Kuyuları (Saat Yönünün Tersi →)
              </div>
            </div>
            <div className="w-24" />
          </div>

          <div className="border-t-4 border-dashed border-amber-500 my-6 relative">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-200 px-4 py-1 rounded-full text-xs font-bold text-amber-800">
              SAAT YÖNÜNİN TERSİ ↺
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="w-24" />
            <div className="flex-1">
              <div className="text-center mb-2 text-sm font-bold text-blue-700">
                ← Oyuncu 1'in Kuyuları (Saat Yönünün Tersi →)
              </div>
              <div className="flex gap-3 justify-center">
                {board.player1.map((stones, idx) => (
                  <div key={`p1-${idx}`}>
                    <Pit
                      stones={stones}
                      onClick={() => makeMove(idx)}
                      isActive={currentPlayer === 1 && !gameOver}
                      isSelected={selectedPit === idx && currentPlayer === 1}
                      player={1}
                    />
                    <PitLabel index={idx} />
                  </div>
                ))}
              </div>
            </div>
            <Treasure stones={board.treasure1} player={1} isActive={currentPlayer === 1} />
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center items-start">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Yeni Oyun
          </button>
          
          <div className="bg-white rounded-xl p-4 shadow-lg max-w-md text-sm">
            <h3 className="font-bold text-amber-900 mb-2">📖 Hızlı Kurallar:</h3>
            <ul className="text-gray-700 space-y-1 text-xs">
              <li>• Taşlar saat yönünün tersine dağıtılır</li>
              <li>• Kendi hazineye taş bırakılır, rakipinkilere bırakılmaz</li>
              <li>• Son taş kendi hazineye düşerse tekrar oynarsınız</li>
              <li>• Son taş boş kuyuya düşerse karşı tarafı yakalarsınız</li>
              <li>• Bir tarafın taşı bitince oyun sona erer</li>
            </ul>
          </div>
        </div>

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md">
              <Trophy className={`w-24 h-24 mx-auto mb-4 ${winner === 1 ? 'text-blue-500' : winner === 2 ? 'text-red-500' : 'text-yellow-500'}`} />
              <h2 className="text-4xl font-bold mb-4 text-gray-800">
                {winner === 1 ? '🔵 Oyuncu 1 Kazandı!' : winner === 2 ? '🔴 Oyuncu 2 Kazandı!' : '🤝 Berabere!'}
              </h2>
              <div className="mb-6 space-y-2">
                <p className="text-xl text-gray-600">Oyuncu 1: <span className="font-bold text-blue-600">{board.treasure1}</span> taş</p>
                <p className="text-xl text-gray-600">Oyuncu 2: <span className="font-bold text-red-600">{board.treasure2}</span> taş</p>
                <div className="border-t-2 border-gray-300 pt-2 mt-4">
                  <p className="text-lg font-bold text-gray-700">Toplam Skor</p>
                  <p className="text-lg text-gray-600">Oyuncu 1: {score.player1} | Oyuncu 2: {score.player2}</p>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Yeni Oyun Başlat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MangalaGame;