import { getElementIcon } from "./Card";
import Image from "next/image";
export const CardPreview = ({ card }) => {
  // console.log("card in preview", card)
  if (!card)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center border-r border-slate-800 bg-slate-950">
        <div className="text-6xl opacity-20 mb-4">🔍</div>
        <p className="text-sm">Hover a card to view details</p>
      </div>
    );

  const isMagic = card.type === "MAGIC";
  const isInstant = card.type === "INSTANT";
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
        <div className="text-[10px] font-bold absolute -top-1 left-2 px-2 py-1  text-gray-300 ">
          {card.name}
        </div>

        <div className="relative w-full h-full mb-4 drop-shadow-lg">
          <Image
            src={card.image}
            alt="gambar kartu"
            fill // <--- Ganti width/height dengan ini
            className="object-cover rounded-md" // Agar gambar proporsional & ngikutin rounded
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Opsional: untuk optimasi performa
          />
        </div>

        {/* <h1 className="text-2xl font-black text-center text-white leading-tight">
          {card.name}
        </h1> */}
      </div>

      {/* Stats Panel */}
      <div className="space-y-4">
        {isMagic || isInstant ? (
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
                {getElementIcon(card?.element)}
                {card?.element}
              </span>
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
            <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30 flex justify-between items-center">
              <span className="text-blue-300 text-sm font-bold">
                ⚔️ Bonus Attack
              </span>
              <span className="text-xl font-bold text-white">
                {card.bonusAtt}
              </span>
            </div>

            {/* Description Lore */}
            <div className="p-2 text-xs text-gray-500 italic text-center border-t border-gray-700 mt-4">
              {card?.desc}

              {/* Tampilkan Cost jika ada */}
              {card?.cost && card.cost.length > 0 && (
                <span className="ml-1 font-bold text-yellow-400">
                  (Cost: {card.cost.join(", ")})
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
