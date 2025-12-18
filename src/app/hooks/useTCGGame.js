import { useState, useEffect, useRef } from "react";
import { generateDeck } from "../utils/gameData";
import { audioManager } from "../utils/soundManager";

export default function useTCGGame() {
  // ... (State & Variable lain TETAP SAMA) ...
  const [turn, setTurn] = useState("PLAYER");
  const [logs, setLogs] = useState(["Game Start!"]);
  const [winner, setWinner] = useState(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackerName, setAttackerName] = useState(null);
  const [selectedMagicCard, setSelectedMagicCard] = useState(null);
  const [selectedFusionCard, setSelectedFusionCard] = useState(null);
  const [fusionSacrifices, setFusionSacrifices] = useState([]);

  // State Deck & Hand (TETAP SAMA)
  const [playerDeck, setPlayerDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerBench, setPlayerBench] = useState([]);
  const [playerActive, setPlayerActive] = useState(null);
  const [playerKO, setPlayerKO] = useState(0);

  const [comDeck, setComDeck] = useState([]);
  const [comHand, setComHand] = useState([]);
  const [comBench, setComBench] = useState([]);
  const [comActive, setComActive] = useState(null);
  const [comKO, setComKO] = useState(0);

  // --- REFS PENTING (FIX BUG) ---
  const processingDraw = useRef(false);
  const aiProcessing = useRef(false); // <--- TAMBAHAN: Mencegah AI jalan 2x

  const addLog = (msg) => setLogs((prev) => [msg, ...prev].slice(0, 15)); // Perpanjang log dikit jadi 15

  // ... (Fungsi removeCardFromList, cleanUpTurn, startTurnBuffs TETAP SAMA) ...
  const removeCardFromList = (list, cardId) => {
    const index = list.findIndex(c => c.id === cardId);
    if (index === -1) return list;
    const newList = [...list];
    newList.splice(index, 1);
    return newList;
  };

  const cleanUpTurn = (whoFinished) => {
      const resetAtt = (c) => ({ ...c, bonusAtt: 0 });
      if (whoFinished === "PLAYER") {
          setPlayerActive(prev => prev ? resetAtt(prev) : null);
          setPlayerBench(prev => prev.map(resetAtt));
      } else {
          setComActive(prev => prev ? resetAtt(prev) : null);
          setComBench(prev => prev.map(resetAtt));
      }
  };

  const startTurnBuffs = (whoStarting) => {
      const resetDef = (c) => ({ ...c, defense: 0 });
      if (whoStarting === "PLAYER") {
          setPlayerActive(prev => prev ? resetDef(prev) : null); 
          setPlayerBench(prev => prev.map(resetDef));
      } else {
          setComActive(prev => prev ? resetDef(prev) : null);
          setComBench(prev => prev.map(resetDef));
      }
  };

  const startNewGame = () => {
    // ... (Logika Start Game TETAP SAMA) ...
    audioManager.playBGM();
    const pDeck = generateDeck(20); const cDeck = generateDeck(20);
    setPlayerHand(pDeck.slice(0, 5)); setPlayerDeck(pDeck.slice(5));
    setComHand(cDeck.slice(0, 5)); setComDeck(cDeck.slice(5));
    setPlayerBench([]); setPlayerActive(null); setPlayerKO(0);
    setComBench([]); setComActive(null); setComKO(0);
    setWinner(null); setLogs(["Game Start!"]); setTurn("PLAYER"); 
    setSelectedMagicCard(null); setSelectedFusionCard(null); setFusionSacrifices([]);
    
    // Reset Refs
    processingDraw.current = false;
    aiProcessing.current = false; 
  };

  // ... (Fungsi drawCard, handleHandClick, applyMagicEffect, handleBenchClick, handleActiveClick, attack, executeFusionSummon TETAP SAMA) ...
  // (Pastikan Anda menggunakan versi yang sudah ada logika Fusion-nya dari jawaban sebelumnya)

  const drawCard = (who) => { 
     if (processingDraw.current) return;
     processingDraw.current = true;
     setTimeout(() => { processingDraw.current = false; }, 300);

     audioManager.playSFX("draw");

     if (who === "PLAYER") {
        setPlayerDeck(prevDeck => {
            if (prevDeck.length === 0) return prevDeck;
            const newCard = prevDeck[0];
            setPlayerHand(prevHand => {
                if (prevHand.some(c => c.id === newCard.id)) return prevHand; 
                return [...prevHand, newCard];
            });
            return prevDeck.slice(1);
        });
     } else {
        setComDeck(prevDeck => {
            if (prevDeck.length === 0) return prevDeck;
            const newCard = prevDeck[0];
            setComHand(prevHand => [...prevHand, newCard]);
            return prevDeck.slice(1);
        });
     }
  };

  // ... (Paste fungsi handleHandClick, handleBenchClick, executeFusionSummon, applyMagicEffect, handleActiveClick, attack di sini seperti sebelumnya) ...
  // Agar tidak kepanjangan, saya asumsikan bagian ini tidak berubah dari yang sudah berjalan.
  // Jika perlu kode lengkap bagian ini, beritahu saya.
  
  // Pastikan attack logic juga sudah benar (menggunakan setTurn("COM"))
  const applyMagicEffect = (targetCard, isActiveSlot = false) => {
    if (!selectedMagicCard) return false;

    let newCard = { ...targetCard };

    if (selectedMagicCard.effect === "HEAL") {
        newCard.hp = Math.min(newCard.maxHp, newCard.hp + selectedMagicCard.val);
    } else if (selectedMagicCard.effect === "BUFF_ATK") {
        newCard.bonusAtt += selectedMagicCard.val;
    } else if (selectedMagicCard.effect === "DEFENSE") {
        newCard.defense += selectedMagicCard.val;
    }

    if (isActiveSlot) {
        setPlayerActive(newCard);
    } else {
        setPlayerBench(prev => prev.map(c => c.id === targetCard.id ? newCard : c));
    }

    // FIX: Gunakan removeCardFromList untuk membuang magic card
    setPlayerHand(prev => removeCardFromList(prev, selectedMagicCard.id));
    
    audioManager.playSFX("place");
    addLog(`Magic: ${selectedMagicCard.name} -> ${targetCard.name}`);
    setSelectedMagicCard(null);
    return true;
  };

  const handleActiveClick = () => {
      if (turn === "PLAYER" && selectedMagicCard && playerActive) {
          applyMagicEffect(playerActive, true);
      }
  };


  // --- LOGIC 1: HAND CLICK (Pilih Kartu Fusion) ---
  const handleHandClick = (card) => {
    if (turn !== "PLAYER") return;

    // Reset mode lain jika pindah kartu
    if (selectedMagicCard && selectedMagicCard.id !== card.id) setSelectedMagicCard(null);
    if (selectedFusionCard && selectedFusionCard.id !== card.id) {
        setSelectedFusionCard(null);
        setFusionSacrifices([]); // Reset tumbal jika ganti kartu
    }

    if (card.type === "MONSTER") {
        if (playerBench.length >= 5) return alert("Bench Penuh!");
        audioManager.playSFX("place");
        setPlayerBench(prev => [...prev, card]);
        setPlayerHand(prev => removeCardFromList(prev, card.id));
        addLog(`Player: ${card.name} -> Bench`);
    } 
    else if (card.type === "MAGIC") {
        if (selectedMagicCard && selectedMagicCard.id === card.id) {
            setSelectedMagicCard(null); // Cancel click
        } else {
            setSelectedMagicCard(card);
            setSelectedFusionCard(null); // Matikan mode fusion
            audioManager.playSFX("draw");
            addLog(`Magic terpilih. Pilih Target!`);
        }
    }
    else if (card.type === "FUSION") {
        // LOGIC FUSION START
        if (selectedFusionCard && selectedFusionCard.id === card.id) {
            // Cancel Fusion
            setSelectedFusionCard(null);
            setFusionSacrifices([]);
            addLog("Fusion dibatalkan.");
        } else {
            // Start Fusion Mode
            setSelectedFusionCard(card);
            setSelectedMagicCard(null); // Matikan mode magic
            setFusionSacrifices([]); // Reset tumbal lama
            audioManager.playSFX("draw");
            addLog(`Fusion Mode: Pilih ${card.cost.join(" + ")} dari Bench.`);
        }
    }
  };

  // --- LOGIC 2: BENCH CLICK (Pilih Target Magic / Pilih Tumbal Fusion) ---
  const handleBenchClick = (card) => {
    if (turn !== "PLAYER") return;

    // A. JIKA SEDANG MAGIC MODE
    if (selectedMagicCard) {
        applyMagicEffect(card, false);
        return;
    }

    // B. JIKA SEDANG FUSION MODE (Memilih Tumbal)
    if (selectedFusionCard) {
        // 1. Cek apakah kartu ini sudah dipilih? (Untuk un-select)
        const isAlreadySelected = fusionSacrifices.some(c => c.id === card.id);
        
        if (isAlreadySelected) {
            // Un-select (Batalkan pilihan tumbal ini)
            setFusionSacrifices(prev => prev.filter(c => c.id !== card.id));
            return;
        }

        // 2. Validasi Elemen
        // Kita hitung sisa elemen yang dibutuhkan
        const requiredCost = [...selectedFusionCard.cost]; // Copy cost, misal ["Fire", "Water"]
        
        // Hapus elemen yang SUDAH terpenuhi oleh tumbal yang lain
        fusionSacrifices.forEach(sac => {
            const idx = requiredCost.indexOf(sac.element);
            if (idx !== -1) requiredCost.splice(idx, 1);
        });

        // Cek apakah kartu yang BARU diklik ini cocok dengan sisa kebutuhan?
        const neededIndex = requiredCost.indexOf(card.element);
        
        if (neededIndex !== -1) {
            // COCOK! Tambahkan ke daftar tumbal
            const newSacrifices = [...fusionSacrifices, card];
            setFusionSacrifices(newSacrifices);
            audioManager.playSFX("draw"); // Sound select

            // 3. Cek apakah Requirement sudah FULL?
            // Jika jumlah tumbal == jumlah cost, berarti summon!
            if (newSacrifices.length === selectedFusionCard.cost.length) {
                executeFusionSummon(newSacrifices);
            }
        } else {
            // Salah elemen
            addLog(`Salah bahan! Butuh: ${requiredCost.join(" / ")}`);
            audioManager.playSFX("error"); // Opsional kalau ada sound error
        }
        return;
    }

    // C. NORMAL MODE (Majukan ke Active)
    if (playerActive) return;
    audioManager.playSFX("place");
    setPlayerActive(card);
    setPlayerBench(prev => removeCardFromList(prev, card.id));
    addLog(`Player: ${card.name} -> Active!`);
  };

  // --- LOGIC 3: EKSEKUSI SUMMON ---
  const executeFusionSummon = (sacrifices) => {
      // 1. Hapus Tumbal dari Bench
      setPlayerBench(prev => {
          let newBench = [...prev];
          sacrifices.forEach(sac => {
             // Cari dan hapus satu per satu berdasarkan ID
             const idx = newBench.findIndex(b => b.id === sac.id);
             if (idx !== -1) newBench.splice(idx, 1);
          });
          // 2. Masukkan Monster Boss ke Bench
          newBench.push(selectedFusionCard);
          return newBench;
      });

      // 3. Hapus Kartu Boss dari Tangan
      setPlayerHand(prev => removeCardFromList(prev, selectedFusionCard.id));

      // 4. Efek & Reset
      audioManager.playSFX("win"); // Sound epic untuk summon
      addLog(`SUMMON BERHASIL: ${selectedFusionCard.name} bangkit!`);
      
      setSelectedFusionCard(null);
      setFusionSacrifices([]);
  };
  const attack = () => {
    if (!playerActive || !comActive) return;
    setIsAttacking(true);
    setAttackerName("PLAYER");
    audioManager.playSFX("attack");
    
    setTimeout(() => {
        const totalAtt = playerActive.att + (playerActive.bonusAtt || 0);
        const damageDealt = Math.max(0, totalAtt - comActive.defense);
        const newComHp = comActive.hp - damageDealt;
        
        addLog(`BATTLE: Player deal ${damageDealt} dmg! (${comActive.defense > 0 ? `Blocked ${comActive.defense}` : ''})`);

        if (newComHp <= 0) {
            addLog(`COM ${comActive.name} KO! (+1 Point)`);
            setComActive(null);
            setComKO(prev => {
                const s = comActive.type === "FUSION" ? prev + 2 : prev + 1;
                if (s >= 5) { setWinner("PLAYER"); audioManager.playSFX("win"); audioManager.stopBGM(); }
                return s;
            });
        } else {
            setComActive(prev => ({ ...prev, hp: newComHp }));
        }
        
        setIsAttacking(false);
        cleanUpTurn("PLAYER");
        setTurn("COM");
        startTurnBuffs("COM");
    }, 500);
  };


  // --- AI LOGIC (COM) YANG SUDAH DIPERBAIKI ---
  useEffect(() => {
    // Variable flag untuk membatalkan eksekusi jika React me-render ulang
    let isCurrentEffect = true;

    if (turn === "COM" && !winner) {
      const runComTurn = async () => {
        
        // Helper untuk delay yang aman (bisa dibatalkan)
        const wait = async (ms) => {
            await new Promise(r => setTimeout(r, ms));
            // KUNCI UTAMA: Cek apakah efek ini masih valid setelah bangun tidur?
            if (!isCurrentEffect) throw new Error("Turn Cancelled"); 
        };

        try {
            // --- 1. SETUP ---
            let aiHand = [...comHand];
            let aiDeck = [...comDeck];
            let aiBench = [...comBench];
            let aiActive = comActive ? { ...comActive } : null;

            // --- 2. DRAW ---
            if (aiDeck.length > 0) {
                const newCard = aiDeck[0];
                aiHand.push(newCard);
                aiDeck = aiDeck.slice(1);
                // Update State UI
                setComHand([...aiHand]); setComDeck([...aiDeck]); 
                audioManager.playSFX("draw");
            }
            await wait(800); // <--- Gunakan fungsi 'wait' custom kita

            // --- 3. NORMAL MONSTER ---
            let handAfterNormal = [];
            let placedAny = false;
            for (let card of aiHand) {
                if (card.type === "MONSTER" && aiBench.length < 5) {
                    aiBench.push(card); 
                    audioManager.playSFX("place"); 
                    placedAny = true;
                    setComBench([...aiBench]); 
                    await wait(300); // Check cancel setiap delay
                } else { 
                    handAfterNormal.push(card); 
                }
            }
            aiHand = handAfterNormal;
            if (placedAny) await wait(500);

            // --- 4. FUSION SUMMON ---
            let handAfterFusion = [];
            for (let card of aiHand) {
                if (card.type === "FUSION") {
                    let cost = [...card.cost];
                    let tempBench = [...aiBench];
                    let sacrificeIds = [];
                    let canSummon = true;
                    for (let reqEl of cost) {
                        const idx = tempBench.findIndex(b => b.element === reqEl);
                        if (idx !== -1) {
                            sacrificeIds.push(tempBench[idx].id);
                            tempBench.splice(idx, 1);
                        } else { canSummon = false; break; }
                    }
                    if (canSummon) {
                        aiBench = aiBench.filter(c => !sacrificeIds.includes(c.id));
                        aiBench.push(card);
                        audioManager.playSFX("win"); 
                        addLog(`COM FUSION: ${card.name} Bangkit!`);
                        setComBench([...aiBench]); 
                        await wait(1000);
                    } else { handAfterFusion.push(card); }
                } else { handAfterFusion.push(card); }
            }
            aiHand = handAfterFusion; setComHand([...aiHand]);
            await wait(800);

            // --- 5. PROMOTE ---
            if (!aiActive && aiBench.length > 0) {
              const strongest = aiBench.reduce((p, c) => (p.hp > c.hp ? p : c));
              aiActive = strongest;
              const idx = aiBench.findIndex(c => c.id === strongest.id);
              if (idx !== -1) aiBench.splice(idx, 1);
              setComActive(aiActive); setComBench([...aiBench]); 
              audioManager.playSFX("place");
            }
            await wait(800);

            // --- 6. MAGIC ---
            let finalHand = [];
            for (let card of aiHand) {
                if (card.type === "MAGIC" && aiActive) {
                    if (card.effect === "DEFENSE") { aiActive.defense += card.val; addLog(`COM Shield Up!`); audioManager.playSFX("place"); } 
                    else if (card.effect === "BUFF_ATK") { aiActive.bonusAtt += card.val; addLog(`COM Enrage!`); audioManager.playSFX("place"); }
                    else if (card.effect === "HEAL" && aiActive.hp < aiActive.maxHp) { aiActive.hp = Math.min(aiActive.maxHp, aiActive.hp + card.val); addLog(`COM Heal!`); audioManager.playSFX("place"); } 
                    else { finalHand.push(card); }
                    setComActive({...aiActive}); 
                    await wait(500);
                } else { finalHand.push(card); }
            }
            aiHand = finalHand; setComHand([...aiHand]);

            // --- 7. ATTACK ---
            if (aiActive && playerActive) {
                 setIsAttacking(true); setAttackerName("COM"); 
                 audioManager.playSFX("attack");
                 await wait(500);

                 const totalAtt = aiActive.att + (aiActive.bonusAtt || 0);
                 const damageDealt = Math.max(0, totalAtt - playerActive.defense);
                 
                 addLog(`COM attack ${damageDealt} dmg! (${playerActive.defense > 0 ? `Blocked ${playerActive.defense}` : ''})`);
                 
                 const predictedNewHp = playerActive.hp - damageDealt;
                 if (predictedNewHp <= 0) {
                     setPlayerActive(null);
                     setPlayerKO(prev => {
                         const s = playerActive.type === "FUSION" ? prev + 2 : prev + 1;
                         if (s >= 5) { setWinner("COM"); audioManager.stopBGM(); }
                         return s;
                     });
                 } else {
                     setPlayerActive(prev => ({...prev, hp: prev.hp - damageDealt}));
                 }
                 setIsAttacking(false);
            }

            await wait(800);
            
            // --- 8. END TURN ---
            // Cek sekali lagi sebelum final commit
            if (isCurrentEffect) {
                cleanUpTurn("COM"); 
                drawCard("PLAYER"); 
                setTurn("PLAYER"); 
                startTurnBuffs("PLAYER"); 
                addLog("Giliran Player");
            }

        } catch (error) {
            // Error ini sengaja dilempar jika turn dibatalkan (Cancel)
            // Jadi kita ignore saja agar tidak crash
            if (error.message !== "Turn Cancelled") console.error(error);
        }
      };
      
      runComTurn();
    }

    // CLEANUP FUNCTION (PENTING!)
    // Ini akan dijalankan React jika komponen re-render atau turn berubah
    return () => {
        isCurrentEffect = false; // Matikan flag, matikan semua proses async yang sedang berjalan
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner]);

  // ... (Return Statement TETAP SAMA) ...
  return {
    gameState: { 
        turn, logs, winner, playerKO, comKO, isAttacking, attackerName, 
        selectedMagicCard, selectedFusionCard, fusionSacrifices 
    },
    player: { hand: playerHand, bench: playerBench, active: playerActive, deck: playerDeck },
    com: { hand: comHand, bench: comBench, active: comActive, deck: comDeck },
    actions: { 
        startNewGame, 
        handleHandClick, 
        handleBenchClick, 
        handleActiveClick, 
        attack, 
        endTurn: () => {
            cleanUpTurn("PLAYER");
            setTurn("COM");
            startTurnBuffs("COM");
        }
    }
  };
}