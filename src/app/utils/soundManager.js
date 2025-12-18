// utils/soundManager.js

// URL Sampel Suara (Bisa diganti dengan file lokal di folder /public)
const SOUNDS = {
    bgm: "/sounds/battle-bgm.mp3", // Epic Battle Music
    draw: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3", // Card Flip
    place: "/sounds/place-card.mp3", // Card Place
    attack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8227d81a4b.mp3", // Sword Slash
    win: "/sounds/fanfare.mp3", // Win Jingle
  };
  
  class SoundManager {
    constructor() {
      if (typeof window !== "undefined") {
        this.bgm = new Audio(SOUNDS.bgm);
        this.bgm.loop = true;
        this.bgm.volume = 0.3; // Volume BGM 30%
        
        this.sfx = {
          draw: new Audio(SOUNDS.draw),
          place: new Audio(SOUNDS.place),
          attack: new Audio(SOUNDS.attack),
          win: new Audio(SOUNDS.win),
        };
      }
    }
  
    playBGM() {
      if (this.bgm && this.bgm.paused) {
        this.bgm.play().catch(e => console.log("Audio autoplay blocked until interaction"));
      }
    }
  
    stopBGM() {
      if (this.bgm) {
        this.bgm.pause();
        this.bgm.currentTime = 0;
      }
    }
  
    playSFX(type) {
      if (this.sfx && this.sfx[type]) {
        const sound = this.sfx[type];
        sound.currentTime = 0; // Reset agar bisa dispam
        sound.play().catch(e => {});
      }
    }
  }
  
  // Singleton instance
  export const audioManager = new SoundManager();