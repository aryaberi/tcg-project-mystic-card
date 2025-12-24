// components/Card.js
import { motion } from "framer-motion";
import Image from "next/image";

export const getElementIcon = (el) => {
  switch (el) {
    case "Fire":
      return "🔥";
    case "Grass":
      return "🌿";
    case "Water":
      return "💧";
    case "Earth":
      return "🪨";
    case "Wind":
      return "🌪️";
    default:
      return "⭐";
  }
};
export default function Card({
  data,
  onClick,
  onHover,
  actionLabel,
  isSelected,
  isTargetMode,
  isSacrificeSelected,
  isDisabled,
  isback = false,
  isCom,
  count,
  label,
  isGraveyard = false,
  isInActive = false,
  isComHand = false,
  isInHand = false,
}) {
  const isMagic = data?.type === "MAGIC";
  const isFusion = data?.type === "FUSION"; // Tipe Baru
  const isInstant = data?.type === "INSTANT"; // Tipe Baru
  const isFrozen = data?.isFrozen;

  console.log("data cost", data?.image);

  // Style Khusus Fusion (Gold)
  let borderClass = "border-gray-600";
  let bgClass = "bg-slate-800";

  if (isMagic) {
    borderClass = "border-purple-400";
    bgClass = "bg-slate-900";
  } else if (isFusion) {
    borderClass = "border-yellow-500 border-2";
    bgClass = "bg-yellow-950";
  } else if (isInstant) {
    // Style untuk Instant: CYAN
    borderClass = "border-cyan-400 border-2";
    bgClass = "bg-cyan-950";
  }

  // Effect Visual saat dipilih sebagai tumbal
  const sacrificeEffect = isSacrificeSelected
    ? "ring-4 ring-red-600 grayscale opacity-80"
    : "";
  const disabledStyle = isDisabled
    ? "opacity-40 grayscale cursor-not-allowed"
    : "";

  return (
    <motion.div
      key={data?.id}
      layoutId={data?.id}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full h-full"
    >
      {isback ? (
        <div
          className={`w-24 h-32 bg-slate-800/80 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center relative shadow-xl ${
            isCom ? "transform rotate-180" : ""
          }`}
        >
          <div className=" flex flex-col items-center">
            <Image
              src="/Image/Back_Card.png"
              alt="belakang kartu"
              width={500} // Sesuaikan ukurannya
              height={300}
            />
          </div>
          <div className="w-10 h-1 bg-gray-500 mt-2 rounded-full"></div>
        </div>
      ) : isInActive ? (
        <div
          className={`w-full h-full p-2 bg-slate-800 rounded flex flex-col items-center animate-pulse-once ${
            isFrozen ? "opacity-70 grayscale" : ""
          }`}
        >
          {/* ICON ABILITY (Pojok Kiri Atas) */}
          <div className="flex justify-between items-start w-full relative z-10 h-5">
            {/* KIRI ATAS: HP */}
            {/* {!isMagic && !isFusion && !isInstant && (
              
            )} */}

            {/* TENGAH: NAMA */}
            <div className="w-full text-center px-4">
              <div className="text-[9px] font-bold text-gray-200 leading-tight truncate">
                {data?.name}
              </div>
            </div>

            {/* KANAN ATAS: ELEMENT ICON */}
            <div className="absolute -right-1 -top-3  rounded-bl-lg p-0.5">
              <span className="text-[8px]">
                {getElementIcon(data?.element)}
              </span>
            </div>
          </div>

          {/* 2. IMAGE AREA */}
          <div className="w-full h-12 bg-gray-700 my-0.5 overflow-hidden flex items-center justify-center relative border border-gray-600 rounded-sm">
            <Image
              src={data.image}
              alt="gambar kartu"
              fill // <--- Ganti width/height dengan ini
              className="object-cover rounded-md" // Agar gambar proporsional & ngikutin rounded
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Opsional: untuk optimasi performa
            />
          </div>

          {/* STATUS FROZEN (Overlay Besar) */}
          {isFrozen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/20 rounded font-black text-blue-200 tracking-widest text-sm rotate-[-15deg] border-2 border-blue-400">
              RECHARGE
            </div>
          )}

          <div className="mt-1 w-full">
            {/* ... (HP Bar & Stats sama seperti sebelumnya) ... */}
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-green-400">
                HP {data.hp}/{data.maxHp}
              </span>
              <span className="text-red-400">
                ATK {data.att + (data.bonusAtt || 0)}
              </span>
            </div>
            {/* Indikator Buff di Active Slot */}
            {(data.defense > 0 || data.bonusAtt > 0) && (
              <div className="text-[10px] text-center bg-gray-700 rounded mb-1 text-yellow-300">
                {data.bonusAtt > 0 && `⚔️+${data.bonusAtt} `}
                {data.defense > 0 && `🛡️+${data.defense}`}
              </div>
            )}

            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (data.hp / data.maxHp) * 100)}%`,
                }}
              ></div>
            </div>
            <div className="h-8 mt-1 flex-1 bg-gray-800/40 border border-gray-600/50 rounded p-0.5 text-[7px] text-gray-300 leading-tight overflow-hidden">
              {data?.desc || "No effect."}
            </div>
          </div>
        </div>
      ) : isComHand ? (
        <div
          key={data?.id}
          className={`w-20 h-30 bg-slate-800/80 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center relative shadow-xl ${
            isCom ? "transform rotate-180" : ""
          }`}
        >
          <div className=" flex flex-col items-center">
            <Image
              src="/Image/Back_Card.png"
              alt="belakang kartu"
              width={500} // Sesuaikan ukurannya
              height={300}
            />
          </div>
        </div>
      ) : (
        <div
          onClick={() => onClick && onClick(data)}
          onMouseEnter={() => onHover && onHover(data)}
          className={`
    w-24 h-32 rounded-md p-1 flex flex-col relative group shadow-md transition-all select-none
    ${borderClass} ${bgClass} ${sacrificeEffect}
    ${isSelected ? "ring-4 ring-yellow-400 scale-110 z-20" : ""}
    ${
      !isSelected && !isMagic && !isSacrificeSelected && isTargetMode
        ? "ring-2 ring-purple-500 animate-pulse hover:scale-110 z-10 cursor-pointer"
        : "hover:scale-105 cursor-pointer"
    }
    ${isDisabled ? "grayscale opacity-80" : ""}
  `}
        >
          {/* --- LAYOUT UTAMA --- */}

          {/* 1. HEADER (HP - NAMA - ELEMENT) */}
          <div className="flex justify-between items-start w-full relative z-10 h-5">
            {/* KIRI ATAS: HP */}
            {/* {!isMagic && !isFusion && !isInstant && (
              
            )} */}

            {/* TENGAH: NAMA */}
            <div className="w-full text-center px-4">
              <div className="text-[9px] font-bold text-gray-200 leading-tight truncate">
                {data?.name}
              </div>
            </div>

            {/* KANAN ATAS: ELEMENT ICON */}
            <div className="absolute -right-1 -top-3  rounded-bl-lg p-0.5">
              <span className="text-[8px]">
                {isMagic || isInstant ? "✨" : getElementIcon(data?.element)}
              </span>
            </div>
          </div>

          {/* 2. IMAGE AREA */}
          <div className="w-full h-12 bg-gray-700 my-0.5 overflow-hidden flex items-center justify-center relative border border-gray-600 rounded-sm">
            <Image
              src={data?.image}
              alt="gambar kartu"
              fill // <--- Ganti width/height dengan ini
              className="object-cover rounded-md" // Agar gambar proporsional & ngikutin rounded
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Opsional: untuk optimasi performa
            />

            {/* Tanda Tumbal (Overlay Image) */}
            {isSacrificeSelected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-red-500 font-bold text-xl z-20">
                ☠️
              </div>
            )}
          </div>

          {/* 3. ATTACK (Di Bawah Image, Sebelah Kiri) */}
          {!isMagic && !isInstant && (
            <div className="flex items-center justify-center -ml-1 mb-1">
              {/* Icon Attack Existing */}
              <span className="text-red-400 text-sm">
                ⚔️{data?.att + (data?.bonusAtt || 0)}
              </span>

              <span className="text-green-500 text-sm">❤️{data?.hp}</span>
              {/* Indikator Buff (Opsional) */}
              {(data?.bonusAtt || 0) > 0 && (
                <span className="text-[8px] text-green-400 ml-0.5">+</span>
              )}
            </div>
          )}

          {/* 4. DESCRIPTION BOX (Kotak Abu di Bawah) */}
          <div className="flex-1 bg-gray-800/40 border border-gray-600/50 rounded p-0.5 text-[7px] text-gray-300 leading-tight overflow-hidden">
            {data?.desc || "No effect."}
          </div>

          {/* 5. FOOTER / WEAKNESS (Pojok Kiri Bawah - Absolute) */}
          {!isMagic && data?.weakness && (
            <div className="absolute -bottom-1 -left-1 bg-gray-200/90 text-black px-1.5 py-0.5 rounded-tr-lg rounded-bl-md flex items-center shadow-sm z-10">
              <span className="text-[6px] font-bold mr-0.5">Weak</span>
              <span className="text-[10px] leading-none">
                {getElementIcon(data.weakness)}
              </span>
            </div>
          )}

          {/* --- STATUS OVERLAYS (ZZZ & BOSS) --- */}

          {/* Indikator "ZZZ" (Sleep) */}
          {isDisabled && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 px-2 py-1 rounded text-xs font-bold text-gray-300">
              zzz
            </div>
          )}

          {/* Badge Fusion / Boss */}
          {isFusion && isInHand && (
            <div className="absolute -bottom-2 -right-2 text-[8px] bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border border-white">
              {data.cost.map((cost, index) => (
                // PENTING: Bungkus dalam elemen (span/div) dan kasih Key
                <span key={index} className="text-[10px] leading-none ml-0.5">
                  {getElementIcon(cost)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
