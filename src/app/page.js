"use client";
import { useEffect, useState } from "react";
import useTCGGame from "../app//hooks/useTCGGame"; // Import Logic
import Card from "../app/components/Card"; // Import UI
import ActiveSlot from "../app/components/ActiveSlot"; // Import UI
import BattleEffect from "../app/components/BattleEffect";
import GameLogPanel from "../app/components/GameLogPanel";

const CardPreview = ({ card }) => {
  if (!card)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center border-r border-slate-800 bg-slate-950">
        <div className="text-6xl opacity-20 mb-4">🔍</div>
        <p className="text-sm">Hover a card to view details</p>
      </div>
    );

  const isMagic = card.type === "MAGIC";
  const totalAtt = (card.att || 0) + (card.bonusAtt || 0);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-slate-900 border-r border-slate-700 shadow-2xl overflow-y-auto">
      <h2 className="text-gray-400 text-xs font-bold mb-2 tracking-widest">
        CARD DETAILS
      </h2>

      {/* Tampilan Kartu Besar */}
      <div
        className={`w-full aspect-[3/4] rounded-xl border-4 shadow-2xl mb-6 relative flex flex-col items-center justify-center p-4
              ${
                isMagic
                  ? "border-purple-500 bg-slate-800"
                  : "border-slate-500 bg-slate-800"
              }
          `}
      >
        <div className="text-xs font-bold absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-gray-300">
          {isMagic ? "SPELL CARD" : `${card.element.toUpperCase()} MONSTER`}
        </div>

        <div className="text-8xl mb-4 drop-shadow-lg">
          {card.type === "MAGIC"
            ? card.image
            : card.element === "Fire"
            ? "🔥"
            : card.element === "Water"
            ? "💧"
            : "🌿"}
        </div>

        <h1 className="text-2xl font-black text-center text-white leading-tight">
          {card.name}
        </h1>
      </div>

      {/* Stats Panel */}
      <div className="space-y-4">
        {isMagic ? (
          <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50">
            <h3 className="text-purple-300 font-bold mb-1">Magic Effect</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ) : (
          <>
            {/* HP & Attack Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-900/30 p-3 rounded border border-red-500/30 flex flex-col items-center">
                <span className="text-red-400 text-xs font-bold">ATTACK</span>
                <span className="text-3xl font-black text-white">
                  {totalAtt}
                </span>
                {card.bonusAtt > 0 && (
                  <span className="text-xs text-yellow-400">
                    (+{card.bonusAtt} Buff)
                  </span>
                )}
              </div>
              <div className="bg-green-900/30 p-3 rounded border border-green-500/30 flex flex-col items-center">
                <span className="text-green-400 text-xs font-bold">HEALTH</span>
                <span className="text-3xl font-black text-white">
                  {card.hp}
                </span>
                <span className="text-xs text-gray-400">
                  / {card.maxHp} Max
                </span>
              </div>
            </div>

            {/* Defense Status */}
            <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30 flex justify-between items-center">
              <span className="text-blue-300 text-sm font-bold">
                🛡️ Defense
              </span>
              <span className="text-xl font-bold text-white">
                {card.defense}
              </span>
            </div>

            {/* Description Lore */}
            <div className="p-2 text-xs text-gray-500 italic text-center border-t border-gray-700 mt-4">
              "A dangerous creature from the {card.element} lands."
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Komponen Visual Deck (Internal) ---
const DeckSlot = ({ count, label, isCom }) => (
  <div
    className={`w-24 h-32 bg-slate-800/80 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center relative shadow-xl ${
      isCom ? "transform rotate-180" : ""
    }`}
  >
    <div className="absolute top-[-4px] left-[2px] w-full h-full bg-slate-700/60 border border-slate-600 rounded-lg -z-10"></div>
    <div className="absolute top-[-8px] left-[4px] w-full h-full bg-slate-700/40 border border-slate-600 rounded-lg -z-20"></div>
    <span
      className={`text-gray-400 text-xs font-bold mb-1 ${
        isCom ? "transform rotate-180" : ""
      }`}
    >
      {label} DECK
    </span>
    <span
      className={`text-3xl font-bold text-white ${
        isCom ? "transform rotate-180" : ""
      }`}
    >
      {count}
    </span>
    <div className="w-10 h-1 bg-gray-500 mt-2 rounded-full"></div>
  </div>
);

// --- Komponen Placeholder Slot Kosong ---
const EmptyBenchSlot = () => (
  <div className="w-24 h-32 bg-black/20 border-2 border-dashed border-slate-600/50 rounded-lg flex items-center justify-center">
    <span className="text-slate-600 text-xs font-bold">Empty</span>
  </div>
);

export default function TCGGame() {
  const { gameState, player, com, actions } = useTCGGame();

  const [hasStarted, setHasStarted] = useState(false);
  const [inspectedCard, setInspectedCard] = useState(null);
  const [showLogs, setShowLogs] = useState(true);
  // Fungsi untuk memulai game via tombol (Solusi Audio)
  const handleStartGame = () => {
    setHasStarted(true);
    actions.startNewGame(); // Karena dipanggil lewat klik tombol, BGM akan jalan!
  };

  const getFusionRequirementText = () => {
    if (!gameState.selectedFusionCard) return "";

    let reqs = [...gameState.selectedFusionCard.cost];
    // Coret yang sudah dipilih
    gameState.fusionSacrifices.forEach((s) => {
      const idx = reqs.indexOf(s.element);
      if (idx !== -1) reqs[idx] = "✅"; // Ganti jadi centang
    });

    return `SACRIFICE NEEDED: [ ${reqs.join(" + ")} ]`;
  };

  // --- TAMPILAN 1: LAYAR START (Overlay) ---
  if (!hasStarted) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="text-center space-y-6 p-10 bg-black/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-500">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
            MYSTICAL TCG
          </h1>
          <p className="text-gray-300">Strategy Card Battle</p>

          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xl font-bold hover:scale-105 transition shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          >
            ▶ START GAME
          </button>
          <p className="text-xs text-gray-500 animate-pulse">
            Click Start to enable Audio
          </p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: GAME OVER ---
  if (gameState.winner) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-bold mb-4 animate-bounce">
          {gameState.winner === "PLAYER" ? "🏆 YOU WIN! 🏆" : "💀 GAME OVER 💀"}
        </h1>
        <button
          onClick={actions.startNewGame}
          className="bg-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-500 transition hover:scale-110"
        >
          Play Again
        </button>
      </div>
    );
  }

  // Helper untuk mengisi slot bench yang kosong
  const renderBench = (cards, isCom = false) => {
    const slots = [];
    for (let i = 0; i < 5; i++) {
      const isSacrifice =
        !isCom && gameState.fusionSacrifices.some((s) => s.id === cards[i]?.id);
      if (cards[i]) {
        slots.push(
          <div
            key={cards[i].id}
            className={isCom ? "transform rotate-180" : ""}
          >
            <Card
              data={cards[i]}
              onClick={!isCom ? actions.handleBenchClick : undefined}
              onHover={setInspectedCard}
              // Logic Target Mode: Magic OR Fusion
              isTargetMode={
                !isCom &&
                (gameState.selectedMagicCard !== null ||
                  gameState.selectedFusionCard !== null)
              }
              // Prop Baru: Apakah kartu ini terpilih jadi tumbal?
              isSacrificeSelected={isSacrifice}
              // Label aksi
              actionLabel={
                !isCom
                  ? gameState.selectedFusionCard
                    ? isSacrifice
                      ? "CANCEL"
                      : "SACRIFICE"
                    : gameState.selectedMagicCard
                    ? "TARGET"
                    : !player.active
                    ? "MAJU"
                    : undefined
                  : undefined
              }
            />
          </div>
        );
      } else {
        slots.push(<EmptyBenchSlot key={`empty-${i}`} />);
      }
    }
    return slots;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-row overflow-hidden font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-80 h-screen shrink-0 relative z-30">
        <CardPreview card={inspectedCard} />
      </div>

      {/* --- KANAN: GAME BOARD (Sisa Layar) --- */}
      <div className="flex-1 flex flex-col relative h-screen">
        <BattleEffect
          active={gameState.isAttacking}
          attacker={gameState.attackerName}
        />
        <div className="absolute top-4 right-4 z-50">
          <button
            className="bg-slate-800 p-2 rounded-full text-xs text-gray-400 hover:text-white"
            onClick={() => {
              // Logic mute sederhana (optional)
              alert(
                "Fitur mute bisa ditambahkan dengan memodifikasi SoundManager :)"
              );
            }}
          >
            🔊 Music On/Off
          </button>
        </div>
        {!showLogs && (
          <div className="absolute top-4 right-45 z-50">
          <button
            className="bg-slate-800 p-2 rounded-full text-xs text-gray-400 hover:text-white"
            onClick={() => setShowLogs(true)}
          >
            📜 LOGS
          </button>
        </div>
        )}
        {/* === ZONE COM (ATAS) === */}
        <div className="flex-1 p-4 flex flex-col items-center justify-start relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/50 backdrop-blur-sm">
          {/* Score COM */}
          <div className="absolute top-4 left-6 flex items-center bg-red-950/80 border border-red-800 px-4 py-2 rounded-full shadow-lg">
            <span className="text-red-400 font-bold mr-2">COM SCORE</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < gameState.comKO
                      ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                      : "bg-red-900/50"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* COM Hand (Kartu Terbalik) */}
          <div className="absolute top-[-60px] hover:top-[-10px] transition-all duration-300 flex gap-1 p-2 bg-black/40 rounded-b-xl backdrop-blur-md z-20">
            {com.hand.map((_, i) => (
              <div
                key={i}
                className="w-16 h-24 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded shadow-lg"
              />
            ))}
          </div>

          {/* --- GRID LAYOUT COM --- */}
          <div className="grid grid-cols-5 gap-4 mt-16 items-end">
            {/* Baris Belakang (Bench) */}
            {renderBench(com.bench, true)}
            {/* Baris Depan (Active & Deck) */}
            <div className="col-span-5 flex justify-center gap-12 mb-4">
              {/* Deck COM */}
              <DeckSlot count={com.deck.length} label="COM" isCom={true} />
              {/* Active COM */}
              <div className="transform rotate-180">
                <ActiveSlot
                  card={com.active}
                  label="COM"
                  onHover={setInspectedCard}
                />
              </div>
              {/* Slot Kosong (Graveyard/Extra) - Opsional */}
              <div className="w-24 h-32 bg-black/10 border-2 border-dashed border-slate-700/30 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* === ZONE INFO (TENGAH) === */}
        <div className="h-20 bg-black/60 flex items-center justify-between px-10 border-y border-slate-700/50 backdrop-blur-md z-10 shadow-[0_0_30px_rgba(0,0,0,1)] relative">
          {/* Status Turn */}
          <div className="flex flex-col items-start">
            <span className="text-xs text-slate-400 tracking-widest mb-1">
              GAME STATUS
            </span>
            <span
              className={`text-2xl font-black tracking-wider ${
                gameState.turn === "PLAYER"
                  ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                  : "text-red-400 animate-pulse"
              }`}
            >
              {gameState.turn === "PLAYER" ? "YOUR TURN" : "COM THINKING..."}
              {gameState.selectedFusionCard && (
                <span className="text-yellow-400 font-bold text-xs animate-pulse bg-black/50 px-2 rounded mt-1 border border-yellow-500">
                  {getFusionRequirementText()}
                </span>
              )}
            </span>
          </div>

          {/* Tombol Aksi Tengah */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            {gameState.turn === "PLAYER" && player.active && com.active ? (
              <button
                onClick={actions.attack}
                className="group relative bg-gradient-to-r from-red-600 to-orange-600 text-white font-black py-4 px-12 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] hover:scale-110 transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  ⚔️ <span className="tracking-wider">ATTACK!</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            ) : gameState.turn === "PLAYER" ? (
              <button
                onClick={actions.endTurn}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-full border border-slate-500 shadow-lg hover:shadow-xl transition-all"
              >
                END TURN
              </button>
            ) : null}
          </div>

          {/* Log Box */}
          <div className="w-72 h-16 bg-black/50 rounded p-2 text-[10px] font-mono text-green-400/80 overflow-hidden flex flex-col-reverse shadow-inner border border-white/5">
            {gameState.logs.map((l, i) => (
              <div key={i} className="truncate leading-tight">{`> ${l}`}</div>
            ))}
          </div>
        </div>

        {/* === ZONE PLAYER (BAWAH) === */}
        <div className="flex-1 p-4 flex flex-col items-center justify-end relative border-t border-slate-800/80 bg-gradient-to-t from-slate-950/90 to-slate-900/50 backdrop-blur-sm">
          {/* Score Player */}
          <div className="absolute bottom-4 right-6 flex items-center bg-blue-950/80 border border-blue-800 px-4 py-2 rounded-full shadow-lg">
            <span className="text-blue-400 font-bold mr-2">PLAYER SCORE</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < gameState.playerKO
                      ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                      : "bg-blue-900/50"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* --- GRID LAYOUT PLAYER --- */}
          <div className="grid grid-cols-5 gap-4 mb-8 items-start">
            {/* Baris Depan (Active & Deck) */}
            <div className="col-span-5 flex justify-center gap-12 mt-4">
              {/* Slot Kosong (Graveyard/Extra) */}
              <div className="w-24 h-32 bg-black/10 border-2 border-dashed border-slate-700/30 rounded-lg"></div>
              {/* Active Player */}
              <div
                onClick={actions.handleActiveClick}
                className={`transition ${
                  gameState.selectedMagicCard && player.active
                    ? "cursor-pointer ring-4 ring-purple-500 rounded-lg animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                    : ""
                }`}
              >
                <ActiveSlot
                  card={player.active}
                  label="PLAYER"
                  onHover={setInspectedCard}
                />
              </div>
              <DeckSlot count={player.deck.length} label="PLAYER" />
            </div>
            {/* Baris Belakang (Bench) */}
            {renderBench(player.bench)}
          </div>

          {/* Player Hand */}
          <div className="absolute -bottom-30 hover:bottom-[-10px] transition-all duration-300 flex justify-center w-full z-20 py-4">
            <div className="flex gap-2 px-4 py-3 bg-black/60 rounded-t-2xl backdrop-blur-md border-t border-slate-700/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {player.hand.length === 0 && (
                <span className="text-slate-500 text-sm font-bold px-4 py-2">
                  Hand Empty
                </span>
              )}
              {player.hand.map((c) => (
                <div
                  key={c.id}
                  className="hover:-translate-y-12 hover:scale-110 transition-all duration-300 origin-bottom cursor-grab active:cursor-grabbing"
                >
                  <Card
                    data={c}
                    onClick={actions.handleHandClick}
                    onHover={setInspectedCard}
                    // Highlight jika ini kartu fusion yang sedang aktif
                    isSelected={
                      gameState.selectedMagicCard?.id === c.id ||
                      gameState.selectedFusionCard?.id === c.id
                    }
                    actionLabel={
                      c.type === "MAGIC"
                        ? "USE"
                        : c.type === "FUSION"
                        ? "SUMMON"
                        : "PLAY"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <GameLogPanel 
        logs={gameState.logs} 
        isOpen={showLogs} 
        onClose={() => setShowLogs(false)} 
      />
    </div>
  );
}
