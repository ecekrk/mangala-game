import React, { useMemo, useState, useEffect } from "react";
import { Crown, RotateCcw, Sparkles } from "lucide-react";
import { findBestMove } from "./algorithms/minimax";

// =========================
// Helpers
// =========================
const cloneBoard = (b) => ({
  player1: [...b.player1],
  player2: [...b.player2],
  treasure1: b.treasure1,
  treasure2: b.treasure2,
});

const sum = (arr) => arr.reduce((a, x) => a + x, 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const initialBoard = useMemo(
    () => ({
      player1: [4, 4, 4, 4, 4, 4],
      player2: [4, 4, 4, 4, 4, 4],
      treasure1: 0,
      treasure2: 0,
    }),
    []
  );

  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [message, setMessage] = useState("Oyuncu 1 başlıyor.");
  const [animating, setAnimating] = useState(false);
  const [selectedPit, setSelectedPit] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // ✅ Mod: 2 kişi / Bilgisayara karşı
  const [mode, setMode] = useState("PVP"); // "PVP" | "AI"
  const aiPlayer = 2;

  const resetGame = () => {
    setBoard({
      player1: [4, 4, 4, 4, 4, 4],
      player2: [4, 4, 4, 4, 4, 4],
      treasure1: 0,
      treasure2: 0,
    });
    setCurrentPlayer(1);
    setMessage("Oyuncu 1 başlıyor.");
    setAnimating(false);
    setSelectedPit(null);
    setGameOver(false);
    setWinner(null);
  };

  const finalizeIfGameOver = (b) => {
    const p1Empty = b.player1.every((x) => x === 0);
    const p2Empty = b.player2.every((x) => x === 0);
    if (!p1Empty && !p2Empty) return false;

    const finalBoard = cloneBoard(b);

    // 4. kural: bir taraf biterse kalan taşlar hazinelere eklenir
    finalBoard.treasure1 += sum(finalBoard.player1);
    finalBoard.treasure2 += sum(finalBoard.player2);
    finalBoard.player1 = [0, 0, 0, 0, 0, 0];
    finalBoard.player2 = [0, 0, 0, 0, 0, 0];

    setBoard(finalBoard);
    setGameOver(true);

    if (finalBoard.treasure1 > finalBoard.treasure2) setWinner(1);
    else if (finalBoard.treasure2 > finalBoard.treasure1) setWinner(2);
    else setWinner(0);

    setMessage(
      finalBoard.treasure1 === finalBoard.treasure2
        ? "Oyun bitti: Berabere!"
        : `Oyun bitti: Oyuncu ${
            finalBoard.treasure1 > finalBoard.treasure2 ? 1 : 2
          } kazandı!`
    );

    return true;
  };

  // =========================
  // ✅ DÜZELTİLMİŞ makeMove
  // =========================
  const makeMove = async (pitIndex) => {
    if (animating || gameOver) return;

    // AI modunda, AI sırasındayken kullanıcı tıklamasın
    if (mode === "AI" && currentPlayer === aiPlayer) return;

    const playerKey = currentPlayer === 1 ? "player1" : "player2";
    const stones = board[playerKey][pitIndex];
    if (stones === 0) {
      setMessage("Bu kuyuda taş yok. Başka bir kuyu seçin.");
      return;
    }

    setAnimating(true);
    setSelectedPit(pitIndex);

    const next = cloneBoard(board);
    next[playerKey][pitIndex] = 0;

    let stonesInHand = stones;

    // Tek taş istisnası:
    // stones === 1 ise taşı sağındaki kuyuya taşı (aldığın kuyuya geri bırakma)
    let currentPos = stones === 1 ? pitIndex : pitIndex - 1;
    let currentSide = currentPlayer; // 1 or 2
    let lastPos = -1; // 0..5 or "treasure"
    let lastSide = -1; // 1 or 2

    while (stonesInHand > 0) {
      currentPos++;

      if (currentSide === 1) {
        if (currentPos < 6) {
          next.player1[currentPos]++;
          lastPos = currentPos;
          lastSide = 1;
          stonesInHand--;
        } else if (currentPos === 6) {
          // player1 treasure (rakip treasure'a taş bırakmıyoruz)
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
        // currentSide === 2
        if (currentPos < 6) {
          next.player2[currentPos]++;
          lastPos = currentPos;
          lastSide = 2;
          stonesInHand--;
        } else if (currentPos === 6) {
          // player2 treasure
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

    await sleep(25);

    let extraTurn = false;
    let info = "";

    // 1. kural: son taş kendi hazinesine gelirse tekrar oynar
    if (lastPos === "treasure" && lastSide === currentPlayer) {
      extraTurn = true;
      info = "Son taş hazineye düştü. Tekrar oynayın.";
    }

    // 2. kural: son taş rakip kuyusunda ve o kuyuyu çift yaptıysa taşları al
    else if (typeof lastPos === "number" && lastSide !== currentPlayer) {
      const oppKey = currentPlayer === 1 ? "player2" : "player1";
      const pitCount = next[oppKey][lastPos];
      if (pitCount % 2 === 0) {
        if (currentPlayer === 1) next.treasure1 += pitCount;
        else next.treasure2 += pitCount;
        next[oppKey][lastPos] = 0;
        info = `${pitCount} taş alındı (çift kuralı).`;
      }
    }

    // 3. kural: son taş kendi boş kuyuna düşerse ve karşısında taş varsa yakala
    else if (typeof lastPos === "number" && lastSide === currentPlayer) {
      const myKey = currentPlayer === 1 ? "player1" : "player2";
      const oppKey = currentPlayer === 1 ? "player2" : "player1";

      // Son taş kendi tarafında ve kuyu şu an 1 ise (öncesi boştu)
      if (next[myKey][lastPos] === 1) {
        const oppositeIndex = 5 - lastPos;
        const captured = next[oppKey][oppositeIndex];

        if (captured > 0) {
          const total = captured + 1;
          if (currentPlayer === 1) next.treasure1 += total;
          else next.treasure2 += total;

          next[myKey][lastPos] = 0;
          next[oppKey][oppositeIndex] = 0;
          info = `${total} taş yakalandı.`;
        } else {
          // ✅ DÜZELTME: karşı kuyu boşsa yakalama yok → son taş kuyuda kalır
          info = "Yakalama yok.";
        }
      }
    }

    setBoard(next);

    if (!finalizeIfGameOver(next)) {
      if (extraTurn) {
        setMessage(`Oyuncu ${currentPlayer} — ${info}`);
      } else {
        const np = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(np);
        setMessage(info ? `${info}\n\nOyuncu ${np}'nin sırası.` : `Oyuncu ${np}'nin sırası.`);
      }
    }

    setAnimating(false);
    setSelectedPit(null);
  };

  // =========================
  // ✅ AI: sıra AI'ya gelince otomatik oynat
  // =========================
  useEffect(() => {
    if (mode !== "AI") return;
    if (gameOver) return;
    if (animating) return;

    if (currentPlayer === aiPlayer) {
      (async () => {
        await sleep(350);
        const bestMove = findBestMove(board, aiPlayer, 5);

        // AI hamlesini "kullanıcı tıklamasını engelleyen" kontrolü aşmak için:
        // makeMove içinde AI modunda currentPlayer===aiPlayer iken return var.
        // Bu yüzden AI için ayrı bir çağrı yapıyoruz:
        await makeMoveForAI(bestMove);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, board, currentPlayer, animating, gameOver]);

  // AI için makeMove (kullanıcı engeli olmadan)
  const makeMoveForAI = async (pitIndex) => {
    if (animating || gameOver) return;

    const playerKey = currentPlayer === 1 ? "player1" : "player2";
    const stones = board[playerKey][pitIndex];
    if (stones === 0) return;

    setAnimating(true);
    setSelectedPit(pitIndex);

    const next = cloneBoard(board);
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

    await sleep(25);

    let extraTurn = false;
    let info = "";

    if (lastPos === "treasure" && lastSide === currentPlayer) {
      extraTurn = true;
      info = "Son taş hazineye düştü. Tekrar oynuyor.";
    } else if (typeof lastPos === "number" && lastSide !== currentPlayer) {
      const oppKey = currentPlayer === 1 ? "player2" : "player1";
      const pitCount = next[oppKey][lastPos];
      if (pitCount % 2 === 0) {
        if (currentPlayer === 1) next.treasure1 += pitCount;
        else next.treasure2 += pitCount;
        next[oppKey][lastPos] = 0;
        info = `${pitCount} taş alındı (çift kuralı).`;
      }
    } else if (typeof lastPos === "number" && lastSide === currentPlayer) {
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
          info = `${total} taş yakalandı.`;
        } else {
          info = "Yakalama yok.";
        }
      }
    }

    setBoard(next);

    if (!finalizeIfGameOver(next)) {
      if (extraTurn) {
        setMessage(`Oyuncu ${currentPlayer} — ${info}`);
      } else {
        const np = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(np);
        setMessage(info ? `${info}\n\nOyuncu ${np}'nin sırası.` : `Oyuncu ${np}'nin sırası.`);
      }
    }

    setAnimating(false);
    setSelectedPit(null);
  };

  const pitsP1 = board.player1;
  const pitsP2 = board.player2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1220] to-[#0E1A2B] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white/80" />
            <h1 className="text-2xl font-bold tracking-tight">Mangala</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* ✅ Mod seçimi */}
            <button
              onClick={() => {
                setMode("PVP");
                resetGame();
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "PVP" ? "bg-white/20" : "bg-white/10 hover:bg-white/15"
              }`}
            >
              2 Kişi
            </button>

            <button
              onClick={() => {
                setMode("AI");
                resetGame();
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "AI" ? "bg-white/20" : "bg-white/10 hover:bg-white/15"
              }`}
            >
              Bilgisayara Karşı
            </button>

            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              Yeniden Başlat
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-black/20 p-4 text-sm whitespace-pre-line">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-300" />
            <span className="font-semibold">
              {gameOver
                ? winner === 0
                  ? "Berabere"
                  : `Kazanan: Oyuncu ${winner}`
                : `Sıradaki: Oyuncu ${currentPlayer}${
                    mode === "AI" && currentPlayer === aiPlayer ? " (AI)" : ""
                  }`}
            </span>
          </div>
          <div className="mt-2 text-white/90">{message}</div>
        </div>

        <div className="mt-6 grid grid-cols-[120px_1fr_120px] gap-4 items-stretch">
          {/* Treasure 2 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center">
            <div className="text-xs text-white/70">Oyuncu 2 Hazine</div>
            <div className="text-4xl font-extrabold mt-2">{board.treasure2}</div>
          </div>

          {/* Board */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            {/* Player 2 pits (top row) */}
            <div className="grid grid-cols-6 gap-3">
              {pitsP2
                .map((v, i) => ({ v, i }))
                .reverse()
                .map(({ v, i }) => (
                  <button
                    key={`p2-${i}`}
                    disabled={
                      animating ||
                      gameOver ||
                      currentPlayer !== 2 ||
                      v === 0 ||
                      (mode === "AI" && currentPlayer === aiPlayer) // ✅ AI oynarken kullanıcı tıklamasın
                    }
                    onClick={() => makeMove(i)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center shadow-sm hover:bg-black/30 disabled:opacity-40"
                    aria-label={`Oyuncu 2 kuyu ${i + 1}`}
                    title={`Kuyu ${i + 1}`}
                  >
                    <div className="text-xs text-white/60 mb-1">Kuyu</div>
                    <div className="text-2xl font-bold">{v}</div>
                  </button>
                ))}
            </div>

            <div className="my-4 h-px bg-white/10" />

            {/* Player 1 pits (bottom row) */}
            <div className="grid grid-cols-6 gap-3">
              {pitsP1.map((v, idx) => (
                <button
                  key={`p1-${idx}`}
                  disabled={animating || gameOver || currentPlayer !== 1 || v === 0}
                  onClick={() => makeMove(idx)}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center shadow-sm hover:bg-black/30 disabled:opacity-40"
                  aria-label={`Oyuncu 1 kuyu ${idx + 1}`}
                  title={`Kuyu ${idx + 1}`}
                >
                  <div className="text-xs text-white/60 mb-1">Kuyu</div>
                  <div className="text-2xl font-bold">{v}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Treasure 1 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center">
            <div className="text-xs text-white/70">Oyuncu 1 Hazine</div>
            <div className="text-4xl font-extrabold mt-2">{board.treasure1}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-white/60">
          Mod: {mode === "AI" ? "Bilgisayara Karşı (AI = Oyuncu 2)" : "2 Kişi"}
        </div>
      </div>
    </div>
  );
}
