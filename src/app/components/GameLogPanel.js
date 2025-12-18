// components/GameLogPanel.js
export default function GameLogPanel({ logs, isOpen, onClose }) {
    return (
      <div 
        className={`
          h-screen bg-slate-950 border-l border-slate-700 shadow-2xl transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}
        `}
      >
        {/* Header Panel */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
           <h2 className="text-green-400 font-bold tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              BATTLE LOGS
           </h2>
           <button onClick={onClose} className="text-gray-500 hover:text-white transition">
              ✕
           </button>
        </div>
  
        {/* Area Scroll Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
           {logs.length === 0 && <div className="text-gray-600 text-center mt-10">Waiting for battle...</div>}
           
           {logs.reverse().map((log, index) => {
              // Styling warna berdasarkan isi log
              let textColor = "text-gray-300";
              let borderLeft = "border-l-2 border-gray-700";
              
              if (log.includes("KO!") || log.includes("FUSION")) {
                  textColor = "text-yellow-400 font-bold";
                  borderLeft = "border-l-2 border-yellow-500";
              } else if (log.includes("attack") || log.includes("deal")) {
                  textColor = "text-red-300";
                  borderLeft = "border-l-2 border-red-900";
              } else if (log.includes("Magic") || log.includes("Heal")) {
                  textColor = "text-purple-300";
                  borderLeft = "border-l-2 border-purple-500";
              }
  
              return (
                <div key={index} className={`pl-3 py-1 ${borderLeft} bg-slate-900/50 rounded-r animate-in fade-in slide-in-from-right-2 duration-300`}>
                   <span className="opacity-50 text-[9px] mr-2">[{logs.length - index}]</span>
                   <span className={textColor}>{log}</span>
                </div>
              );
           })}
        </div>
        
        {/* Footer Info */}
        <div className="p-2 border-t border-slate-800 text-[10px] text-gray-600 text-center bg-slate-900 shrink-0">
            System v1.0 • Live Feed
        </div>
      </div>
    );
  }