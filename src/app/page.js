"use client";
import { useEffect, useState } from "react";
import useTCGGame from "../app//hooks/useTCGGame"; // Import Logic
import Card from "../app/components/Card"; // Import UI
import ActiveSlot from "../app/components/ActiveSlot"; // Import UI
import BattleEffect from "../app/components/BattleEffect";
import GameLogPanel from "../app/components/GameLogPanel";
import GraveyardModal from "../app/components/GraveyardModal";
import DeckSlot from "./components/DeckSlot";
import { motion, LayoutGroup } from "framer-motion";

const GraveyardSlot = ({ count, onClick, label, isCom }) => (
  <div
    onClick={onClick}
    className={`w-24 h-32 bg-slate-900/80 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center relative cursor-pointer group hover:border-gray-400 transition ${
      isCom ? "rotate-180" : ""
    }`}
  >
    {/* Visual Tumpukan Kartu jika ada isi */}
    {count > 0 && (
      <>
        <div className="absolute top-1 left-1 w-full h-full bg-slate-800 border border-slate-600 rounded-lg -z-10 rotate-3"></div>
        <div className="absolute top-2 left-2 w-full h-full bg-slate-800 border border-slate-600 rounded-lg -z-20 rotate-6"></div>
      </>
    )}

    <span className="text-2xl group-hover:scale-125 transition">⚰️</span>
    <span className="text-[10px] font-bold text-gray-500 mt-1">{label} GY</span>
    <span className="text-xl font-bold text-white">{count}</span>
  </div>
);
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

        <div className="text-8xl mb-4 drop-shadow-lg">{card.image}</div>

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
  const [boardScale, setBoardScale] = useState(1);
  // State untuk Modal Graveyard
  const [showGraveyard, setShowGraveyard] = useState(false);
  const [viewingGraveyardOf, setViewingGraveyardOf] = useState("PLAYER"); // "PLAYER" atau "COM"

  // Helper buka modal
  const openGraveyard = (who) => {
    setViewingGraveyardOf(who);
    setShowGraveyard(true);
  };

  useEffect(() => {
    const handleResize = () => {
      // 1. Tentukan ukuran "Ideal" Papan Permainan kita
      // Anggap saja kita desain papan ini biar cantik di ukuran 1200x900 piksel
      const BASE_WIDTH = 1200;
      const BASE_HEIGHT = 900;

      // 2. Hitung ruang yang tersedia di layar user
      // Kurangi 320px untuk sidebar kiri (jika ada), dan sedikit padding (40px)
      const availableWidth =
        window.innerWidth - (window.innerWidth >= 1280 ? 340 : 20);
      const availableHeight = window.innerHeight - 40; // Kurangi padding atas/bawah

      // 3. Hitung persentase Zoom yang dibutuhkan
      const scaleX = availableWidth / BASE_WIDTH;
      const scaleY = availableHeight / BASE_HEIGHT;

      // Pilih yang paling kecil agar muat di kedua sisi (Fit to Screen)
      // Math.min(..., 1) artinya jangan pernah zoom in lebih dari 100% (biar gak pecah)
      const newScale = Math.min(scaleX, scaleY, 1);

      setBoardScale(newScale);
    };

    // Jalankan saat pertama load & saat window di-resize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const isFusionDisabled =
        !isCom && gameState.selectedFusionCard && cards[i]?.isReady === false;
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
              isDisabled={isFusionDisabled}
              // Prop Baru: Apakah kartu ini terpilih jadi tumbal?
              isSacrificeSelected={isSacrifice}
              // Label aksi
              actionLabel={
                !isCom && !isFusionDisabled
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

  // --- TAMPILAN 3: GAMEPLAY UTAMA (SCALED LAYOUT) ---
  return (
    // Container Luar: Full Screen & Tidak Boleh Scroll (Overflow Hidden)
    <div className="h-screen w-screen bg-slate-950 text-gray-100 flex overflow-hidden font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      {/* 1. SIDEBAR KIRI (PREVIEW) - Tetap Full Height & Tidak Ikut di-Scale */}
      <div className="w-80 shrink-0 relative z-40 hidden xl:block border-r border-slate-800 bg-slate-900 h-full">
        <CardPreview card={inspectedCard} />
      </div>

      {/* 2. AREA TENGAH (WRAPPER FLEX) */}
      {/* Area ini tugasnya menengahkan papan permainan */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/20">
        {/* === THE SCALABLE BOARD === */}
        {/* Ini adalah papan "virtual" yang ukurannya dipaksa TETAP (Fixed) 
            tapi di-zoom in/out menggunakan style transform: scale() 
        */}
        <LayoutGroup>
        <div
          style={{
            width: "1200px", // Lebar Tetap
            height: "900px", // Tinggi Tetap
            transform: `scale(${boardScale})`, // Magic terjadi di sini
          }}
          className="origin-center transition-transform duration-200 ease-out flex flex-col relative bg-slate-900/40 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden ring-1 ring-white/10"
        >
          <BattleEffect
            active={gameState.isAttacking}
            attacker={gameState.attackerName}
          />

          {/* Tombol Audio & Logs */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button className="bg-slate-800/80 p-2 rounded-full text-xs hover:text-white backdrop-blur">
              🔊
            </button>
            {!showLogs && (
              <button
                className="bg-slate-800/80 p-2 rounded-full text-xs hover:text-white backdrop-blur"
                onClick={() => setShowLogs(true)}
              >
                📜
              </button>
            )}
          </div>

          {/* === ZONE COM (ATAS) === */}
          <div className="flex-1 p-4 flex flex-col items-center justify-start relative border-b border-slate-700/50">
            {/* Score COM */}
            <div className="absolute top-6 left-6 flex items-center bg-red-950/80 border border-red-800 px-3 py-1 rounded-full shadow-lg z-10">
              <span className="text-red-400 font-bold mr-2 text-xs">COM</span>
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < gameState.playerKO ? "bg-red-500" : "bg-red-900/50"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            {/* Hand COM */}
            <div className="absolute -top-12 hover:-top-2 transition-all duration-300 flex gap-1 p-2 bg-black/60 rounded-b-xl z-20">
              {com.hand.map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-20 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded shadow-lg"
                />
              ))}
            </div>
            {/* Board COM */}
            <div className="grid grid-cols-5 gap-3 mt-12 items-end">
              {renderBench(com.bench, true)}
              <div className="col-span-5 flex justify-center gap-8 mb-4">
                <DeckSlot count={com.deck.length} label="COM" isCom={true} />
                <div className="transform rotate-180">
                  <ActiveSlot
                    card={com.active}
                    label="COM"
                    onHover={setInspectedCard}
                  />
                </div>
                <div className="transform rotate-180">
                  <GraveyardSlot
                    count={com.graveyard.length}
                    label="COM"
                    isCom={true}
                    onClick={() => openGraveyard("COM")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* === ZONE INFO (TENGAH) === */}
          <div className="h-20 bg-black/60 flex items-center justify-center gap-12 px-8 border-y border-slate-600/50 backdrop-blur-md z-20 relative shrink-0">
            <div className="flex flex-col items-center min-w-[150px]">
              <span className="text-[10px] text-gray-400 tracking-widest font-bold">
                STATUS
              </span>
              {gameState.selectedFusionCard ? (
                <span className="text-yellow-400 font-bold text-sm animate-pulse bg-yellow-900/30 px-3 py-1 rounded border border-yellow-500/50 mt-1">
                  {getFusionRequirementText()}
                </span>
              ) : (
                <span
                  className={`text-2xl font-black tracking-wider ${
                    gameState.turn === "PLAYER"
                      ? "text-blue-400 drop-shadow-lg"
                      : "text-red-400"
                  }`}
                >
                  {gameState.turn === "PLAYER" ? "YOUR TURN" : "THINKING..."}
                </span>
              )}
            </div>
            <div>
              {gameState.turn === "PLAYER" && player.active && com.active ? (
                <button
                  onClick={actions.attack}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-black py-3 px-10 rounded-full shadow-lg hover:scale-110 transition text-lg border-2 border-red-400/20"
                >
                  ⚔️ ATTACK
                </button>
              ) : gameState.turn === "PLAYER" ? (
                <button
                  onClick={actions.endTurn}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full border border-slate-500 shadow-lg"
                >
                  END TURN
                </button>
              ) : null}
            </div>
          </div>

          {/* === ZONE PLAYER (BAWAH) === */}
          <div className="flex-1 p-4 flex flex-col items-center justify-end relative">
            {/* Score Player */}
            <div className="fixed bottom-6 right-6 flex items-center bg-blue-950/80 border border-blue-800 px-3 py-1 rounded-full shadow-lg z-0">
              <span className="text-blue-400 font-bold mr-2 text-xs">YOU</span>
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < gameState.comKO
                        ? "bg-blue-500 shadow-blue"
                        : "bg-blue-900/50"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Grid Player */}
            <div className="grid grid-cols-5 gap-3 mb-6 items-start relative z-10">
              <div className="col-span-5 flex justify-center gap-8 mt-4 max-w-100">
                <GraveyardSlot
                  count={player.graveyard.length}
                  label="PLAYER"
                  onClick={() => openGraveyard("PLAYER")}
                />
                <div
                  onClick={actions.handleActiveClick}
                  className={`transition ${
                    gameState.selectedMagicCard && player.active
                      ? "cursor-pointer ring-4 ring-purple-500 rounded-lg animate-pulse"
                      : ""
                  }`}
                >
                  <ActiveSlot
                    card={player.active}
                    label="PLAYER"
                    onHover={setInspectedCard}
                  />
                </div>
                {player.deck.map((card, index) => (
                  <div
                    key={card.id}
                    style={{
                      position: "absolute",
                      top: 20, // Efek tumpukan (sedikit geser ke bawah)
                      right: 80, // Efek tumpukan (sedikit geser ke kanan)
                      zIndex: index, // Kartu teratas harus paling atas layer-nya
                    }}
                  >
                    {/* INI KUNCINYA: CardBack punya layoutId yang sama dengan CardFront */}
                    <DeckSlot
                      count={player.deck.length}
                      label="PLAYER"
                      card={card}
                    />
                  </div>
                ))}
              </div>
              {renderBench(player.bench)}
            </div>

            {/* === PLAYER HAND (Dalam Container Fixed) === */}
            {/* Tidak perlu mt-auto karena container ini sudah fixed height, kita posisikan manual agar pas */}
            <div className="w-full relative z-50 -mb-2">
              <div className="flex justify-center items-end gap-2 px-4 h-28 overflow-visible pb-4">
                {player.hand.length === 0 && (
                  <span className="text-slate-500 text-xs font-bold mb-10 bg-black/50 px-3 py-1 rounded">
                    Hand Empty
                  </span>
                )}
                {player.hand.map((c) => (
                  <div
                    key={c.id}
                    className="relative transition-all duration-300 ease-out scale-100 translate-y-6 hover:-translate-y-20 hover:scale-125 hover:z-[100] origin-bottom cursor-pointer"
                  >
                    <Card
                      data={c}
                      onClick={actions.handleHandClick}
                      onHover={setInspectedCard}
                      isSelected={
                        gameState.selectedMagicCard?.id === c.id ||
                        gameState.selectedFusionCard?.id === c.id
                      }
                      actionLabel={
                        c.type === "MAGIC"
                          ? "USE"
                          : c.type === "INSTANT"
                          ? "CAST" // Label Baru
                          : c.type === "FUSION"
                          ? "SUMMON"
                          : "PLAY"
                      }
                    />
                  </div>
                ))}
              </div>
              {/* Gradient Hand */}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-slate-900/90 to-transparent pointer-events-none -z-10 rounded-b-3xl"></div>
            </div>
          </div>
        </div>
        </LayoutGroup>
        {/* End of SCALABLE BOARD */}
      </div>

      {/* 3. SIDEBAR KANAN (LOGS) */}
      <GameLogPanel
        logs={gameState.logs}
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
      />
      <GraveyardModal
        isOpen={showGraveyard}
        onClose={() => setShowGraveyard(false)}
        cards={
          viewingGraveyardOf === "PLAYER" ? player.graveyard : com.graveyard
        }
        title={
          viewingGraveyardOf === "PLAYER" ? "YOUR GRAVEYARD" : "ENEMY GRAVEYARD"
        }
        onHover={setInspectedCard} // Sambungkan ke Preview Sidebar
      />
    </div>
  );
}
