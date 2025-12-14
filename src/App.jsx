import React, { useMemo, useState } from "react";
import { Crown, RotateCcw, Trophy } from "lucide-react";

// -----------------------------
// Constants
// -----------------------------
const INITIAL_BOARD = {
  player1: [4, 4, 4, 4, 4, 4],
  player2: [4, 4, 4, 4, 4, 4],
  treasure1: 0,
  treasure2: 0,
};

const INITIAL_MESSAGE = "Oyuncu 1'in sırası — Kendi tarafınızdaki bir kuyuyu seçin";

// -----------------------------
// Helpers
// -----------------------------
function cloneBoard(board) {
  return {
    player1: [...board.player1],
    player2: [...board.player2],
    treasure1: board.treasure1,
    treasure2: board.treasure2,
  };
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

// -----------------------------
// UI Components
// -----------------------------
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b4bfc6] bg-[#d9def3] px-3 py-1 text-xs font-semibold text-[#1F2937] shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function TopBar({ message }) {
  return (
    <header className="mx-auto mb-6 max-w-5xl px-2 text-center">
      <div className="flex items-center justify-center gap-3">
        <Trophy className="h-8 w-8 text-amber-600" />
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1F2937] sm:text-5xl">
          MANGALA
        </h1>
        <Trophy className="h-8 w-8 text-amber-600" />
      </div>

      <div className="mt-4 inline-flex max-w-3xl items-center justify-center rounded-2xl border border-[#b4bfc6] bg-[#d9def3] px-4 py-3 text-sm font-semibold text-[#1F2937] shadow-sm backdrop-blur">
        <span className="whitespace-pre-line leading-relaxed">{message}</span>
      </div>
    </header>
  );
}

function ScoreCard({ active, label, stones, tone = "blue" }) {
  const toneClasses =
    tone === "blue"
      ? {
          ring: "ring-blue-400/40",
          pill: "bg-blue-50 text-blue-700",
          value: "text-blue-700",
        }
      : {
          ring: "ring-rose-400/40",
          pill: "bg-rose-50 text-rose-700",
          value: "text-rose-700",
        };

  return (
    <div
      className={[
        "rounded-2xl border border-[#b4bfc6] bg-[#d9def3] p-4 shadow-sm backdrop-blur",
        active ? `ring-2 ${toneClasses.ring}` : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${toneClasses.pill}`}>
          {label}
        </span>
        {active && <Badge>Aktif</Badge>}
      </div>
      <div className="mt-3 text-sm text-[#1F2937]">Hazine</div>
      <div className={`text-3xl font-extrabold ${toneClasses.value}`}>{stones}</div>
    </div>
  );
}

function PitButton({ stones, onClick, disabled, selected, tone = "blue", ariaLabel }) {
  const toneClasses =
    tone === "blue"
      ? "border-blue-500/20 bg-white/80 hover:bg-white"
      : "border-rose-500/20 bg-white/80 hover:bg-white";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={[
        "group relative grid h-16 w-16 place-items-center rounded-2xl border shadow-sm transition",
        "focus:outline-none focus:ring-2 focus:ring-[#a1b7ee]/60 focus:ring-offset-2 focus:ring-offset-transparent",
        toneClasses,
        disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5 hover:shadow-sm",
        selected ? "ring-2 ring-[#a1b7ee]/70" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none flex items-center gap-2">
        <span className="text-xl font-extrabold text-[#1F2937]">{stones}</span>
      </div>

      {/* tiny indicator */}
      {!disabled && stones > 0 && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400/90 opacity-80" />
      )}
    </button>
  );
}

function Treasure({ stones, active, tone = "blue" }) {
  const toneClasses =
    tone === "blue"
      ? "from-zinc-900 to-zinc-800"
      : "from-zinc-900 to-zinc-800";

  return (
    <div
      className={[
        "relative flex h-44 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#a1b7ee] shadow-sm",
        toneClasses,
        active ? "ring-2 ring-[#a1b7ee]/50" : "",
      ].join(" ")}
    >
      <div className="text-center">
        <Crown className="mx-auto mb-2 h-8 w-8 text-amber-300" />
        <div className="text-4xl font-extrabold text-[#f0f0f4]">{stones}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#f0f0f4]/70">
          Hazine
        </div>
      </div>
    </div>
  );
}

function RulesCard() {
  return (
    <div className="rounded-2xl border border-[#b4bfc6] bg-[#d9def3] p-4 text-sm text-[#1F2937] shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-extrabold text-[#1F2937]">Hızlı Kurallar</h3>
        <Badge>Saat yönünün tersi</Badge>
      </div>
      <ul className="space-y-1 text-xs leading-relaxed">
        <li>• Taşlar saat yönünün tersine dağıtılır.</li>
        <li>• Rakibin hazinesine taş bırakılmaz.</li>
        <li>• Son taş kendi hazineye düşerse tekrar oynarsın.</li>
        <li>• Son taş boş kuyuya düşerse karşı kuyudaki taşlar yakalanır.</li>
        <li>• Bir tarafın taşları bitince oyun biter; kalan taşlar hazinelere eklenir.</li>
      </ul>
    </div>
  );
}

function GameOverModal({ open, winner, board, onRestart }) {
  if (!open) return null;

  const title =
    winner === 1 ? "Oyuncu 1 Kazandı!" : winner === 2 ? "Oyuncu 2 Kazandı!" : "Berabere!";
  const iconTone = winner === 1 ? "text-blue-600" : winner === 2 ? "text-rose-600" : "text-amber-600";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-xl">
        <div className="text-center">
          <Trophy className={`mx-auto mb-3 h-16 w-16 ${iconTone}`} />
          <h2 className="text-2xl font-extrabold text-[#1F2937]">{title}</h2>

          <div className="mt-4 rounded-2xl bg-[#d9def3] p-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1F2937]">Oyuncu 1 (Hazine)</span>
              <span className="font-extrabold text-[#1F2937]">{board.treasure1}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1F2937]">Oyuncu 2 (Hazine)</span>
              <span className="font-extrabold text-[#1F2937]">{board.treasure2}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1F2937] px-4 py-3 text-sm font-extrabold text-[#f0f0f4] shadow-sm transition hover:bg-[#111827]"
          >
            <RotateCcw className="h-4 w-4" />
            Yeni Oyun
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function MangalaGame() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedPit, setSelectedPit] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState(INITIAL_MESSAGE);

  const activeTone = currentPlayer === 1 ? "blue" : "rose";

  const status = useMemo(() => {
    return {
      p1Empty: board.player1.every((x) => x === 0),
      p2Empty: board.player2.every((x) => x === 0),
    };
  }, [board]);

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(1);
    setSelectedPit(null);
    setGameOver(false);
    setWinner(null);
    setAnimating(false);
    setMessage(INITIAL_MESSAGE);
  };

  const finalizeIfGameOver = (nextBoard) => {
    const p1Empty = nextBoard.player1.every((x) => x === 0);
    const p2Empty = nextBoard.player2.every((x) => x === 0);

    if (!p1Empty && !p2Empty) return false;

    const finalBoard = cloneBoard(nextBoard);

    if (p1Empty) {
      const remaining = sum(finalBoard.player2);
      finalBoard.treasure2 += remaining;
      finalBoard.player2 = [0, 0, 0, 0, 0, 0];
      setMessage(`Oyuncu 1'in taşları bitti. Oyuncu 2 kalan ${remaining} taşı hazineye aldı.`);
    } else {
      const remaining = sum(finalBoard.player1);
      finalBoard.treasure1 += remaining;
      finalBoard.player1 = [0, 0, 0, 0, 0, 0];
      setMessage(`Oyuncu 2'nin taşları bitti. Oyuncu 1 kalan ${remaining} taşı hazineye aldı.`);
    }

    setBoard(finalBoard);
    setGameOver(true);

    if (finalBoard.treasure1 > finalBoard.treasure2) setWinner(1);
    else if (finalBoard.treasure2 > finalBoard.treasure1) setWinner(2);
    else setWinner(0);

    return true;
  };

  const makeMove = async (pitIndex) => {
    if (animating || gameOver) return;

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
    let currentPos = pitIndex - 1;
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

    // small delay for UX
    await new Promise((r) => setTimeout(r, 250));

    let extraTurn = false;
    let info = "";

    // extra turn if last stone in own treasure
    if (lastPos === "treasure" && lastSide === currentPlayer) {
      extraTurn = true;
      info = "Son taş hazineye düştü. Tekrar oynayın.";
    }
    // capture rule (basic)
    else if (typeof lastPos === "number" && lastSide === currentPlayer) {
      const myKey = currentPlayer === 1 ? "player1" : "player2";
      const oppKey = currentPlayer === 1 ? "player2" : "player1";

      // if last landed in empty pit on own side
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
          // your current code: move the single stone to treasure
          if (currentPlayer === 1) next.treasure1 += 1;
          else next.treasure2 += 1;

          next[myKey][lastPos] = 0;
          info = "Son taş hazineye eklendi.";
        }
      }
    }

    setBoard(next);

    if (!finalizeIfGameOver(next)) {
      if (extraTurn) {
        setMessage(`Oyuncu ${currentPlayer} — ${info}`);
      } else {
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer);
        setMessage(info ? `${info}\n\nOyuncu ${nextPlayer}'nin sırası.` : `Oyuncu ${nextPlayer}'nin sırası.`);
      }
    }

    setAnimating(false);
    setSelectedPit(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(253,230,138,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.10),transparent_60%)] bg-[#f0f0f4]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <TopBar message={message} />

        {/* Score row */}
        <div className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-4">
          <ScoreCard
            active={!gameOver && currentPlayer === 1}
            label="Oyuncu 1"
            stones={board.treasure1}
            tone="blue"
          />
          <ScoreCard
            active={!gameOver && currentPlayer === 2}
            label="Oyuncu 2"
            stones={board.treasure2}
            tone="rose"
          />
        </div>

        {/* Board */}
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#b4bfc6] bg-[#d9def3] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Badge>{animating ? "Hamle yapılıyor..." : "Hazır"}</Badge>
            <Badge>{gameOver ? "Oyun Bitti" : `Sıra: Oyuncu ${currentPlayer}`}</Badge>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
            {/* Left treasure (Player 2 on top row visual) */}
            <Treasure stones={board.treasure2} active={!gameOver && currentPlayer === 2} tone="rose" />

            {/* Middle pits */}
            <div className="space-y-6">
              {/* Player 2 row (reversed) */}
              <div className="rounded-2xl border border-[#b4bfc6] bg-white/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2937]">Oyuncu 2 Kuyuları</span>
                  <span className="text-[11px] font-semibold text-[#1F2937]">Dağıtım: ↺</span>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {[...board.player2].reverse().map((stones, idx) => {
                    const actualIndex = 5 - idx;
                    const disabled = gameOver || animating || currentPlayer !== 2;

                    return (
                      <div key={`p2-${actualIndex}`} className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#1F2937]">{actualIndex + 1}</span>
                        <PitButton
                          stones={stones}
                          tone="rose"
                          disabled={disabled}
                          selected={selectedPit === actualIndex && currentPlayer === 2}
                          ariaLabel={`Oyuncu 2 kuyu ${actualIndex + 1}`}
                          onClick={() => makeMove(actualIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center">
                <span className="rounded-full border border-[#b4bfc6] bg-white/60 px-3 py-1 text-[11px] font-bold text-[#1F2937] shadow-sm">
                  Saat yönünün tersi ↺
                </span>
              </div>

              {/* Player 1 row */}
              <div className="rounded-2xl border border-[#b4bfc6] bg-white/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2937]">Oyuncu 1 Kuyuları</span>
                  <span className="text-[11px] font-semibold text-[#1F2937]">Dağıtım: ↺</span>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {board.player1.map((stones, idx) => {
                    const disabled = gameOver || animating || currentPlayer !== 1;

                    return (
                      <div key={`p1-${idx}`} className="flex flex-col items-center gap-2">
                        <PitButton
                          stones={stones}
                          tone="blue"
                          disabled={disabled}
                          selected={selectedPit === idx && currentPlayer === 1}
                          ariaLabel={`Oyuncu 1 kuyu ${idx + 1}`}
                          onClick={() => makeMove(idx)}
                        />
                        <span className="text-[11px] font-semibold text-[#1F2937]">{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right treasure */}
            <Treasure stones={board.treasure1} active={!gameOver && currentPlayer === 1} tone="blue" />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1F2937] px-5 py-3 text-sm font-extrabold text-[#f0f0f4] shadow-sm transition hover:bg-[#111827]"
          >
            <RotateCcw className="h-4 w-4" />
            Yeni Oyun
          </button>

          <RulesCard />
        </div>

        <GameOverModal open={gameOver} winner={winner} board={board} onRestart={resetGame} />
      </div>
    </div>
  );
}
