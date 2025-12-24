import { useState, useEffect, useRef } from "react";
import { generateDeck } from "../utils/gameData";
import { audioManager } from "../utils/soundManager";
import { useReducer } from "react";
import { gameReducer, initialState } from "../reducer/gameReducer";

export default function useTCGGame() {
  // ... (State & Variable lain TETAP SAMA) ...
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // 1. BUAT REF (CCTV)
  const stateRef = useRef(gameState);

  // 2. SINKRONISASI (Setiap kali state berubah, update CCTV)
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Destructure biar gampang dipanggil di UI
  const {
    playerActive,
    playerDeck,
    playerBench,
    playerHand,
    playerGraveyard,
    playerKO,
    comDeck,
    comHand,
    comBench,
    comActive,
    comGraveyard,
    comKO,
    turn,
    winner,
  } = gameState;

  const [logs, setLogs] = useState(["Game Start!"]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackerName, setAttackerName] = useState(null);
  const [selectedMagicCard, setSelectedMagicCard] = useState(null);
  const [selectedFusionCard, setSelectedFusionCard] = useState(null);
  const [fusionSacrifices, setFusionSacrifices] = useState([]);

  // --- REFS PENTING (FIX BUG) ---
  const processingDraw = useRef(false);
  const aiProcessing = useRef(false); // <--- TAMBAHAN: Mencegah AI jalan 2x

  const addLog = (msg) => setLogs((prev) => [msg, ...prev].slice(0, 15)); // Perpanjang log dikit jadi 15
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const startNewGame = () => {
    // ... (Logika Start Game TETAP SAMA) ...
    audioManager.playBGM();

    dispatch({
      type: "RESET_SCORE",
    });

    //Com Generate Deck
    dispatch({
      type: "GENERATE_DECK",
      payload: { who: "COM" },
    });

    for (let i = 0; i < 5; i++) {
      dispatch({
        type: "DRAW_CARD",
        payload: { who: "COM" },
      });
    }
    //Player Generate Deck
    dispatch({
      type: "GENERATE_DECK",
      payload: { who: "PLAYER" },
    });

    for (let i = 0; i < 5; i++) {
      dispatch({
        type: "DRAW_CARD",
        payload: { who: "PLAYER" },
      });
    }
    setLogs(["Game Start!"]);
    setSelectedMagicCard(null);
    setSelectedFusionCard(null);
    setFusionSacrifices([]);

    // Reset Refs
    processingDraw.current = false;
    aiProcessing.current = false;
  };

  // Pastikan attack logic juga sudah benar (menggunakan setTurn("COM"))
  const applyMagicEffect = (targetCard, isActiveSlot = false) => {
    if (!selectedMagicCard) return false;

    dispatch({
      type: "APPLY_MAGIC_PLAYER",
      payload: {
        who: "PLAYER",
        card: selectedMagicCard,
        targetCard: targetCard,
        isActiveSlot: isActiveSlot,
      },
    });
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
      dispatch({
        type: "PLAY_CARD",
        payload: { who: "PLAYER", card, card },
      });
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
      executeInstantMagic(card, "PLAYER");
      setSelectedMagicCard(null);
      setSelectedFusionCard(null);
    }
  };
  const executeReshuffleSkill = async () => {
    addLog("🔄 Mengaktifkan Skill Reshuffle!");

    // --- FASE 1: BUANG KARTU (DISCARD) ---
    // Panggil Reducer untuk buang kartu semua orang
    dispatch({ type: "SKILL_RESHUFFLE_DISCARD" });

    // Tunggu animasi kartu masuk kuburan (misal 1 detik)
    // Biar user sadar "Oh, kartunya dibuang semua"
    await wait(1000);

    // --- FASE 2: DRAW 5 KARTU (ANIMASI SATU PER SATU) ---
    // Kita loop 5 kali
    for (let i = 0; i < 5; i++) {
      // Player Draw
      dispatch({ type: "DRAW_CARD", payload: { who: "PLAYER" } });

      // COM Draw (Bisa barengan atau gantian, di sini contoh barengan)
      dispatch({ type: "DRAW_CARD", payload: { who: "COM" } });

      // TUNGGU ANIMASI TERBANG (Penting!)
      // Jeda 500ms per kartu biar kelihatan 'sret... sret... sret...'
      await wait(500);
    }
  };
  const executeInstantMagic = (
    card,
    userWhoPlayed,
  ) => {

    // 2. LOGIKA EFEK
    if (card.effect === "GLOBAL_SHUFFLE") {
      executeReshuffleSkill();
      addLog(`INSTANT: ${userWhoPlayed} casts SHUFFLE! Both redraw 5.`);
    } else if (card.effect === "GLOBAL_BOUNCE") {
      dispatch({
        type: "SKILL_GLOBAL_BOUNCE",
        payload: { who: "PLAYER", card: card },
      });
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
    dispatch({
      type: "PLAY_ACTIVE",
      payload: { who: "PLAYER", card: card },
    });
    addLog(`Player: ${card.name} -> Active!`);
  };

  // --- LOGIC 3: EKSEKUSI SUMMON ---
  const executeFusionSummon = (sacrifices) => {
    dispatch({
      type: "SUMMON_FUSION",
      payload: {
        who: "PLAYER",
        sacrifices: sacrifices,
        card: selectedFusionCard,
      },
    });

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
      dispatch({
        type: "END_TURN",
      });
      return;
    }
    setIsAttacking(true);
    setAttackerName("PLAYER");
    audioManager.playSFX("attack");

    setTimeout(() => {
      dispatch({
        type: "ATTACK",
        payload: { who: "PLAYER" },
      });
      dispatch({
        type: "END_TURN",
      });
      setIsAttacking(false);

    }, 500);
  };

  // --- AI LOGIC (COM) YANG SUDAH DIPERBAIKI ---
  useEffect(() => {
    let isCurrentEffect = true;
    console.log("masuk sini kan?", turn);

    if (comKO >= 6) {
      dispatch({
        type: "SET_WINNER",
        payload: { who: "PLAYER" },
      });
    }
    if (playerKO >= 6) {
      dispatch({
        type: "SET_WINNER",
        payload: { who: "COM" },
      });
    }

    if (turn === "COM" && !winner) {
      const runComTurn = async () => {
        const wait = async (ms) => {
          await new Promise((r) => setTimeout(r, ms));
          if (!isCurrentEffect) throw new Error("Turn Cancelled");
        };

        try {
          //musuh ambil kartu
          dispatch({
            type: "DRAW_CARD",
            payload: { who: "COM" },
          });

          await wait(1000);

          //musuh set Monster
          const currentRealTimeHand = stateRef.current.comHand;
          
          const monsterinHand = currentRealTimeHand.filter(
            (c) => c.type === "MONSTER"
          );
          const magicInHand = currentRealTimeHand.filter(
            (c) => c.type === "MAGIC"
          );
          const fusionCards = currentRealTimeHand.filter(
            (c) => c.type === "FUSION"
          );
          const InstantCards = currentRealTimeHand.filter(
            (c) => c.type === "INSTANT"
          );

          for (const card of monsterinHand) {
            // A. Dispatch (Kartu Turun)
            dispatch({
              type: "PLAY_CARD",
              payload: { who: "COM", card: card },
            });

            // B. TUNGGU ANIMASI (Misal 1.5 detik)
            // Code akan berhenti di baris ini selama 1.5 detik sebelum lanjut ke kartu berikutnya
            await wait(1000);
          }

          for (const card of fusionCards) {
            // "Hei Reducer, coba fusion kartu ini dong kalau bahannya ada."
            dispatch({
              type: "TRY_FUSION_SUMMON",
              payload: { who: "COM", card: card },
            });

            // Kita kasih jeda buat jaga-jaga kalau sukses
            // Kalau gagal (state gak berubah), jeda ini cuma bikin AI "mikir" sebentar, gak masalah.
            await wait(1500);
          }

          //musuh set Active
          // console.log("comBench", comBench)
          if (comActive === null) {
            dispatch({
              type: "PLAY_ACTIVE_COM",
              payload: { who: "COM" },
            });
          }
          await wait(2000);

          for (const card of magicInHand) {
            dispatch({
              type: "APPLY_MAGIC_PLAYER",
              payload: {
                who: "COM",
                card: card,
                targetCard: card,
                isActiveSlot: true,
              },
            });
            await wait(1000);
          }

          for (const card of InstantCards) {
            if (
              card.effect === "GLOBAL_SHUFFLE" &&
              currentRealTimeHand.length <= 2
            ) {
              executeReshuffleSkill();
            } else if (
              card.effect === "GLOBAL_BOUNCE" &&
              playerBench.length > 0
            ) {
              dispatch({
                type: "SKILL_GLOBAL_BOUNCE",
                payload: { who: "COM", card: card },
              });
            }

            await wait(1000);
          }
          await wait(2000);

          //musuh attack
          const currentRealActive = stateRef.current.comActive
          if (currentRealActive && currentRealActive.isFrozen !== true && playerActive) {
            setIsAttacking(true);
            setAttackerName("COM");
            audioManager.playSFX("attack");
            await wait(500);
            dispatch({
              type: "ATTACK",
              payload: { who: "COM" },
            });
            setIsAttacking(false);

            await wait(1000);
          }
          dispatch({
            type: "END_TURN",
          });
        } catch (error) {
          if (error.message !== "Turn Cancelled") console.error(error);
        }
      };
      runComTurn();
    } else if (turn === "PLAYER" && !winner) {
      dispatch({
        type: "DRAW_CARD",
        payload: { who: "PLAYER" },
      });
    }
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
        dispatch({
          type: "END_TURN",
        });
      },
    },
  };
}
