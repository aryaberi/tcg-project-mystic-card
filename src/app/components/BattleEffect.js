import { motion, AnimatePresence } from "framer-motion";

export default function BattleEffect({ active, attacker }) {
  // Logic arah animasi
  // Jika PLAYER menyerang: Mulai dari bawah (y: 200) ke atas (y: -150)
  // Jika COM menyerang: Mulai dari atas (y: -200) ke bawah (y: 150)
  
  const startY = attacker === "PLAYER" ? 250 : -250; 
  const endY = attacker === "PLAYER" ? -150 : 150;
  
  // Rotasi pedang agar ujungnya menghadap musuh
  // Player nyerang: menghadap atas (45deg default icon + 0)
  // Com nyerang: menghadap bawah (putar balik 225deg)
  const rotation = attacker === "PLAYER" ? 0 : 225;

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
            
            {/* 1. PEDANG MELUNCUR */}
            <motion.div
                initial={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    y: startY,   // Posisi Awal (Tempat Penyerang)
                    rotate: rotation 
                }}
                animate={{ 
                    opacity: [0, 1, 1, 0], // Muncul -> Tetap -> Hilang
                    scale: [1, 2, 2.5],    // Membesar saat mendekat
                    y: endY,     // Posisi Akhir (Tempat Target)
                }}
                transition={{ 
                    duration: 0.4, // Kecepatan peluncuran (0.4 detik)
                    ease: "circIn", // Gerakan semakin cepat (seperti tebasan)
                    times: [0, 0.6, 0.8, 1] // Timing keyframe
                }}
            >
                {/* Icon Pedang dengan Trail effect (bayangan) */}
                <div className="relative">
                    <span className="text-8xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                        🗡️
                    </span>
                    {/* Efek Ekor/Angin di belakang pedang */}
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 100, opacity: 0.5 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4 bg-gradient-to-t from-transparent to-white blur-md"
                        style={{ top: attacker === "PLAYER" ? '100%' : 'auto', bottom: attacker === "COM" ? '100%' : 'auto' }}
                    />
                </div>
            </motion.div>

            {/* 2. EFEK LEDAKAN / BENTURAN (SLASH) DI TARGET */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0.5, 2, 3],
                    rotate: [0, 90] // Efek putaran slash
                }}
                transition={{ delay: 0.3, duration: 0.2 }} // Muncul setelah pedang sampai
                className="absolute w-32 h-32"
                style={{ y: endY }} // Muncul di posisi target
            >
                 {/* Visual Slash (Gunakan CSS gradient untuk membuat garis tebasan) */}
                 <div className="w-full h-full bg-red-500 rounded-full blur-xl opacity-80 mix-blend-screen"></div>
                 <div className="absolute top-1/2 left-0 w-full h-2 bg-white -rotate-45 shadow-[0_0_10px_white]"></div>
            </motion.div>

            {/* 3. FLASH LAYAR MERAH (Impact) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4, transition: { delay: 0.35, duration: 0.1 } }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-600 mix-blend-overlay"
            />
        </div>
      )}
    </AnimatePresence>
  );
}