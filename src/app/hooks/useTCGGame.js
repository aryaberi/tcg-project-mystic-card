import { useState, useEffect, useRef } from "react";
import { generateDeck } from "../utils/gameData";
import { audioManager } from "../utils/soundManager";
import { m } from "framer-motion";

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

  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [comGraveyard, setComGraveyard] = useState([]);

  // --- REFS PENTING (FIX BUG) ---
  const processingDraw = useRef(false);
  const aiProcessing = useRef(false); // <--- TAMBAHAN: Mencegah AI jalan 2x

  const addLog = (msg) => setLogs((prev) => [msg, ...prev].slice(0, 15)); // Perpanjang log dikit jadi 15

  // ... (Fungsi removeCardFromList, cleanUpTurn, startTurnBuffs TETAP SAMA) ...
  const removeCardFromList = (list, cardId) => {
    const index = list.findIndex((c) => c.id === cardId);
    if (index === -1) return list;
    const newList = [...list];
    newList.splice(index, 1);
    return newList;
  };
  // HELPER: Masukkan ke Graveyard
  const addToGraveyard = (who, cards) => {
    // Pastikan input berupa array, jika single object jadikan array
    const cardArray = Array.isArray(cards) ? cards : [cards];

    // Bersihkan status sementara (buff/frozen) sebelum masuk kuburan
    const cleanCards = cardArray.map((c) => ({
      ...c,
      bonusAtt: 0,
      defense: 0,
      isFrozen: false,
      isReady: true, // Reset ready biar kalau di-revive nanti bisa dipake
    }));

    if (who === "PLAYER") {
      setPlayerGraveyard((prev) => [...prev, ...cleanCards]);
    } else {
      setComGraveyard((prev) => [...prev, ...cleanCards]);
    }
  };

  const cleanUpTurn = (whoFinished) => {
    const resetAtt = (c) => ({ ...c, bonusAtt: 0 });
    const handleUnfreeze = (c) => {
      if (c.isFrozen) {
        return { ...c, isFrozen: false }; // Cairkan
      }
      return c;
    };
    if (whoFinished === "PLAYER") {
      if (
        comActive?.hp - (playerActive?.att + (playerActive?.bonusAtt || 0)) >
          0 &&
        playerActive.isFrozen !== true
      ) {
        setComActive((prev) => handleUnfreeze(resetAtt(prev)));
      }
      setPlayerActive((prev) => (prev ? resetAtt(prev) : null));
      setPlayerBench((prev) => prev.map(resetAtt));
    } else {
      console.log(
        playerActive?.hp - (comActive?.att + comActive?.bonusAtt || 0)
      );
      if (
        playerActive?.hp - (comActive?.att + (comActive?.bonusAtt || 0)) > 0 &&
        comActive.isFrozen !== true
      ) {
        setPlayerActive((prev) => handleUnfreeze(resetAtt(prev)));
      }
      setComActive((prev) => (prev ? resetAtt(prev) : null));
      setComBench((prev) => prev.map(resetAtt));
    }
  };

  const startTurnBuffs = (whoStarting) => {
    const resetDef = (c) => ({ ...c, defense: 0 });
    const makeReady = (c) => ({ ...c, isReady: true });
    const handleGrowth = (c) => ({
      ...c,
      defense: 0,
      att: c.att + c.ability.val,
    });
    // const handleStartTurnAbility = (c) => {
    //  if (c.ability?.type === "GROWTH") {
    //     return { ...c, att: att+c.ability.val };
    //   }
    //   return c;
    // };
    // const handleStartTurnAbility = (c) => {
    //   let newCard = { ...c };

    //   if (newCard.ability?.type === "GROWTH") {
    //     newCard.att += newCard.ability.val; // Nambah permanen base attack
    //   }
    //   return newCard;
    // };
    if (whoStarting === "PLAYER") {
      // if (playerActive) {
      //   let updated = resetDef(playerActive);
      //   updated = handleStartTurnAbility(updated);
      //   setPlayerActive(updated);
      // }
      if (playerActive?.ability?.type === "GROWTH") {
        setPlayerActive((prev) => (prev ? handleGrowth(prev) : null));
      } else {
        setPlayerActive((prev) => (prev ? resetDef(prev) : null));
      }
      // setPlayerActive((prev) => handleStartTurnAbility(resetDef(prev)));
      setPlayerBench((prev) => prev.map(resetDef));
      setPlayerBench((prev) => prev.map((c) => makeReady(resetDef(c))));
    } else {
      // if (comActive) {
      //   let updated = resetDef(comActive);
      //   updated = handleStartTurnAbility(updated);
      //   setComActive(updated);
      // }
      if (comActive?.ability?.type === "GROWTH") {
        setComActive((prev) => (prev ? handleGrowth(prev) : null));
      } else {
        setComActive((prev) => (prev ? resetDef(prev) : null));
      }
      // setComActive((prev) => handleStartTurnAbility(resetDef(prev)));
      setComBench((prev) => prev.map(resetDef));
      setComBench((prev) => prev.map((c) => makeReady(resetDef(c))));
    }
  };

  const startNewGame = () => {
    // ... (Logika Start Game TETAP SAMA) ...
    audioManager.playBGM();
    const pDeck = generateDeck(20);
    const cDeck = generateDeck(20);
    setPlayerHand(pDeck.slice(0, 5));
    setPlayerDeck(pDeck.slice(5));
    setComHand(cDeck.slice(0, 5));
    setComDeck(cDeck.slice(5));
    setPlayerBench([]);
    setPlayerActive(null);
    setPlayerKO(0);
    setComBench([]);
    setComActive(null);
    setComKO(0);
    setWinner(null);
    setLogs(["Game Start!"]);
    setTurn("PLAYER");
    setSelectedMagicCard(null);
    setSelectedFusionCard(null);
    setFusionSacrifices([]);

    // Reset Refs
    processingDraw.current = false;
    aiProcessing.current = false;
  };

  // ... (Fungsi drawCard, handleHandClick, applyMagicEffect, handleBenchClick, handleActiveClick, attack, executeFusionSummon TETAP SAMA) ...
  // (Pastikan Anda menggunakan versi yang sudah ada logika Fusion-nya dari jawaban sebelumnya)

  const drawCard = (who) => {
    if (processingDraw.current) return;
    processingDraw.current = true;
    setTimeout(() => {
      processingDraw.current = false;
    }, 300);

    audioManager.playSFX("draw");

    if (who === "PLAYER") {
      setPlayerDeck((prevDeck) => {
        if (prevDeck.length === 0) return prevDeck;
        const newCard = prevDeck[0];
        setPlayerHand((prevHand) => {
          if (prevHand.some((c) => c.id === newCard.id)) return prevHand;
          return [...prevHand, newCard];
        });
        return prevDeck.slice(1);
      });
    } else {
      setComDeck((prevDeck) => {
        if (prevDeck.length === 0) return prevDeck;
        const newCard = prevDeck[0];
        setComHand((prevHand) => [...prevHand, newCard]);
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
      setPlayerBench((prev) =>
        prev.map((c) => (c.id === targetCard.id ? newCard : c))
      );
    }

    // UPDATE DISINI: Pindahkan Magic Card ke Graveyard sebelum dihapus dari Hand
    addToGraveyard("PLAYER", selectedMagicCard);
    setPlayerHand((prev) => removeCardFromList(prev, selectedMagicCard.id));

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
    if (selectedMagicCard && selectedMagicCard.id !== card.id)
      setSelectedMagicCard(null);
    if (selectedFusionCard && selectedFusionCard.id !== card.id) {
      setSelectedFusionCard(null);
      setFusionSacrifices([]); // Reset tumbal jika ganti kartu
    }

    if (card.type === "MONSTER") {
      if (playerBench.length >= 5) return alert("Bench Penuh!");
      audioManager.playSFX("place");

      // PENTING: Kita timpa status default 'isReady: true' menjadi 'false'
      // Ini menandakan "Baru saja masuk arena"
      const newCard = { ...card, isReady: false };

      setPlayerBench((prev) => [...prev, newCard]);
      setPlayerHand((prev) => removeCardFromList(prev, card.id));
      addLog(`Player: ${card.name} -> Bench`);
    } else if (card.type === "MAGIC") {
      if (selectedMagicCard && selectedMagicCard.id === card.id) {
        setSelectedMagicCard(null); // Cancel click
      } else {
        setSelectedMagicCard(card);
        setSelectedFusionCard(null); // Matikan mode fusion
        audioManager.playSFX("draw");
        addLog(`Magic terpilih. Pilih Target!`);
      }
    } else if (card.type === "FUSION") {
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
    } else if (card.type === "INSTANT") {
      // Instant tidak butuh target, langsung eksekusi!
      // if (confirm(`Cast ${card.name}? Effect: ${card.desc}`)) {
      executeInstantMagic(card, "PLAYER");
      // Reset selection lain
      setSelectedMagicCard(null);
      setSelectedFusionCard(null);
      // }
    }
  };

  const executeInstantMagic = (card, userWhoPlayed, newComHand = null, newCBench=null) => {
    const currentPHand = playerHand;
    const currentCHand = newComHand || comHand;
    const currentPDeck = playerDeck;
    const currentCDeck = comDeck;
    const currentPBench = playerBench;
    const currentCBench = newCBench || comBench;

    // 2. LOGIKA EFEK
    if (card.effect === "GLOBAL_SHUFFLE") {
      // --- 1. AMBIL DATA SAAT INI (SNAPSHOT) ---
      // Pastikan kamu punya akses ke variable state playerHand/Deck saat ini
      // (Misal dari props atau state component langsung)

      // --- 2. LOGIKA GRAVEYARD (Side Effect di sini, CUMA SEKALI) ---
      // Masukkan tangan yang sekarang ke kuburan
      addToGraveyard("PLAYER", currentPHand);
      addToGraveyard("COM", currentCHand);

      // --- 3. LOGIKA DRAW (Kalkulasi di luar setter) ---

      // Hitung Kartu Baru Player
      const pDrawCount = Math.min(currentPDeck.length, 5);
      const pNewHand = currentPDeck.slice(0, pDrawCount);
      const pRemainingDeck = currentPDeck.slice(pDrawCount);

      // Hitung Kartu Baru COM
      const cDrawCount = Math.min(currentCDeck.length, 5);
      const cNewHand = currentCDeck.slice(0, cDrawCount);
      const cRemainingDeck = currentCDeck.slice(cDrawCount);

      // --- 4. UPDATE STATE SEKALIGUS (Batching) ---

      // Update Player
      setPlayerHand(pNewHand); // Tangan jadi isi 5 kartu baru
      setPlayerDeck(pRemainingDeck); // Deck berkurang

      // Update COM
      setComHand(cNewHand);
      setComDeck(cRemainingDeck);

      addLog(`INSTANT: ${userWhoPlayed} casts SHUFFLE! Both redraw 5.`);
    } else if (card.effect === "GLOBAL_BOUNCE") {
      // --- EFEK WHIRLWIND ---
      // Kembalikan semua bench ke tangan.
      // Kartu yang kembali ke tangan harus di-reset stat-nya (HP penuh, buff hilang)
      // 1. Masukkan kartu Instant itu sendiri ke Graveyard
      addToGraveyard(userWhoPlayed, card);

      // // Hapus dari tangan pemain yang make
      // if (userWhoPlayed === "PLAYER") {
      //   setPlayerHand((prev) => removeCardFromList(prev, card.id));
      // } else {
      //   setComHand((prev) => removeCardFromList(prev, card.id));
      // }
      const resetCard = (c) => ({
        ...c,
        hp: c.maxHp,
        bonusAtt: 0,
        defense: 0,
        isFrozen: false,
        isReady: true, // Reset ready stat
      });
      const newPBench = currentPBench.map(resetCard);
      const newCBench = currentCBench.map(resetCard);
      const newPHand = currentPHand.filter((c)=> c.id !== card.id)
      const newCHand = currentCHand.filter((c)=> c.id !== card.id)
      // A. Bounce Player Bench
      setPlayerHand([...newPHand,...newPBench]);
      setPlayerBench([]);

      // B. Bounce COM Bench
      setComHand([...newCHand, ...newCBench]);
      setComBench([]);

      addLog(`INSTANT: ${userWhoPlayed} casts WHIRLWIND! All bench returned.`);
    }

    audioManager.playSFX("magic"); // Suara magic
  };

  // --- LOGIC 2: BENCH CLICK (Pilih Target Magic / Pilih Tumbal Fusion) ---
  const handleBenchClick = (card) => {
    if (turn !== "PLAYER") return;

    // A. MAGIC MODE (Tetap)
    if (selectedMagicCard) {
      applyMagicEffect(card, false);
      return;
    }

    // B. FUSION MODE
    if (selectedFusionCard) {
      const isAlreadySelected = fusionSacrifices.some((c) => c.id === card.id);

      if (isAlreadySelected) {
        setFusionSacrifices((prev) => prev.filter((c) => c.id !== card.id));
        return;
      }

      // --- VALIDASI BARU: CEK UMUR KARTU ---
      if (card.isReady === false) {
        addLog("Kartu baru tidak bisa jadi tumbal!");
        audioManager.playSFX("error"); // Bunyi error/buzz (opsional)
        return;
      }
      // -------------------------------------

      // ... (Sisa logika validasi elemen FUSION TETAP SAMA) ...
      const requiredCost = [...selectedFusionCard.cost];
      fusionSacrifices.forEach((sac) => {
        const idx = requiredCost.indexOf(sac.element);
        if (idx !== -1) requiredCost.splice(idx, 1);
      });

      const neededIndex = requiredCost.indexOf(card.element);

      if (neededIndex !== -1) {
        const newSacrifices = [...fusionSacrifices, card];
        setFusionSacrifices(newSacrifices);
        audioManager.playSFX("draw");

        if (newSacrifices.length === selectedFusionCard.cost.length) {
          executeFusionSummon(newSacrifices);
        }
      } else {
        addLog(`Salah bahan! Butuh: ${requiredCost.join(" / ")}`);
      }
      return;
    }
    // C. NORMAL MODE (Majukan ke Active)
    if (playerActive) return;
    audioManager.playSFX("place");
    setPlayerActive(card);
    setPlayerBench((prev) => removeCardFromList(prev, card.id));
    addLog(`Player: ${card.name} -> Active!`);
  };

  // --- LOGIC 3: EKSEKUSI SUMMON ---
  const executeFusionSummon = (sacrifices) => {
    addToGraveyard("PLAYER", sacrifices);
    // 1. Hapus Tumbal dari Bench
    setPlayerBench((prev) => {
      let newBench = [...prev];
      sacrifices.forEach((sac) => {
        // Cari dan hapus satu per satu berdasarkan ID
        const idx = newBench.findIndex((b) => b.id === sac.id);
        if (idx !== -1) newBench.splice(idx, 1);
      });
      // 2. Masukkan Monster Boss ke Bench
      newBench.push(selectedFusionCard);
      return newBench;
    });

    // 3. Hapus Kartu Boss dari Tangan
    setPlayerHand((prev) => removeCardFromList(prev, selectedFusionCard.id));

    // 4. Efek & Reset
    audioManager.playSFX("win"); // Sound epic untuk summon
    addLog(`SUMMON BERHASIL: ${selectedFusionCard.name} bangkit!`);

    setSelectedFusionCard(null);
    setFusionSacrifices([]);
  };
  const attack = () => {
    if (!playerActive || !comActive) return;
    if (playerActive?.isFrozen) {
      addLog("Unit sedang Recharge (Frozen)!");
      cleanUpTurn("PLAYER");
      setTurn("COM");
      startTurnBuffs("COM");
      return;
    }
    setIsAttacking(true);
    setAttackerName("PLAYER");
    audioManager.playSFX("attack");

    setTimeout(() => {
      const totalAtt = playerActive.att + (playerActive.bonusAtt || 0);
      const damageDealt = Math.max(0, totalAtt - comActive.defense);
      const newComHp = comActive.hp - damageDealt;

      addLog(
        `BATTLE: Player deal ${damageDealt} dmg! (${
          comActive.defense > 0 ? `Blocked ${comActive.defense}` : ""
        })`
      );
      if (playerActive.ability) {
        if (playerActive.ability.type === "RECOIL") {
          // Kurangi darah sendiri
          const recoilDmg = playerActive.ability.val;
          const hpAfterRecoilDmg =
            playerActive.hp - recoilDmg > 0 ? playerActive.hp - recoilDmg : 10;
          setPlayerActive((prev) => ({ ...prev, hp: hpAfterRecoilDmg }));
          addLog(`Effect: ${playerActive.name} kena ${recoilDmg} recoil!`);
        } else if (playerActive.ability.type === "FROZEN") {
          // Set status Frozen (Skip next turn)
          setPlayerActive((prev) => ({ ...prev, isFrozen: true }));
          addLog(`Effect: ${playerActive.name} freezing (Recharge)!`);
        }
      }
      if (newComHp <= 0) {
        addLog(`COM ${comActive.name} KO! (+1 Point)`);
        addToGraveyard("COM", comActive);
        setComActive(null);
        setComKO((prev) => {
          const s = comActive.type === "FUSION" ? prev + 2 : prev + 1;
          if (s >= 6) {
            setWinner("PLAYER");
            audioManager.playSFX("win");
            audioManager.stopBGM();
          }
          return s;
        });
      } else {
        setComActive((prev) => ({ ...prev, hp: newComHp }));
      }

      setIsAttacking(false);
      cleanUpTurn("PLAYER");
      setTurn("COM");
      startTurnBuffs("COM");
    }, 500);
  };

  // --- AI LOGIC (COM) YANG SUDAH DIPERBAIKI ---
  useEffect(() => {
    let isCurrentEffect = true;

    if (turn === "COM" && !winner) {
      // Cek Ref Zombie
      if (aiProcessing.current) return;
      aiProcessing.current = true;

      const runComTurn = async () => {
        const wait = async (ms) => {
          await new Promise((r) => setTimeout(r, ms));
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
            setComHand([...aiHand]);
            setComDeck([...aiDeck]);
            audioManager.playSFX("draw");
          }
          await wait(800);

          // --- 3. NORMAL MONSTER (UPDATE: Set isReady: false) ---
          let handAfterNormal = [];
          let placedAny = false;
          for (let card of aiHand) {
            if (card.type === "MONSTER" && aiBench.length < 5) {
              // UPDATE: Tambahkan status isReady: false agar kena summon sickness
              aiBench.push({ ...card, isReady: false });

              audioManager.playSFX("place");
              placedAny = true;
              setComBench([...aiBench]);
              await wait(300);
            } else {
              handAfterNormal.push(card);
            }
          }
          aiHand = handAfterNormal;
          if (placedAny) await wait(500);

          // --- 4. FUSION SUMMON (UPDATE: Cek isReady) ---
          let handAfterFusion = [];
          for (let card of aiHand) {
            if (card.type === "FUSION") {
              let cost = [...card.cost];
              let tempBench = [...aiBench];
              let sacrificeIds = [];
              let canSummon = true;

              for (let reqEl of cost) {
                // UPDATE: Cari bahan yang elemennya cocok DAN sudah siap (isReady !== false)
                const idx = tempBench.findIndex(
                  (b) => b.element === reqEl && b.isReady !== false
                );

                if (idx !== -1) {
                  sacrificeIds.push(tempBench[idx].id);
                  tempBench.splice(idx, 1);
                } else {
                  canSummon = false;
                  break;
                }
              }

              if (canSummon) {
                const sacrificedCards = aiBench.filter((c) =>
                  sacrificeIds.includes(c.id)
                );

                // 2. MASUKKAN KE GRAVEYARD COM
                addToGraveyard("COM", sacrificedCards);
                aiBench = aiBench.filter((c) => !sacrificeIds.includes(c.id));
                // Boss masuk juga kena sickness (opsional, biasanya boss langsung ready itu terlalu OP, jadi kita kasih sickness juga)
                aiBench.push({ ...card, isReady: false });

                audioManager.playSFX("win");
                addLog(`COM FUSION: ${card.name} Bangkit!`);
                setComBench([...aiBench]);
                await wait(1000);
              } else {
                handAfterFusion.push(card);
              }
            } else {
              handAfterFusion.push(card);
            }
          }
          aiHand = handAfterFusion;
          setComHand([...aiHand]);
          await wait(800);

          // --- 5. PROMOTE ---
          if (!aiActive && aiBench.length > 0) {
            // Cari yang paling kuat
            const strongest = aiBench.reduce((p, c) => (p.hp > c.hp ? p : c));

            // Opsional: Cek apakah monster harus ready dulu baru bisa maju ke active?
            // Biasanya aturan TCG membolehkan maju kapan saja, tapi tidak bisa nyerang.
            // Di game kita, maju = persiapan nyerang.

            aiActive = strongest;
            const idx = aiBench.findIndex((c) => c.id === strongest.id);
            if (idx !== -1) aiBench.splice(idx, 1);
            setComActive(aiActive);
            setComBench([...aiBench]);
            audioManager.playSFX("place");
          }
          await wait(800);

          // --- 6. MAGIC ---
          let finalHand = [];
          for (let card of aiHand) {
            if (card.type === "MAGIC" && aiActive) {
              if (card.effect === "DEFENSE") {
                aiActive.defense += card.val;
                addLog(`COM Shield Up!`);
                addToGraveyard("COM", card);
                audioManager.playSFX("place");
              } else if (card.effect === "BUFF_ATK") {
                aiActive.bonusAtt += card.val;
                addLog(`COM Enrage!`);
                audioManager.playSFX("place");
                addToGraveyard("COM", card);
              } else if (
                card.effect === "HEAL" &&
                aiActive.hp < aiActive.maxHp
              ) {
                aiActive.hp = Math.min(aiActive.maxHp, aiActive.hp + card.val);
                addLog(`COM Heal!`);
                audioManager.playSFX("place");
                addToGraveyard("COM", card);
              } else {
                finalHand.push(card);
              }
              setComActive({ ...aiActive });
              await wait(500);
            } else {
              finalHand.push(card);
            }
          }
          aiHand = finalHand;
          setComHand([...aiHand]);
          await wait(800);

          //Instan Magic
          for (let card of aiHand) {
            if (card.type === "INSTANT") {
              let shouldUse = false;

              if (card.effect === "GLOBAL_SHUFFLE") {
                // AI pakai Shuffle jika kartunya sedikit (< 3)
                if (aiHand.length < 3) shouldUse = true;
              } else if (card.effect === "GLOBAL_BOUNCE") {
                // AI pakai Whirlwind jika musuh punya banyak monster di bench (>= 3)
                // dan AI punya sedikit (<= 1)
                // if (playerBench.length >= 3 && aiBench.length <= 1)
                shouldUse = true;
              }

              if (shouldUse) {
                // Eksekusi Instant
                executeInstantMagic(card, "COM", aiHand, aiBench);
                await wait(1000); // Delay efek
                // Tidak perlu push ke finalHand karena sudah dihapus di executeInstantMagic
              }
            }
          }

          // --- 7. ATTACK ---
          if (aiActive && playerActive) {
            setIsAttacking(true);
            setAttackerName("COM");
            audioManager.playSFX("attack");
            await wait(500);

            const totalAtt = aiActive.att + (aiActive.bonusAtt || 0);
            const damageDealt = Math.max(0, totalAtt - playerActive.defense);

            addLog(
              `COM attack ${damageDealt} dmg! (${
                playerActive.defense > 0
                  ? `Blocked ${playerActive.defense}`
                  : ""
              })`
            );

            if (aiActive.ability) {
              if (aiActive.ability.type === "RECOIL") {
                const hpAffterRecoilDamge =
                  aiActive.hp - aiActive.ability.val > 0
                    ? aiActive.hp - aiActive.ability.val
                    : 10;
                addLog(`COM Effect: Recoil damage!`);
                setComActive((prev) => ({ ...prev, hp: hpAffterRecoilDamge })); // Update UI HP berkurang
              } else if (aiActive.ability.type === "FROZEN") {
                aiActive.isFrozen = true;
                addLog(`COM Effect: Recharging...`);
                setComActive({ ...aiActive }); // Update UI Frozen
              }
            }

            const predictedNewHp = playerActive.hp - damageDealt;
            if (predictedNewHp <= 0) {
              addToGraveyard("PLAYER", playerActive);
              setPlayerActive(null);
              setPlayerKO((prev) => {
                const s = playerActive.type === "FUSION" ? prev + 2 : prev + 1;
                if (s >= 6) {
                  setWinner("COM");
                  audioManager.stopBGM();
                }
                return s;
              });
            } else {
              setPlayerActive((prev) => ({
                ...prev,
                hp: prev.hp - damageDealt,
              }));
            }
            setIsAttacking(false);
          }

          await wait(800);

          // --- 8. END TURN ---
          if (isCurrentEffect) {
            cleanUpTurn("COM");
            drawCard("PLAYER");
            setTurn("PLAYER");
            startTurnBuffs("PLAYER");
            addLog("Giliran Player");
          }
        } catch (error) {
          if (error.message !== "Turn Cancelled") console.error(error);
        }

        // UNLOCK AI
        aiProcessing.current = false;
      };

      runComTurn();
    }

    return () => {
      isCurrentEffect = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner]);

  // ... (Return Statement TETAP SAMA) ...
  return {
    gameState: {
      turn,
      logs,
      winner,
      playerKO,
      comKO,
      isAttacking,
      attackerName,
      selectedMagicCard,
      selectedFusionCard,
      fusionSacrifices,
    },
    player: {
      hand: playerHand,
      bench: playerBench,
      active: playerActive,
      deck: playerDeck,
      graveyard: playerGraveyard,
    },
    com: {
      hand: comHand,
      bench: comBench,
      active: comActive,
      deck: comDeck,
      graveyard: comGraveyard,
    },
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
      },
    },
  };
}
