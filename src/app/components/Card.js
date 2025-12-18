// components/Card.js
export default function Card({ data, onClick, onHover, actionLabel, isSelected, isTargetMode, isSacrificeSelected }) {
  const isMagic = data.type === "MAGIC";
  const isFusion = data.type === "FUSION"; // Tipe Baru

  // Style Khusus Fusion (Gold)
  let borderClass = "border-gray-600";
  let bgClass = "bg-slate-800";
  
  if (isMagic) {
      borderClass = "border-purple-400";
      bgClass = "bg-slate-900";
  } else if (isFusion) {
      borderClass = "border-yellow-500 border-2"; // Emas
      bgClass = "bg-yellow-950"; // Gelap kekuningan
  }

  // Effect Visual saat dipilih sebagai tumbal
  const sacrificeEffect = isSacrificeSelected ? "ring-4 ring-red-600 grayscale opacity-80" : "";

  return (
    <div 
      onClick={() => onClick && onClick(data)}
      onMouseEnter={() => onHover && onHover(data)}
      className={`
        w-24 h-32 rounded p-1 flex flex-col items-center cursor-pointer transition relative group shadow-md
        ${borderClass} ${bgClass} ${sacrificeEffect}
        ${isSelected ? 'ring-4 ring-yellow-400 scale-110 z-20' : ''}
        ${!isSelected && !isMagic && !isSacrificeSelected && isTargetMode ? 'ring-2 ring-purple-500 animate-pulse hover:scale-110 z-10' : 'hover:scale-105'}
      `}
    >
       {/* Badge Fusion */}
       {isFusion && <div className="absolute -top-2 -right-2 text-xs bg-yellow-500 text-black font-bold px-1 rounded-full z-10">BOSS</div>}

       {/* Label Element */}
       <div className={`text-[10px] font-bold ${isMagic ? 'text-purple-300' : (isFusion ? 'text-yellow-200' : 'text-gray-300')}`}>
         {isMagic ? "✨ MAGIC" : (isFusion ? "⭐ FUSION" : data.element)}
       </div>

       {/* Image */}
       <div className="w-full h-12 bg-gray-700 my-1 overflow-hidden flex items-center justify-center relative">
          {(isMagic || isFusion) ? (
             <span className="text-3xl">{data.image}</span>
          ) : (
             <div className="w-full h-full" style={{backgroundColor: data.element === 'Fire' ? '#7f1d1d' : data.element === 'Water' ? '#1e3a8a' : '#14532d'}}></div>
          )}
          
          {/* Tanda Tumbal */}
          {isSacrificeSelected && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-500 font-bold text-xl">
                ☠️
             </div>
          )}
       </div>

       {/* Nama & Stats ... (Sisanya sama seperti kode sebelumnya) ... */}
       <div className="text-[10px] text-center leading-tight truncate w-full font-bold text-gray-200">
          {data.name}
      </div>

      {isMagic || isFusion ? (
        <div className="mt-auto text-[9px] text-center text-gray-300 px-1 leading-tight">
          {data.desc}
        </div>
      ) : (
        <div className="flex justify-between w-full px-1 mt-auto text-[10px] font-bold text-white">
          <span className="text-red-500">⚔️{data.att + (data.bonusAtt||0)}</span>
          <span className="text-green-500">❤️{data.hp}</span>
        </div>
      )}
    </div>
  );
}